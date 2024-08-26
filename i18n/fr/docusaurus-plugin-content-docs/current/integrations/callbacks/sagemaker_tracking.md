---
translated: true
---

# Suivi SageMaker

>[Amazon SageMaker](https://aws.amazon.com/sagemaker/) est un service entièrement géré qui permet de construire, d'entraîner et de déployer rapidement et facilement des modèles d'apprentissage automatique (ML).

>[Amazon SageMaker Experiments](https://docs.aws.amazon.com/sagemaker/latest/dg/experiments.html) est une fonctionnalité d'`Amazon SageMaker` qui vous permet d'organiser, de suivre, de comparer et d'évaluer les expériences ML et les versions de modèles.

Ce notebook montre comment le rappel LangChain peut être utilisé pour enregistrer et suivre les invites et d'autres hyperparamètres LLM dans `SageMaker Experiments`. Ici, nous utilisons différents scénarios pour illustrer cette fonctionnalité :

* **Scénario 1** : *LLM unique* - Un cas où un seul modèle LLM est utilisé pour générer une sortie en fonction d'une invite donnée.
* **Scénario 2** : *Chaîne séquentielle* - Un cas où une chaîne séquentielle de deux modèles LLM est utilisée.
* **Scénario 3** : *Agent avec outils (chaîne de pensée)* - Un cas où plusieurs outils (recherche et mathématiques) sont utilisés en plus d'un LLM.

Dans ce notebook, nous créerons une seule expérience pour enregistrer les invites de chaque scénario.

## Installation et configuration

```python
%pip install --upgrade --quiet  sagemaker
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  google-search-results
```

Tout d'abord, configurez les clés API requises

* OpenAI : https://platform.openai.com/account/api-keys (Pour le modèle LLM OpenAI)
* Google SERP API : https://serpapi.com/manage-api-key (Pour l'outil de recherche Google)

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

## Suivi des invites LLM

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

### Scénario 1 - LLM

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

### Scénario 2 - Chaîne séquentielle

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

### Scénario 3 - Agent avec outils

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

## Charger les données de journal

Une fois que les invites sont enregistrées, nous pouvons facilement les charger et les convertir en un dataframe Pandas comme suit.

```python
# Load
logs = ExperimentAnalytics(experiment_name=EXPERIMENT_NAME)

# Convert as pandas dataframe
df = logs.dataframe(force_refresh=True)

print(df.shape)
df.head()
```

Comme on peut le voir ci-dessus, il y a trois exécutions (lignes) dans l'expérience correspondant à chaque scénario. Chaque exécution enregistre les invites et les paramètres/hyperparamètres LLM connexes au format json et sont enregistrés dans un compartiment s3. N'hésitez pas à charger et à explorer les données de journal de chaque chemin json.
