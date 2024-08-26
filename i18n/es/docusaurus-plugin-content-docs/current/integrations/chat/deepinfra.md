---
translated: true
---

# DeepInfra

[DeepInfra](https://deepinfra.com/?utm_source=langchain) es un servicio de inferencia sin servidor que proporciona acceso a una [variedad de LLM](https://deepinfra.com/models?utm_source=langchain) y [modelos de incrustación](https://deepinfra.com/models?type=embeddings&utm_source=langchain). Este cuaderno explica cómo usar LangChain con DeepInfra para modelos de chat.

## Establecer la clave de la API del entorno

Asegúrese de obtener su clave de API de DeepInfra. Tiene que [Iniciar sesión](https://deepinfra.com/login?from=%2Fdash) y obtener un nuevo token.

Se le otorga 1 hora gratuita de cómputo de GPU sin servidor para probar diferentes modelos. (ver [aquí](https://github.com/deepinfra/deepctl#deepctl))
Puede imprimir su token con `deepctl auth token`

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

## `ChatDeepInfra` también admite funcionalidad asincrónica y de transmisión:

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
