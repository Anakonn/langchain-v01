---
translated: true
---

# Seguimiento de SageMaker

>[Amazon SageMaker](https://aws.amazon.com/sagemaker/) es un servicio totalmente administrado que se utiliza para crear, entrenar y desplegar modelos de aprendizaje automático (ML) de manera rápida y sencilla.

>[Amazon SageMaker Experiments](https://docs.aws.amazon.com/sagemaker/latest/dg/experiments.html) es una capacidad de `Amazon SageMaker` que le permite organizar, rastrear, comparar y evaluar experimentos de ML y versiones de modelos.

Este cuaderno muestra cómo se puede usar el Callback de LangChain para registrar y rastrear los mensajes y otros hiperparámetros de LLM en `SageMaker Experiments`. Aquí, usamos diferentes escenarios para mostrar la capacidad:

* **Escenario 1**: *LLM único* - Un caso en el que se usa un solo modelo LLM para generar salida en función de un mensaje dado.
* **Escenario 2**: *Cadena secuencial* - Un caso en el que se usa una cadena secuencial de dos modelos LLM.
* **Escenario 3**: *Agente con herramientas (Cadena de pensamiento)* - Un caso en el que se utilizan varias herramientas (búsqueda y matemáticas) además de un LLM.

En este cuaderno, crearemos un solo experimento para registrar los mensajes de cada escenario.

## Instalación y configuración

```python
%pip install --upgrade --quiet  sagemaker
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  google-search-results
```

Primero, configure las claves de API requeridas

* OpenAI: https://platform.openai.com/account/api-keys (Para el modelo LLM de OpenAI)
* Google SERP API: https://serpapi.com/manage-api-key (Para la herramienta de búsqueda de Google)

```python
import os

## Add your API keys below
os.environ["OPENAI_API_KEY"] = "<ADD-KEY-HERE>"
os.environ["SERPAPI_API_KEY"] = "<ADD-KEY-HERE>"
```

```python
from langchain_community.callbacks.sagemaker_callback import SageMakerCallbackHandler
```

```python
from langchain.agents import initialize_agent, load_tools
from langchain.chains import LLMChain, SimpleSequentialChain
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from sagemaker.analytics import ExperimentAnalytics
from sagemaker.experiments.run import Run
from sagemaker.session import Session
```

## Seguimiento de mensajes de LLM

```python
# LLM Hyperparameters
HPARAMS = {
    "temperature": 0.1,
    "model_name": "gpt-3.5-turbo-instruct",
}

# Bucket used to save prompt logs (Use `None` is used to save the default bucket or otherwise change it)
BUCKET_NAME = None

# Experiment name
EXPERIMENT_NAME = "langchain-sagemaker-tracker"

# Create SageMaker Session with the given bucket
session = Session(default_bucket=BUCKET_NAME)
```

### Escenario 1 - LLM

```python
RUN_NAME = "run-scenario-1"
PROMPT_TEMPLATE = "tell me a joke about {topic}"
INPUT_VARIABLES = {"topic": "fish"}
```

```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # Create SageMaker Callback
    sagemaker_callback = SageMakerCallbackHandler(run)

    # Define LLM model with callback
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # Create prompt template
    prompt = PromptTemplate.from_template(template=PROMPT_TEMPLATE)

    # Create LLM Chain
    chain = LLMChain(llm=llm, prompt=prompt, callbacks=[sagemaker_callback])

    # Run chain
    chain.run(**INPUT_VARIABLES)

    # Reset the callback
    sagemaker_callback.flush_tracker()
```

### Escenario 2 - Cadena secuencial

```python
RUN_NAME = "run-scenario-2"

PROMPT_TEMPLATE_1 = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
PROMPT_TEMPLATE_2 = """You are a play critic from the New York Times. Given the synopsis of play, it is your job to write a review for that play.
Play Synopsis: {synopsis}
Review from a New York Times play critic of the above play:"""

INPUT_VARIABLES = {
    "input": "documentary about good video games that push the boundary of game design"
}
```

```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # Create SageMaker Callback
    sagemaker_callback = SageMakerCallbackHandler(run)

    # Create prompt templates for the chain
    prompt_template1 = PromptTemplate.from_template(template=PROMPT_TEMPLATE_1)
    prompt_template2 = PromptTemplate.from_template(template=PROMPT_TEMPLATE_2)

    # Define LLM model with callback
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # Create chain1
    chain1 = LLMChain(llm=llm, prompt=prompt_template1, callbacks=[sagemaker_callback])

    # Create chain2
    chain2 = LLMChain(llm=llm, prompt=prompt_template2, callbacks=[sagemaker_callback])

    # Create Sequential chain
    overall_chain = SimpleSequentialChain(
        chains=[chain1, chain2], callbacks=[sagemaker_callback]
    )

    # Run overall sequential chain
    overall_chain.run(**INPUT_VARIABLES)

    # Reset the callback
    sagemaker_callback.flush_tracker()
```

### Escenario 3 - Agente con herramientas

```python
RUN_NAME = "run-scenario-3"
PROMPT_TEMPLATE = "Who is the oldest person alive? And what is their current age raised to the power of 1.51?"
```

```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # Create SageMaker Callback
    sagemaker_callback = SageMakerCallbackHandler(run)

    # Define LLM model with callback
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # Define tools
    tools = load_tools(["serpapi", "llm-math"], llm=llm, callbacks=[sagemaker_callback])

    # Initialize agent with all the tools
    agent = initialize_agent(
        tools, llm, agent="zero-shot-react-description", callbacks=[sagemaker_callback]
    )

    # Run agent
    agent.run(input=PROMPT_TEMPLATE)

    # Reset the callback
    sagemaker_callback.flush_tracker()
```

## Cargar datos de registro

Una vez que se registran los mensajes, podemos cargarlos y convertirlos fácilmente a un DataFrame de Pandas de la siguiente manera.

```python
# Load
logs = ExperimentAnalytics(experiment_name=EXPERIMENT_NAME)

# Convert as pandas dataframe
df = logs.dataframe(force_refresh=True)

print(df.shape)
df.head()
```

Como se puede ver arriba, hay tres ejecuciones (filas) en el experimento que corresponden a cada escenario. Cada ejecución registra los mensajes y la configuración/hiperparámetros de LLM relacionados como json y se guardan en el bucket s3. Siéntase libre de cargar y explorar los datos de registro de cada ruta json.
