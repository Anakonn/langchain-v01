---
translated: true
---

# DeepInfra

[DeepInfra](https://deepinfra.com/?utm_source=langchain) est un service d'inférence serverless qui fournit un accès à une [variété de LLM](https://deepinfra.com/models?utm_source=langchain) et de [modèles d'embeddings](https://deepinfra.com/models?type=embeddings&utm_source=langchain). Ce notebook explique comment utiliser LangChain avec DeepInfra pour les modèles de langage.

## Définir la clé d'API de l'environnement

Assurez-vous d'obtenir votre clé d'API auprès de DeepInfra. Vous devez vous [connecter](https://deepinfra.com/login?from=%2Fdash) et obtenir un nouveau jeton.

Vous disposez d'1 heure gratuite de calcul GPU serverless pour tester différents modèles. (voir [ici](https://github.com/deepinfra/deepctl#deepctl)))
Vous pouvez imprimer votre jeton avec `deepctl auth token`

```python
# get a new token: https://deepinfra.com/login?from=%2Fdash

from getpass import getpass

DEEPINFRA_API_TOKEN = getpass()
```

```output
 ········
```

```python
import os

os.environ["DEEPINFRA_API_TOKEN"] = DEEPINFRA_API_TOKEN
```

## Créer l'instance DeepInfra

Vous pouvez également utiliser notre outil open-source [deepctl](https://github.com/deepinfra/deepctl#deepctl) pour gérer vos déploiements de modèles. Vous pouvez consulter la liste des paramètres disponibles [ici](https://deepinfra.com/databricks/dolly-v2-12b#API).

```python
from langchain_community.llms import DeepInfra

llm = DeepInfra(model_id="meta-llama/Llama-2-70b-chat-hf")
llm.model_kwargs = {
    "temperature": 0.7,
    "repetition_penalty": 1.2,
    "max_new_tokens": 250,
    "top_p": 0.9,
}
```

```python
# run inferences directly via wrapper
llm("Who let the dogs out?")
```

```output
'This is a question that has puzzled many people'
```

```python
# run streaming inference
for chunk in llm.stream("Who let the dogs out?"):
    print(chunk)
```

```output
 Will
 Smith
.
```

## Créer un modèle de prompt

Nous allons créer un modèle de prompt pour les questions et réponses.

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## Initier la chaîne LLMChain

```python
from langchain.chains import LLMChain

llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## Exécuter la chaîne LLMChain

Fournissez une question et exécutez la chaîne LLMChain.

```python
question = "Can penguins reach the North pole?"

llm_chain.run(question)
```

```output
"Penguins are found in Antarctica and the surrounding islands, which are located at the southernmost tip of the planet. The North Pole is located at the northernmost tip of the planet, and it would be a long journey for penguins to get there. In fact, penguins don't have the ability to fly or migrate over such long distances. So, no, penguins cannot reach the North Pole. "
```
