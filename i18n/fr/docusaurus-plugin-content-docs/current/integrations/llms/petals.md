---
translated: true
---

# Pétales

`Pétales` exécute des modèles de langage de plus de 100 milliards de paramètres à la maison, style BitTorrent.

Ce notebook explique comment utiliser Langchain avec [Pétales](https://github.com/bigscience-workshop/petals).

## Installer pétales

Le package `pétales` est requis pour utiliser l'API Pétales. Installez `pétales` en utilisant `pip3 install pétales`.

Pour les utilisateurs d'Apple Silicon (M1/M2), veuillez suivre ce guide [https://github.com/bigscience-workshop/petals/issues/147#issuecomment-1365379642](https://github.com/bigscience-workshop/petals/issues/147#issuecomment-1365379642) pour installer pétales

```python
!pip3 install petals
```

## Imports

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import Petals
from langchain_core.prompts import PromptTemplate
```

## Définir la clé d'API de l'environnement

Assurez-vous d'obtenir [votre clé d'API](https://huggingface.co/docs/api-inference/quicktour#get-your-api-token) de Hugging Face.

```python
from getpass import getpass

HUGGINGFACE_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["HUGGINGFACE_API_KEY"] = HUGGINGFACE_API_KEY
```

## Créer l'instance Pétales

Vous pouvez spécifier différents paramètres tels que le nom du modèle, le nombre maximum de nouveaux jetons, la température, etc.

```python
# this can take several minutes to download big files!

llm = Petals(model_name="bigscience/bloom-petals")
```

```output
Downloading:   1%|▏                        | 40.8M/7.19G [00:24<15:44, 7.57MB/s]
```

## Créer un modèle de prompt

Nous allons créer un modèle de prompt pour les questions et réponses.

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## Initier la chaîne LLM

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## Exécuter la chaîne LLM

Fournissez une question et exécutez la chaîne LLM.

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
