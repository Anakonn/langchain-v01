---
translated: true
---

# Comparaison des sorties de chaîne

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/examples/comparisons.ipynb)

Supposons que vous ayez deux prompts (ou LLM) différents. Comment savez-vous lequel générera de "meilleurs" résultats ?

Une façon automatisée de prédire la configuration préférée est d'utiliser un `PairwiseStringEvaluator` comme le `PairwiseStringEvalChain`<a name="cite_ref-1"></a>[<sup>[1]</sup>](#cite_note-1). Cette chaîne invite un LLM à sélectionner quelle sortie est préférée, étant donné une entrée spécifique.

Pour cette évaluation, nous aurons besoin de 3 choses :
1. Un évaluateur
2. Un jeu de données d'entrées
3. 2 (ou plus) LLM, Chains ou Agents à comparer

Ensuite, nous agrègerons les résultats pour déterminer le modèle préféré.

### Étape 1. Créer l'évaluateur

Dans cet exemple, vous utiliserez gpt-4 pour sélectionner quelle sortie est préférée.

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain.evaluation import load_evaluator

eval_chain = load_evaluator("pairwise_string")
```

### Étape 2. Sélectionner le jeu de données

Si vous avez déjà des données d'utilisation réelles pour votre LLM, vous pouvez utiliser un échantillon représentatif. Plus il y a d'exemples, plus les résultats sont fiables. Nous utiliserons ici quelques requêtes d'exemple que quelqu'un pourrait avoir sur la façon d'utiliser langchain.

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

### Étape 3. Définir les modèles à comparer

Nous comparerons deux agents dans ce cas.

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

### Étape 4. Générer les réponses

Nous allons générer les sorties pour chacun des modèles avant de les évaluer.

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

## Étape 5. Évaluer les paires

Il est maintenant temps d'évaluer les résultats. Pour chaque réponse d'agent, exécutez la chaîne d'évaluation pour sélectionner quelle sortie est préférée (ou renvoyer une égalité).

Sélectionnez aléatoirement l'ordre des entrées pour réduire la probabilité qu'un modèle soit préféré simplement parce qu'il est présenté en premier.

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

**Imprimez le ratio des préférences.**

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

### Estimer les intervalles de confiance

Les résultats semblent assez clairs, mais si vous voulez avoir une meilleure idée de la confiance que nous avons dans le fait que le modèle "A" (l'agent de fonctions OpenAI) est le modèle préféré, nous pouvons calculer les intervalles de confiance.

Ci-dessous, utilisez le score de Wilson pour estimer l'intervalle de confiance.

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

**Imprimez la valeur p.**

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

<a name="cite_note-1"></a>_1. Remarque : les évaluations automatisées sont encore un sujet de recherche ouvert et sont mieux utilisées avec d'autres approches d'évaluation.
Les préférences des LLM présentent des biais, y compris des biais banals comme l'ordre des sorties.
Dans le choix des préférences, la "vérité terrain" peut ne pas être prise en compte, ce qui peut conduire à des scores qui ne sont pas ancrés dans l'utilité._
