---
translated: true
---

# CerebriumAI

`Cerebrium` est une alternative à AWS Sagemaker. Il fournit également un accès API à [plusieurs modèles LLM](https://docs.cerebrium.ai/cerebrium/prebuilt-models/deployment).

Ce notebook explique comment utiliser Langchain avec [CerebriumAI](https://docs.cerebrium.ai/introduction).

## Installer cerebrium

Le package `cerebrium` est requis pour utiliser l'API `CerebriumAI`. Installez `cerebrium` en utilisant `pip3 install cerebrium`.

```python
# Install the package
!pip3 install cerebrium
```

## Imports

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import CerebriumAI
from langchain_core.prompts import PromptTemplate
```

## Définir la clé d'API de l'environnement

Assurez-vous d'obtenir votre clé d'API auprès de CerebriumAI. Voir [ici](https://dashboard.cerebrium.ai/login). Vous bénéficiez d'1 heure gratuite de calcul GPU serverless pour tester différents modèles.

```python
os.environ["CEREBRIUMAI_API_KEY"] = "YOUR_KEY_HERE"
```

## Créer l'instance CerebriumAI

Vous pouvez spécifier différents paramètres tels que l'URL de l'endpoint du modèle, la longueur maximale, la température, etc. Vous devez fournir une URL d'endpoint.

```python
llm = CerebriumAI(endpoint_url="YOUR ENDPOINT URL HERE")
```

## Créer un modèle de prompt

Nous allons créer un modèle de prompt pour les questions-réponses.

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
