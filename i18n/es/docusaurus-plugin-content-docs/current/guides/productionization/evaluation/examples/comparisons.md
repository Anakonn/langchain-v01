---
translated: true
---

# Comparación de las salidas de la cadena

[![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/examples/comparisons.ipynb)

Supongamos que tienes dos indicaciones diferentes (o LLM). ¿Cómo sabes cuál generará "mejores" resultados?

Una forma automatizada de predecir la configuración preferida es usar un `PairwiseStringEvaluator` como el `PairwiseStringEvalChain`<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1). Esta cadena solicita a un LLM que seleccione qué salida se prefiere, dado un input específico.

Para esta evaluación, necesitaremos 3 cosas:
1. Un evaluador
2. Un conjunto de datos de entradas
3. 2 (o más) LLM, Cadenas o Agentes para comparar

Luego agregaremos los resultados para determinar el modelo preferido.

### Paso 1. Crear el Evaluador

En este ejemplo, utilizarás gpt-4 para seleccionar qué salida se prefiere.

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain.evaluation import load_evaluator

eval_chain = load_evaluator("pairwise_string")
```

### Paso 2. Seleccionar el conjunto de datos

Si ya tienes datos de uso real para tu LLM, puedes usar una muestra representativa. Más ejemplos
proporcionan resultados más confiables. Utilizaremos algunas consultas de ejemplo que alguien podría tener sobre cómo usar langchain aquí.

```python
from langchain.evaluation.loading import load_dataset

dataset = load_dataset("langchain-howto-queries")
```

```output
Found cached dataset parquet (/Users/wfh/.cache/huggingface/datasets/LangChainDatasets___parquet/LangChainDatasets--langchain-howto-queries-bbb748bbee7e77aa/0.0.0/14a00e99c0d15a23649d0db8944380ac81082d4b021f398733dd84f3a6c569a7)
```

```output
  0%|          | 0/1 [00:00<?, ?it/s]
```

### Paso 3. Definir los modelos a comparar

Estaremos comparando dos agentes en este caso.

```python
from langchain.agents import AgentType, Tool, initialize_agent
from langchain_community.utilities import SerpAPIWrapper
from langchain_openai import ChatOpenAI

# Initialize the language model
# You can add your own OpenAI API key by adding openai_api_key="<your_api_key>"
llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613")

# Initialize the SerpAPIWrapper for search functionality
# Replace <your_api_key> in openai_api_key="<your_api_key>" with your actual SerpAPI key.
search = SerpAPIWrapper()

# Define a list of tools offered by the agent
tools = [
    Tool(
        name="Search",
        func=search.run,
        coroutine=search.arun,
        description="Useful when you need to answer questions about current events. You should ask targeted questions.",
    ),
]
```

```python
functions_agent = initialize_agent(
    tools, llm, agent=AgentType.OPENAI_MULTI_FUNCTIONS, verbose=False
)
conversations_agent = initialize_agent(
    tools, llm, agent=AgentType.CHAT_ZERO_SHOT_REACT_DESCRIPTION, verbose=False
)
```

### Paso 4. Generar respuestas

Generaremos salidas para cada uno de los modelos antes de evaluarlos.

```python
import asyncio

from tqdm.notebook import tqdm

results = []
agents = [functions_agent, conversations_agent]
concurrency_level = 6  # How many concurrent agents to run. May need to decrease if OpenAI is rate limiting.

# We will only run the first 20 examples of this dataset to speed things up
# This will lead to larger confidence intervals downstream.
batch = []
for example in tqdm(dataset[:20]):
    batch.extend([agent.acall(example["inputs"]) for agent in agents])
    if len(batch) >= concurrency_level:
        batch_results = await asyncio.gather(*batch, return_exceptions=True)
        results.extend(list(zip(*[iter(batch_results)] * 2)))
        batch = []
if batch:
    batch_results = await asyncio.gather(*batch, return_exceptions=True)
    results.extend(list(zip(*[iter(batch_results)] * 2)))
```

```output
  0%|          | 0/20 [00:00<?, ?it/s]
```

## Paso 5. Evaluar pares

Ahora es el momento de evaluar los resultados. Para cada respuesta del agente, ejecuta la cadena de evaluación para seleccionar qué salida se prefiere (o devolver un empate).

Selecciona aleatoriamente el orden de entrada para reducir la probabilidad de que se prefiera un modelo solo porque se presenta primero.

```python
import random


def predict_preferences(dataset, results) -> list:
    preferences = []

    for example, (res_a, res_b) in zip(dataset, results):
        input_ = example["inputs"]
        # Flip a coin to reduce persistent position bias
        if random.random() < 0.5:
            pred_a, pred_b = res_a, res_b
            a, b = "a", "b"
        else:
            pred_a, pred_b = res_b, res_a
            a, b = "b", "a"
        eval_res = eval_chain.evaluate_string_pairs(
            prediction=pred_a["output"] if isinstance(pred_a, dict) else str(pred_a),
            prediction_b=pred_b["output"] if isinstance(pred_b, dict) else str(pred_b),
            input=input_,
        )
        if eval_res["value"] == "A":
            preferences.append(a)
        elif eval_res["value"] == "B":
            preferences.append(b)
        else:
            preferences.append(None)  # No preference
    return preferences
```

```python
preferences = predict_preferences(dataset, results)
```

**Imprime la relación de preferencias.**

```python
from collections import Counter

name_map = {
    "a": "OpenAI Functions Agent",
    "b": "Structured Chat Agent",
}
counts = Counter(preferences)
pref_ratios = {k: v / len(preferences) for k, v in counts.items()}
for k, v in pref_ratios.items():
    print(f"{name_map.get(k)}: {v:.2%}")
```

```output
OpenAI Functions Agent: 95.00%
None: 5.00%
```

### Estimar intervalos de confianza

Los resultados parecen bastante claros, pero si quieres tener una mejor idea de cuán seguros estamos de que el modelo "A" (el Agente de Funciones de OpenAI) es el modelo preferido, podemos calcular intervalos de confianza.

A continuación, usa el puntaje de Wilson para estimar el intervalo de confianza.

```python
from math import sqrt


def wilson_score_interval(
    preferences: list, which: str = "a", z: float = 1.96
) -> tuple:
    """Estimate the confidence interval using the Wilson score.

    See: https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval#Wilson_score_interval
    for more details, including when to use it and when it should not be used.
    """
    total_preferences = preferences.count("a") + preferences.count("b")
    n_s = preferences.count(which)

    if total_preferences == 0:
        return (0, 0)

    p_hat = n_s / total_preferences

    denominator = 1 + (z**2) / total_preferences
    adjustment = (z / denominator) * sqrt(
        p_hat * (1 - p_hat) / total_preferences
        + (z**2) / (4 * total_preferences * total_preferences)
    )
    center = (p_hat + (z**2) / (2 * total_preferences)) / denominator
    lower_bound = min(max(center - adjustment, 0.0), 1.0)
    upper_bound = min(max(center + adjustment, 0.0), 1.0)

    return (lower_bound, upper_bound)
```

```python
for which_, name in name_map.items():
    low, high = wilson_score_interval(preferences, which=which_)
    print(
        f'The "{name}" would be preferred between {low:.2%} and {high:.2%} percent of the time (with 95% confidence).'
    )
```

```output
The "OpenAI Functions Agent" would be preferred between 83.18% and 100.00% percent of the time (with 95% confidence).
The "Structured Chat Agent" would be preferred between 0.00% and 16.82% percent of the time (with 95% confidence).
```

**Imprime el valor p.**

```python
from scipy import stats

preferred_model = max(pref_ratios, key=pref_ratios.get)
successes = preferences.count(preferred_model)
n = len(preferences) - preferences.count(None)
p_value = stats.binom_test(successes, n, p=0.5, alternative="two-sided")
print(
    f"""The p-value is {p_value:.5f}. If the null hypothesis is true (i.e., if the selected eval chain actually has no preference between the models),
then there is a {p_value:.5%} chance of observing the {name_map.get(preferred_model)} be preferred at least {successes}
times out of {n} trials."""
)
```

```output
The p-value is 0.00000. If the null hypothesis is true (i.e., if the selected eval chain actually has no preference between the models),
then there is a 0.00038% chance of observing the OpenAI Functions Agent be preferred at least 19
times out of 19 trials.

/var/folders/gf/6rnp_mbx5914kx7qmmh7xzmw0000gn/T/ipykernel_15978/384907688.py:6: DeprecationWarning: 'binom_test' is deprecated in favour of 'binomtest' from version 1.7.0 and will be removed in Scipy 1.12.0.
  p_value = stats.binom_test(successes, n, p=0.5, alternative="two-sided")
```

<a name="cite_note-1"></a>_1. Nota: Las evaluaciones automatizadas siguen siendo un tema de investigación abierto y se deben usar junto con otros enfoques de evaluación.
Las preferencias de LLM exhiben sesgos, incluidos los banales como el orden de las salidas.
Al elegir preferencias, es posible que no se tenga en cuenta la "verdad fundamental", lo que puede llevar a puntuaciones que no se basan en la utilidad._
