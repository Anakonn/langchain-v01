---
translated: true
---

# ForefrontAI

La plateforme `Forefront` vous permet d'affiner et d'utiliser [des modèles de langage open-source de grande taille](https://docs.forefront.ai/forefront/master/models).

Ce notebook explique comment utiliser Langchain avec [ForefrontAI](https://www.forefront.ai/).

## Imports

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import ForefrontAI
from langchain_core.prompts import PromptTemplate
```

## Définir la clé d'API de l'environnement

Assurez-vous d'obtenir votre clé d'API auprès de ForefrontAI. Vous bénéficiez d'un essai gratuit de 5 jours pour tester différents modèles.

```python
# get a new token: https://docs.forefront.ai/forefront/api-reference/authentication

from getpass import getpass

FOREFRONTAI_API_KEY = getpass()
```

```python
os.environ["FOREFRONTAI_API_KEY"] = FOREFRONTAI_API_KEY
```

## Créer l'instance ForefrontAI

Vous pouvez spécifier différents paramètres tels que l'URL de l'endpoint du modèle, la longueur, la température, etc. Vous devez fournir une URL d'endpoint.

```python
llm = ForefrontAI(endpoint_url="YOUR ENDPOINT URL HERE")
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
