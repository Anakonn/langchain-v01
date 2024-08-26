---
translated: true
---

# GooseAI

`GooseAI` est un service NLP entièrement géré, livré via une API. GooseAI donne accès à [ces modèles](https://goose.ai/docs/models).

Ce notebook explique comment utiliser Langchain avec [GooseAI](https://goose.ai/).

## Installer openai

Le package `openai` est requis pour utiliser l'API GooseAI. Installez `openai` en utilisant `pip install openai`.

```python
%pip install --upgrade --quiet  langchain-openai
```

## Imports

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import GooseAI
from langchain_core.prompts import PromptTemplate
```

## Définir la clé d'API de l'environnement

Assurez-vous d'obtenir votre clé d'API auprès de GooseAI. Vous bénéficiez de $10 de crédits gratuits pour tester différents modèles.

```python
from getpass import getpass

GOOSEAI_API_KEY = getpass()
```

```python
os.environ["GOOSEAI_API_KEY"] = GOOSEAI_API_KEY
```

## Créer l'instance GooseAI

Vous pouvez spécifier différents paramètres tels que le nom du modèle, le nombre maximum de jetons générés, la température, etc.

```python
llm = GooseAI()
```

## Créer un modèle de prompt

Nous allons créer un modèle de prompt pour les questions et réponses.

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## Initier la LLMChain

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## Exécuter la LLMChain

Fournissez une question et exécutez la LLMChain.

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
