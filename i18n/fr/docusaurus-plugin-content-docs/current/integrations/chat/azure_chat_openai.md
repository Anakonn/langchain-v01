---
sidebar_label: Azure OpenAI
translated: true
---

# AzureChatOpenAI

>[Service Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview) fournit un accès API REST aux puissants modèles de langage d'OpenAI, notamment les séries de modèles GPT-4, GPT-3.5-Turbo et Embeddings. Ces modèles peuvent être facilement adaptés à des tâches spécifiques, notamment la génération de contenu, la résumé, la recherche sémantique et la traduction de langage naturel en code. Les utilisateurs peuvent accéder au service via des API REST, le SDK Python ou une interface web dans Azure OpenAI Studio.

Ce notebook explique comment se connecter à un point de terminaison OpenAI hébergé sur Azure. Tout d'abord, nous devons installer le package `langchain-openai`.
%pip install -qU langchain-openai
Ensuite, définissons quelques variables d'environnement pour nous connecter au service Azure OpenAI. Vous pouvez trouver ces valeurs dans le portail Azure.

```python
import os

os.environ["AZURE_OPENAI_API_KEY"] = "..."
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://<your-endpoint>.openai.azure.com/"
os.environ["AZURE_OPENAI_API_VERSION"] = "2023-06-01-preview"
os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"] = "chat"
```

Ensuite, construisons notre modèle et discutons avec lui :

```python
from langchain_core.messages import HumanMessage
from langchain_openai import AzureChatOpenAI

model = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"],
)
```

```python
message = HumanMessage(
    content="Translate this sentence from English to French. I love programming."
)
model.invoke([message])
```

```output
AIMessage(content="J'adore programmer.", response_metadata={'token_usage': {'completion_tokens': 6, 'prompt_tokens': 19, 'total_tokens': 25}, 'model_name': 'gpt-35-turbo', 'system_fingerprint': None, 'prompt_filter_results': [{'prompt_index': 0, 'content_filter_results': {'hate': {'filtered': False, 'severity': 'safe'}, 'self_harm': {'filtered': False, 'severity': 'safe'}, 'sexual': {'filtered': False, 'severity': 'safe'}, 'violence': {'filtered': False, 'severity': 'safe'}}}], 'finish_reason': 'stop', 'logprobs': None, 'content_filter_results': {'hate': {'filtered': False, 'severity': 'safe'}, 'self_harm': {'filtered': False, 'severity': 'safe'}, 'sexual': {'filtered': False, 'severity': 'safe'}, 'violence': {'filtered': False, 'severity': 'safe'}}}, id='run-25ed88db-38f2-4b0c-a943-a03f217711a9-0')
```

## Version du modèle

Les réponses d'Azure OpenAI contiennent la propriété `model`, qui est le nom du modèle utilisé pour générer la réponse. Cependant, contrairement aux réponses natives d'OpenAI, elle ne contient pas la version du modèle, qui est définie dans le déploiement sur Azure. Cela rend difficile de savoir quelle version du modèle a été utilisée pour générer la réponse, ce qui peut entraîner, par exemple, un mauvais calcul du coût total avec `OpenAICallbackHandler`.

Pour résoudre ce problème, vous pouvez passer le paramètre `model_version` à la classe `AzureChatOpenAI`, qui sera ajouté au nom du modèle dans la sortie du llm. Ainsi, vous pourrez facilement distinguer les différentes versions du modèle.

```python
from langchain.callbacks import get_openai_callback
```

```python
model = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ[
        "AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"
    ],  # in Azure, this deployment has version 0613 - input and output tokens are counted separately
)
with get_openai_callback() as cb:
    model.invoke([message])
    print(
        f"Total Cost (USD): ${format(cb.total_cost, '.6f')}"
    )  # without specifying the model version, flat-rate 0.002 USD per 1k input and output tokens is used
```

```output
Total Cost (USD): $0.000041
```

Nous pouvons fournir la version du modèle au constructeur `AzureChatOpenAI`. Elle sera ajoutée au nom du modèle renvoyé par Azure OpenAI et le coût sera calculé correctement.

```python
model0301 = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"],
    model_version="0301",
)
with get_openai_callback() as cb:
    model0301.invoke([message])
    print(f"Total Cost (USD): ${format(cb.total_cost, '.6f')}")
```

```output
Total Cost (USD): $0.000044
```
