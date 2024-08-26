---
translated: true
---

# Endpoints Huggingface

>Le [Hugging Face Hub](https://huggingface.co/docs/hub/index) est une plateforme avec plus de 120 000 modèles, 20 000 jeux de données et 50 000 applications de démonstration (Spaces), tous open source et publiquement disponibles, sur une plateforme en ligne où les gens peuvent facilement collaborer et construire du ML ensemble.

Le `Hugging Face Hub` propose également divers endpoints pour construire des applications ML.
Cet exemple montre comment se connecter aux différents types d'Endpoints.

En particulier, l'inférence de génération de texte est alimentée par [Text Generation Inference](https://github.com/huggingface/text-generation-inference) : un serveur Rust, Python et gRPC personnalisé pour une inférence de génération de texte ultra-rapide.

```python
from langchain_community.llms import HuggingFaceEndpoint
```

## Installation et configuration

Pour utiliser, vous devez avoir le package python ``huggingface_hub`` [installé](https://huggingface.co/docs/huggingface_hub/installation).

```python
%pip install --upgrade --quiet huggingface_hub
```

```python
# get a token: https://huggingface.co/docs/api-inference/quicktour#get-your-api-token

from getpass import getpass

HUGGINGFACEHUB_API_TOKEN = getpass()
```

```python
import os

os.environ["HUGGINGFACEHUB_API_TOKEN"] = HUGGINGFACEHUB_API_TOKEN
```

## Préparer les exemples

```python
from langchain_community.llms import HuggingFaceEndpoint
```

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
```

```python
question = "Who won the FIFA World Cup in the year 1994? "

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## Exemples

Voici un exemple de la façon dont vous pouvez accéder à l'intégration `HuggingFaceEndpoint` de l'API [Serverless Endpoints](https://huggingface.co/inference-endpoints/serverless) gratuite.

```python
repo_id = "mistralai/Mistral-7B-Instruct-v0.2"

llm = HuggingFaceEndpoint(
    repo_id=repo_id, max_length=128, temperature=0.5, token=HUGGINGFACEHUB_API_TOKEN
)
llm_chain = LLMChain(prompt=prompt, llm=llm)
print(llm_chain.run(question))
```

## Endpoint dédié

L'API serverless gratuite vous permet de mettre en œuvre des solutions et d'itérer rapidement, mais elle peut être limitée en débit pour les cas d'utilisation intensifs, car les charges sont partagées avec d'autres requêtes.

Pour les charges de travail d'entreprise, le mieux est d'utiliser les [Inference Endpoints - Dedicated](https://huggingface.co/inference-endpoints/dedicated).
Cela donne accès à une infrastructure entièrement gérée qui offre plus de flexibilité et de vitesse. Ces ressources s'accompagnent d'un support continu et de garanties de disponibilité, ainsi que d'options comme l'AutoScaling.

```python
# Set the url to your Inference Endpoint below
your_endpoint_url = "https://fayjubiy2xqn36z0.us-east-1.aws.endpoints.huggingface.cloud"
```

```python
llm = HuggingFaceEndpoint(
    endpoint_url=f"{your_endpoint_url}",
    max_new_tokens=512,
    top_k=10,
    top_p=0.95,
    typical_p=0.95,
    temperature=0.01,
    repetition_penalty=1.03,
)
llm("What did foo say about bar?")
```

### Streaming

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import HuggingFaceEndpoint

llm = HuggingFaceEndpoint(
    endpoint_url=f"{your_endpoint_url}",
    max_new_tokens=512,
    top_k=10,
    top_p=0.95,
    typical_p=0.95,
    temperature=0.01,
    repetition_penalty=1.03,
    streaming=True,
)
llm("What did foo say about bar?", callbacks=[StreamingStdOutCallbackHandler()])
```
