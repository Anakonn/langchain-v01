---
translated: true
---

# DeepInfra

[DeepInfra](https://deepinfra.com/?utm_source=langchain) est un service d'inférence serverless qui fournit un accès à une [variété de LLM](https://deepinfra.com/models?utm_source=langchain) et de [modèles d'embeddings](https://deepinfra.com/models?type=embeddings&utm_source=langchain). Ce notebook explique comment utiliser LangChain avec DeepInfra pour les modèles de chat.

## Définir la clé d'API de l'environnement

Assurez-vous d'obtenir votre clé d'API auprès de DeepInfra. Vous devez vous [connecter](https://deepinfra.com/login?from=%2Fdash) et obtenir un nouveau jeton.

Vous disposez d'1 heure gratuite de calcul GPU serverless pour tester différents modèles. (voir [ici](https://github.com/deepinfra/deepctl#deepctl)))
Vous pouvez imprimer votre jeton avec `deepctl auth token`

```python
# get a new token: https://deepinfra.com/login?from=%2Fdash

import os
from getpass import getpass

from langchain_community.chat_models import ChatDeepInfra
from langchain_core.messages import HumanMessage

DEEPINFRA_API_TOKEN = getpass()

# or pass deepinfra_api_token parameter to the ChatDeepInfra constructor
os.environ["DEEPINFRA_API_TOKEN"] = DEEPINFRA_API_TOKEN

chat = ChatDeepInfra(model="meta-llama/Llama-2-7b-chat-hf")

messages = [
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    )
]
chat.invoke(messages)
```

## `ChatDeepInfra` prend également en charge les fonctionnalités asynchrones et de diffusion en continu :

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
```

```python
await chat.agenerate([messages])
```

```python
chat = ChatDeepInfra(
    streaming=True,
    verbose=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
chat.invoke(messages)
```
