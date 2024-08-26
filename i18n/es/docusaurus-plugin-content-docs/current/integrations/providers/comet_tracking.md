---
translated: true
---

# Cometa

>[Cometa](https://www.comet.com/) plataforma de aprendizaje automático se integra con tu infraestructura y herramientas existentes para que puedas administrar, visualizar y optimizar modelos, desde ejecuciones de entrenamiento hasta el monitoreo de producción.

![](https://user-images.githubusercontent.com/7529846/230328046-a8b18c51-12e3-4617-9b39-97614a571a2d.png)

En esta guía demostraremos cómo rastrear tus Experimentos de Langchain, Métricas de Evaluación y Sesiones de LLM con [Cometa](https://www.comet.com/site/?utm_source=langchain&utm_medium=referral&utm_campaign=comet_notebook).

<a target="_blank" href="https://colab.research.google.com/github/hwchase17/langchain/blob/master/docs/ecosystem/comet_tracking">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Abrir en Colab"/>
</a>

**Proyecto de ejemplo:** [Cometa con LangChain](https://www.comet.com/examples/comet-example-langchain/view/b5ZThK6OFdhKWVSP3fDfRtrNF/panels?utm_source=langchain&utm_medium=referral&utm_campaign=comet_notebook)

![](https://user-images.githubusercontent.com/7529846/230326720-a9711435-9c6f-4edb-a707-94b67271ab25.png)

### Instalar Cometa y Dependencias

```python
%pip install --upgrade --quiet  comet_ml langchain langchain-openai google-search-results spacy textstat pandas


!{sys.executable} -m spacy download en_core_web_sm
```

### Inicializar Cometa y Establecer tus Credenciales

Puedes obtener tu [Clave API de Cometa aquí](https://www.comet.com/signup?utm_source=langchain&utm_medium=referral&utm_campaign=comet_notebook) o hacer clic en el enlace después de inicializar Cometa

```python
import comet_ml

comet_ml.init(project_name="comet-example-langchain")
```

### Establecer las credenciales de OpenAI y SerpAPI

Necesitarás una [Clave API de OpenAI](https://platform.openai.com/account/api-keys) y una [Clave API de SerpAPI](https://serpapi.com/dashboard) para ejecutar los siguientes ejemplos

```python
import os

os.environ["OPENAI_API_KEY"] = "..."
# os.environ["OPENAI_ORGANIZATION"] = "..."
os.environ["SERPAPI_API_KEY"] = "..."
```

### Escenario 1: Usando solo un LLM

```python
from langchain.callbacks import CometCallbackHandler, StdOutCallbackHandler
from langchain_openai import OpenAI

comet_callback = CometCallbackHandler(
    project_name="comet-example-langchain",
    complexity_metrics=True,
    stream_logs=True,
    tags=["llm"],
    visualizations=["dep"],
)
callbacks = [StdOutCallbackHandler(), comet_callback]
llm = OpenAI(temperature=0.9, callbacks=callbacks, verbose=True)

llm_result = llm.generate(["Tell me a joke", "Tell me a poem", "Tell me a fact"] * 3)
print("LLM result", llm_result)
comet_callback.flush_tracker(llm, finish=True)
```

### Escenario 2: Usando un LLM en una Cadena

```python
from langchain.callbacks import CometCallbackHandler, StdOutCallbackHandler
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

comet_callback = CometCallbackHandler(
    complexity_metrics=True,
    project_name="comet-example-langchain",
    stream_logs=True,
    tags=["synopsis-chain"],
)
callbacks = [StdOutCallbackHandler(), comet_callback]
llm = OpenAI(temperature=0.9, callbacks=callbacks)

template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=callbacks)

test_prompts = [{"title": "Documentary about Bigfoot in Paris"}]
print(synopsis_chain.apply(test_prompts))
comet_callback.flush_tracker(synopsis_chain, finish=True)
```

### Escenario 3: Usando un Agente con Herramientas

```python
from langchain.agents import initialize_agent, load_tools
from langchain.callbacks import CometCallbackHandler, StdOutCallbackHandler
from langchain_openai import OpenAI

comet_callback = CometCallbackHandler(
    project_name="comet-example-langchain",
    complexity_metrics=True,
    stream_logs=True,
    tags=["agent"],
)
callbacks = [StdOutCallbackHandler(), comet_callback]
llm = OpenAI(temperature=0.9, callbacks=callbacks)

tools = load_tools(["serpapi", "llm-math"], llm=llm, callbacks=callbacks)
agent = initialize_agent(
    tools,
    llm,
    agent="zero-shot-react-description",
    callbacks=callbacks,
    verbose=True,
)
agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?"
)
comet_callback.flush_tracker(agent, finish=True)
```

### Escenario 4: Usando Métricas de Evaluación Personalizadas

El `CometCallbackManager` también te permite definir y usar Métricas de Evaluación Personalizadas para evaluar las salidas generadas por tu modelo. Echemos un vistazo a cómo funciona esto.

En el fragmento de código a continuación, usaremos la métrica [ROUGE](https://huggingface.co/spaces/evaluate-metric/rouge) para evaluar la calidad de un resumen generado de un prompt de entrada.

```python
%pip install --upgrade --quiet  rouge-score
```

```python
from langchain.callbacks import CometCallbackHandler, StdOutCallbackHandler
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from rouge_score import rouge_scorer


class Rouge:
    def __init__(self, reference):
        self.reference = reference
        self.scorer = rouge_scorer.RougeScorer(["rougeLsum"], use_stemmer=True)

    def compute_metric(self, generation, prompt_idx, gen_idx):
        prediction = generation.text
        results = self.scorer.score(target=self.reference, prediction=prediction)

        return {
            "rougeLsum_score": results["rougeLsum"].fmeasure,
            "reference": self.reference,
        }


reference = """
The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building.
It was the first structure to reach a height of 300 metres.

It is now taller than the Chrysler Building in New York City by 5.2 metres (17 ft)
Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France .
"""
rouge_score = Rouge(reference=reference)

template = """Given the following article, it is your job to write a summary.
Article:
{article}
Summary: This is the summary for the above article:"""
prompt_template = PromptTemplate(input_variables=["article"], template=template)

comet_callback = CometCallbackHandler(
    project_name="comet-example-langchain",
    complexity_metrics=False,
    stream_logs=True,
    tags=["custom_metrics"],
    custom_metrics=rouge_score.compute_metric,
)
callbacks = [StdOutCallbackHandler(), comet_callback]
llm = OpenAI(temperature=0.9)

synopsis_chain = LLMChain(llm=llm, prompt=prompt_template)

test_prompts = [
    {
        "article": """
                 The tower is 324 metres (1,063 ft) tall, about the same height as
                 an 81-storey building, and the tallest structure in Paris. Its base is square,
                 measuring 125 metres (410 ft) on each side.
                 During its construction, the Eiffel Tower surpassed the
                 Washington Monument to become the tallest man-made structure in the world,
                 a title it held for 41 years until the Chrysler Building
                 in New York City was finished in 1930.

                 It was the first structure to reach a height of 300 metres.
                 Due to the addition of a broadcasting aerial at the top of the tower in 1957,
                 it is now taller than the Chrysler Building by 5.2 metres (17 ft).

                 Excluding transmitters, the Eiffel Tower is the second tallest
                 free-standing structure in France after the Millau Viaduct.
                 """
    }
]
print(synopsis_chain.apply(test_prompts, callbacks=callbacks))
comet_callback.flush_tracker(synopsis_chain, finish=True)
```

### Rastreador de Devolución de Llamada

Hay otra integración con Cometa:

Ver un [ejemplo](/docs/integrations/callbacks/comet_tracing).

```python
from langchain.callbacks.tracers.comet import CometTracer
```
