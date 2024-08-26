---
translated: true
---

# Ray Serve

[Ray Serve](https://docs.ray.io/en/latest/serve/index.html) est une bibliothèque de service de modèle évolutive pour construire des API d'inférence en ligne. Serve est particulièrement bien adapté pour la composition de systèmes, vous permettant de construire un service d'inférence complexe composé de plusieurs chaînes et de logique métier, le tout en code Python.

## Objectif de ce notebook

Ce notebook montre un exemple simple de déploiement d'une chaîne OpenAI en production. Vous pouvez l'étendre pour déployer vos propres modèles auto-hébergés où vous pouvez facilement définir la quantité de ressources matérielles (GPU et CPU) nécessaires pour exécuter votre modèle en production de manière efficace. En savoir plus sur les options disponibles, y compris la mise à l'échelle automatique, dans la [documentation](https://docs.ray.io/en/latest/serve/getting_started.html) de Ray Serve.

## Configurer Ray Serve

Installez ray avec `pip install ray[serve]`.

## Squelette général

Le squelette général pour déployer un service est le suivant :

```python
# 0: Import ray serve and request from starlette
from ray import serve
from starlette.requests import Request


# 1: Define a Ray Serve deployment.
@serve.deployment
class LLMServe:
    def __init__(self) -> None:
        # All the initialization code goes here
        pass

    async def __call__(self, request: Request) -> str:
        # You can parse the request here
        # and return a response
        return "Hello World"


# 2: Bind the model to deployment
deployment = LLMServe.bind()

# 3: Run the deployment
serve.api.run(deployment)
```

```python
# Shutdown the deployment
serve.api.shutdown()
```

## Exemple de déploiement d'une chaîne OpenAI avec des invites personnalisées

Obtenez une clé API OpenAI à partir [d'ici](https://platform.openai.com/account/api-keys). En exécutant le code suivant, on vous demandera de fournir votre clé API.

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

```python
from getpass import getpass

OPENAI_API_KEY = getpass()
```

```python
@serve.deployment
class DeployLLM:
    def __init__(self):
        # We initialize the LLM, template and the chain here
        llm = OpenAI(openai_api_key=OPENAI_API_KEY)
        template = "Question: {question}\n\nAnswer: Let's think step by step."
        prompt = PromptTemplate.from_template(template)
        self.chain = LLMChain(llm=llm, prompt=prompt)

    def _run_chain(self, text: str):
        return self.chain(text)

    async def __call__(self, request: Request):
        # 1. Parse the request
        text = request.query_params["text"]
        # 2. Run the chain
        resp = self._run_chain(text)
        # 3. Return the response
        return resp["text"]
```

Maintenant, nous pouvons lier le déploiement.

```python
# Bind the model to deployment
deployment = DeployLLM.bind()
```

Nous pouvons attribuer le numéro de port et l'hôte lorsque nous voulons exécuter le déploiement.

```python
# Example port number
PORT_NUMBER = 8282
# Run the deployment
serve.api.run(deployment, port=PORT_NUMBER)
```

Maintenant que le service est déployé sur le port `localhost:8282`, nous pouvons envoyer une requête post pour obtenir les résultats.

```python
import requests

text = "What NFL team won the Super Bowl in the year Justin Beiber was born?"
response = requests.post(f"http://localhost:{PORT_NUMBER}/?text={text}")
print(response.content.decode())
```
