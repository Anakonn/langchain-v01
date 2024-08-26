---
translated: true
---

# PipelineAI

>[PipelineAI](https://pipeline.ai) vous permet d'exécuter vos modèles ML à grande échelle dans le cloud. Il fournit également un accès API à [plusieurs modèles LLM](https://pipeline.ai).

Ce notebook explique comment utiliser Langchain avec [PipelineAI](https://docs.pipeline.ai/docs).

## Exemple PipelineAI

[Cet exemple montre comment PipelineAI est intégré à LangChain](https://docs.pipeline.ai/docs/langchain) et il est créé par PipelineAI.

## Configuration

La bibliothèque `pipeline-ai` est requise pour utiliser l'API `PipelineAI`, également appelée `Pipeline Cloud`. Installez `pipeline-ai` à l'aide de `pip install pipeline-ai`.

```python
# Install the package
%pip install --upgrade --quiet  pipeline-ai
```

## Exemple

### Imports

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import PipelineAI
from langchain_core.prompts import PromptTemplate
```

### Définir la clé d'API d'environnement

Assurez-vous d'obtenir votre clé API auprès de PipelineAI. Consultez le [guide de démarrage rapide du cloud](https://docs.pipeline.ai/docs/cloud-quickstart). Vous bénéficierez d'un essai gratuit de 30 jours avec 10 heures de calcul GPU serverless pour tester différents modèles.

```python
os.environ["PIPELINE_API_KEY"] = "YOUR_API_KEY_HERE"
```

## Créer l'instance PipelineAI

Lors de l'instanciation de PipelineAI, vous devez spécifier l'identifiant ou l'étiquette du pipeline que vous souhaitez utiliser, par exemple `pipeline_key = "public/gpt-j:base"`. Vous avez ensuite la possibilité de passer des arguments de mots-clés supplémentaires spécifiques au pipeline :

```python
llm = PipelineAI(pipeline_key="YOUR_PIPELINE_KEY", pipeline_kwargs={...})
```

### Créer un modèle de prompt

Nous allons créer un modèle de prompt pour les questions et réponses.

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

### Initier la chaîne LLM

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

### Exécuter la chaîne LLM

Fournissez une question et exécutez la chaîne LLM.

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
