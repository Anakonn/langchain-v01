---
translated: true
---

# Parcours LangSmith

[![Ouvrir dans Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/langsmith/walkthrough.ipynb)

LangChain facilite le prototypage d'applications et d'agents LLM. Cependant, la mise en production d'applications LLM peut s'avérer étonnamment difficile. Vous devrez itérer sur vos invites, vos chaînes et d'autres composants pour construire un produit de haute qualité.

LangSmith facilite le débogage, les tests et l'amélioration continue de vos applications LLM.

Quand cela peut-il être utile ? Vous pourriez le trouver utile lorsque vous voulez :

- Déboguer rapidement une nouvelle chaîne, un agent ou un ensemble d'outils
- Créer et gérer des jeux de données pour l'apprentissage fin, l'invite à quelques coups et l'évaluation
- Exécuter des tests de régression sur votre application pour développer en toute confiance
- Capturer les analyses de production pour obtenir des informations sur le produit et des améliorations continues

## Prérequis

**[Créez un compte LangSmith](https://smith.langchain.com/) et créez une clé API (voir le coin inférieur gauche). Familiarisez-vous avec la plateforme en parcourant la [documentation](https://docs.smith.langchain.com/)**

Notez que LangSmith est en version bêta fermée ; nous sommes en train de le déployer pour plus d'utilisateurs. Cependant, vous pouvez remplir le formulaire sur le site Web pour obtenir un accès accéléré.

Maintenant, commençons !

## Journaliser les exécutions sur LangSmith

Tout d'abord, configurez vos variables d'environnement pour dire à LangChain de journaliser les traces. Cela se fait en définissant la variable d'environnement `LANGCHAIN_TRACING_V2` sur true.
Vous pouvez indiquer à LangChain quel projet journaliser en définissant la variable d'environnement `LANGCHAIN_PROJECT` (si elle n'est pas définie, les exécutions seront journalisées dans le projet `default`). Cela créera automatiquement le projet pour vous s'il n'existe pas. Vous devez également définir les variables d'environnement `LANGCHAIN_ENDPOINT` et `LANGCHAIN_API_KEY`.

Pour plus d'informations sur d'autres moyens de configurer le traçage, veuillez consulter la [documentation LangSmith](https://docs.smith.langchain.com/docs/).

**REMARQUE :** Vous pouvez également utiliser un gestionnaire de contexte en python pour journaliser les traces à l'aide de

```python
from langchain_core.tracers.context import tracing_v2_enabled

with tracing_v2_enabled(project_name="My Project"):
    agent.run("How many people live in canada as of 2023?")
```

Cependant, dans cet exemple, nous utiliserons des variables d'environnement.

```python
%pip install --upgrade --quiet  langchain langsmith langchainhub
%pip install --upgrade --quiet  langchain-openai tiktoken pandas duckduckgo-search
```

```python
import os
from uuid import uuid4

unique_id = uuid4().hex[0:8]
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = f"Tracing Walkthrough - {unique_id}"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = "<YOUR-API-KEY>"  # Update to your API key

# Used by the agent in this tutorial
os.environ["OPENAI_API_KEY"] = "<YOUR-OPENAI-API-KEY>"
```

Créez le client langsmith pour interagir avec l'API

```python
from langsmith import Client

client = Client()
```

Créez un composant LangChain et journalisez les exécutions sur la plateforme. Dans cet exemple, nous allons créer un agent de style ReAct avec accès à un outil de recherche générale (DuckDuckGo). L'invite de l'agent peut être consultée dans le [Hub ici](https://smith.langchain.com/hub/wfh/langsmith-agent-prompt).

```python
from langchain import hub
from langchain.agents import AgentExecutor
from langchain.agents.format_scratchpad.openai_tools import (
    format_to_openai_tool_messages,
)
from langchain.agents.output_parsers.openai_tools import OpenAIToolsAgentOutputParser
from langchain_community.tools import DuckDuckGoSearchResults
from langchain_openai import ChatOpenAI

# Fetches the latest version of this prompt
prompt = hub.pull("wfh/langsmith-agent-prompt:5d466cbc")

llm = ChatOpenAI(
    model="gpt-3.5-turbo-16k",
    temperature=0,
)

tools = [
    DuckDuckGoSearchResults(
        name="duck_duck_go"
    ),  # General internet search using DuckDuckGo
]

llm_with_tools = llm.bind_tools(tools)

runnable_agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_to_openai_tool_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm_with_tools
    | OpenAIToolsAgentOutputParser()
)

agent_executor = AgentExecutor(
    agent=runnable_agent, tools=tools, handle_parsing_errors=True
)
```

Nous exécutons l'agent en parallèle sur plusieurs entrées pour réduire la latence. Les exécutions sont journalisées sur LangSmith en arrière-plan, donc la latence d'exécution n'est pas affectée.

```python
inputs = [
    "What is LangChain?",
    "What's LangSmith?",
    "When was Llama-v2 released?",
    "What is the langsmith cookbook?",
    "When did langchain first announce the hub?",
]

results = agent_executor.batch([{"input": x} for x in inputs], return_exceptions=True)
```

```python
results[:2]
```

```output
[{'input': 'What is LangChain?',
  'output': 'I\'m sorry, but I couldn\'t find any information about "LangChain". Could you please provide more context or clarify your question?'},
 {'input': "What's LangSmith?",
  'output': 'I\'m sorry, but I couldn\'t find any information about "LangSmith". It could be a company, a product, or a person. Can you provide more context or details about what you are referring to?'}]
```

En supposant que vous ayez configuré avec succès votre environnement, vos traces d'agent devraient apparaître dans la section `Projets` de l'[application](https://smith.langchain.com/). Félicitations !

![Exécutions initiales](./img/log_traces.png)

Il semble que l'agent n'utilise pas efficacement les outils. Évaluons cela pour avoir une référence.

## Évaluer l'agent

En plus de journaliser les exécutions, LangSmith vous permet également de tester et d'évaluer vos applications LLM.

Dans cette section, vous utiliserez LangSmith pour créer un jeu de données de référence et exécuter des évaluateurs assistés par l'IA sur un agent. Vous le ferez en quelques étapes :

1. Créer un jeu de données
2. Initialiser un nouvel agent à évaluer
3. Configurer les évaluateurs pour noter la sortie d'un agent
4. Exécuter l'agent sur le jeu de données et évaluer les résultats

### 1. Créer un jeu de données LangSmith

Ci-dessous, nous utilisons le client LangSmith pour créer un jeu de données à partir des questions d'entrée ci-dessus et d'une liste d'étiquettes. Vous les utiliserez plus tard pour mesurer les performances d'un nouvel agent. Un jeu de données est une collection d'exemples, qui ne sont rien de plus que des paires entrée-sortie que vous pouvez utiliser comme cas de test pour votre application.

Pour plus d'informations sur les jeux de données, notamment sur la façon de les créer à partir de fichiers CSV ou autres ou de les créer sur la plateforme, veuillez consulter la [documentation LangSmith](https://docs.smith.langchain.com/).

```python
outputs = [
    "LangChain is an open-source framework for building applications using large language models. It is also the name of the company building LangSmith.",
    "LangSmith is a unified platform for debugging, testing, and monitoring language model applications and agents powered by LangChain",
    "July 18, 2023",
    "The langsmith cookbook is a github repository containing detailed examples of how to use LangSmith to debug, evaluate, and monitor large language model-powered applications.",
    "September 5, 2023",
]
```

```python
dataset_name = f"agent-qa-{unique_id}"

dataset = client.create_dataset(
    dataset_name,
    description="An example dataset of questions over the LangSmith documentation.",
)

client.create_examples(
    inputs=[{"input": query} for query in inputs],
    outputs=[{"output": answer} for answer in outputs],
    dataset_id=dataset.id,
)
```

### 2. Initialiser un nouvel agent à évaluer

LangSmith vous permet d'évaluer n'importe quel LLM, chaîne, agent ou même une fonction personnalisée. Les agents conversationnels sont statiques (ils ont une mémoire) ; pour s'assurer que cet état n'est pas partagé entre les exécutions du jeu de données, nous passerons une fonction `chain_factory` (aka un `constructeur`) pour initialiser pour chaque appel.

Dans ce cas, nous testerons un agent qui utilise les points de terminaison d'appel de fonction d'OpenAI.

```python
from langchain import hub
from langchain.agents import AgentExecutor, AgentType, initialize_agent, load_tools
from langchain_openai import ChatOpenAI


# Since chains can be stateful (e.g. they can have memory), we provide
# a way to initialize a new chain for each row in the dataset. This is done
# by passing in a factory function that returns a new chain for each row.
def create_agent(prompt, llm_with_tools):
    runnable_agent = (
        {
            "input": lambda x: x["input"],
            "agent_scratchpad": lambda x: format_to_openai_tool_messages(
                x["intermediate_steps"]
            ),
        }
        | prompt
        | llm_with_tools
        | OpenAIToolsAgentOutputParser()
    )
    return AgentExecutor(agent=runnable_agent, tools=tools, handle_parsing_errors=True)
```

### 3. Configurer l'évaluation

Comparer manuellement les résultats des chaînes dans l'interface utilisateur est efficace, mais peut prendre du temps.
Il peut être utile d'utiliser des métriques automatisées et des commentaires assistés par l'IA pour évaluer les performances de votre composant.

Ci-dessous, nous allons créer un évaluateur d'exécution personnalisé qui journalise une évaluation heuristique.

**Évaluateurs heuristiques**

```python
from langsmith.evaluation import EvaluationResult
from langsmith.schemas import Example, Run


def check_not_idk(run: Run, example: Example):
    """Illustration of a custom evaluator."""
    agent_response = run.outputs["output"]
    if "don't know" in agent_response or "not sure" in agent_response:
        score = 0
    else:
        score = 1
    # You can access the dataset labels in example.outputs[key]
    # You can also access the model inputs in run.inputs[key]
    return EvaluationResult(
        key="not_uncertain",
        score=score,
    )
```

#### Évaluateurs par lots

Certaines métriques sont agrégées sur un "test" complet sans être attribuées à des exécutions/exemples individuels. Il peut s'agir de métriques de classification classiques comme la précision, le rappel ou l'AUC, ou d'une autre métrique d'agrégation personnalisée.

Vous pouvez définir n'importe quelle métrique par lot au niveau du test complet en définissant une fonction (ou tout autre élément appelable) qui accepte une liste de Runs (traces système) et une liste d'Exemples (enregistrements de jeu de données).

```python
from typing import List


def max_pred_length(runs: List[Run], examples: List[Example]):
    predictions = [len(run.outputs["output"]) for run in runs]
    return EvaluationResult(key="max_pred_length", score=max(predictions))
```

Ci-dessous, nous configurerons l'évaluation avec l'évaluateur personnalisé ci-dessus, ainsi que certains évaluateurs d'exécution pré-implémentés qui font ce qui suit :
- Comparer les résultats aux étiquettes de vérité terrain.
- Mesurer la (dis)similarité sémantique à l'aide de la distance d'intégration
- Évaluer les "aspects" de la réponse de l'agent d'une manière indépendante de la référence à l'aide de critères personnalisés

Pour une discussion plus approfondie sur la façon de sélectionner un évaluateur approprié pour votre cas d'utilisation et de créer vos propres évaluateurs personnalisés, veuillez vous reporter à la [documentation LangSmith](https://docs.smith.langchain.com/).

```python
from langchain.evaluation import EvaluatorType
from langchain.smith import RunEvalConfig

evaluation_config = RunEvalConfig(
    # Evaluators can either be an evaluator type (e.g., "qa", "criteria", "embedding_distance", etc.) or a configuration for that evaluator
    evaluators=[
        check_not_idk,
        # Measures whether a QA response is "Correct", based on a reference answer
        # You can also select via the raw string "qa"
        EvaluatorType.QA,
        # Measure the embedding distance between the output and the reference answer
        # Equivalent to: EvalConfig.EmbeddingDistance(embeddings=OpenAIEmbeddings())
        EvaluatorType.EMBEDDING_DISTANCE,
        # Grade whether the output satisfies the stated criteria.
        # You can select a default one such as "helpfulness" or provide your own.
        RunEvalConfig.LabeledCriteria("helpfulness"),
        # The LabeledScoreString evaluator outputs a score on a scale from 1-10.
        # You can use default criteria or write our own rubric
        RunEvalConfig.LabeledScoreString(
            {
                "accuracy": """
Score 1: The answer is completely unrelated to the reference.
Score 3: The answer has minor relevance but does not align with the reference.
Score 5: The answer has moderate relevance but contains inaccuracies.
Score 7: The answer aligns with the reference but has minor errors or omissions.
Score 10: The answer is completely accurate and aligns perfectly with the reference."""
            },
            normalize_by=10,
        ),
    ],
    batch_evaluators=[max_pred_length],
)
```

### 4. Exécuter l'agent et les évaluateurs

Utilisez la fonction [run_on_dataset](https://api.python.langchain.com/en/latest/smith/langchain.smith.evaluation.runner_utils.run_on_dataset.html#langchain.smith.evaluation.runner_utils.run_on_dataset) (ou [arun_on_dataset](https://api.python.langchain.com/en/latest/smith/langchain.smith.evaluation.runner_utils.arun_on_dataset.html#langchain.smith.evaluation.runner_utils.arun_on_dataset)) asynchrone) pour évaluer votre modèle. Cela permettra :
1. Récupérer les lignes d'exemple du jeu de données spécifié.
2. Exécuter votre agent (ou toute fonction personnalisée) sur chaque exemple.
3. Appliquer des évaluateurs aux traces d'exécution résultantes et aux exemples de référence correspondants pour générer un retour d'information automatisé.

Les résultats seront visibles dans l'application LangSmith.

```python
from langchain import hub

# We will test this version of the prompt
prompt = hub.pull("wfh/langsmith-agent-prompt:798e7324")
```

```python
import functools

from langchain.smith import arun_on_dataset, run_on_dataset

chain_results = run_on_dataset(
    dataset_name=dataset_name,
    llm_or_chain_factory=functools.partial(
        create_agent, prompt=prompt, llm_with_tools=llm_with_tools
    ),
    evaluation=evaluation_config,
    verbose=True,
    client=client,
    project_name=f"tools-agent-test-5d466cbc-{unique_id}",
    # Project metadata communicates the experiment parameters,
    # Useful for reviewing the test results
    project_metadata={
        "env": "testing-notebook",
        "model": "gpt-3.5-turbo",
        "prompt": "5d466cbc",
    },
)

# Sometimes, the agent will error due to parsing issues, incompatible tool inputs, etc.
# These are logged as warnings here and captured as errors in the tracing UI.
```

### Examiner les résultats du test

Vous pouvez examiner l'interface utilisateur de suivi des résultats des tests ci-dessous en cliquant sur l'URL dans la sortie ci-dessus ou en accédant à la page "Testing & Datasets" dans LangSmith **"agent-qa-{unique_id}"** jeu de données.

![résultats du test](./img/test_results.png)

Cela affichera les nouvelles exécutions et les commentaires enregistrés par les évaluateurs sélectionnés. Vous pouvez également explorer un résumé des résultats sous forme tabulaire ci-dessous.

```python
chain_results.to_dataframe()
```

### (Facultatif) Comparer à un autre prompt

Maintenant que nous avons les résultats de notre exécution de test, nous pouvons apporter des modifications à notre agent et les comparer. Essayons à nouveau avec un prompt différent et voyons les résultats.

```python
candidate_prompt = hub.pull("wfh/langsmith-agent-prompt:39f3bbd0")

chain_results = run_on_dataset(
    dataset_name=dataset_name,
    llm_or_chain_factory=functools.partial(
        create_agent, prompt=candidate_prompt, llm_with_tools=llm_with_tools
    ),
    evaluation=evaluation_config,
    verbose=True,
    client=client,
    project_name=f"tools-agent-test-39f3bbd0-{unique_id}",
    project_metadata={
        "env": "testing-notebook",
        "model": "gpt-3.5-turbo",
        "prompt": "39f3bbd0",
    },
)
```

## Exporter des jeux de données et des exécutions

LangSmith vous permet d'exporter des données dans des formats courants tels que CSV ou JSONL directement dans l'application web. Vous pouvez également utiliser le client pour récupérer les exécutions pour une analyse plus approfondie, les stocker dans votre propre base de données ou les partager avec d'autres. Récupérons les traces d'exécution de l'exécution d'évaluation.

**Remarque : Il peut s'écouler quelques instants avant que toutes les exécutions ne soient accessibles.**

```python
runs = client.list_runs(project_name=chain_results["project_name"], execution_order=1)
```

```python
# The resulting tests are stored in a project.  You can programmatically
# access important metadata from the test, such as the dataset version it was run on
# or your application's revision ID.
client.read_project(project_name=chain_results["project_name"]).metadata
```

```python
# After some time, the test metrics will be populated as well.
client.read_project(project_name=chain_results["project_name"]).feedback_stats
```

## Conclusion

Félicitations ! Vous avez réussi à tracer et à évaluer un agent à l'aide de LangSmith !

Il s'agissait d'un guide rapide pour vous lancer, mais il existe de nombreuses autres façons d'utiliser LangSmith pour accélérer votre flux de développement et produire de meilleurs résultats.

Pour plus d'informations sur la façon d'exploiter au mieux LangSmith, consultez la [documentation LangSmith](https://docs.smith.langchain.com/) et n'hésitez pas à nous contacter avec vos questions, vos demandes de fonctionnalités ou vos commentaires à l'adresse [support@langchain.dev](mailto:support@langchain.dev).
