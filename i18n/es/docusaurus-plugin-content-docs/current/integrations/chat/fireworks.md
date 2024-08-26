---
sidebar_label: Fuegos Artificiales
translated: true
---

# ChatFireworks

>[Fuegos Artificiales](https://app.fireworks.ai/) acelera el desarrollo de productos en IA generativa al crear una plataforma innovadora de experimentación y producción de IA.

Este ejemplo explica cómo usar LangChain para interactuar con los modelos de `ChatFireworks`.
%pip install langchain-fireworks

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_fireworks import ChatFireworks
```

# Configuración

1. Asegúrate de que el paquete `langchain-fireworks` esté instalado en tu entorno.
2. Inicia sesión en [Fireworks AI](http://fireworks.ai) para obtener una clave API para acceder a nuestros modelos y asegúrate de que esté establecida como la variable de entorno `FIREWORKS_API_KEY`.
3. Configura tu modelo usando un ID de modelo. Si no se establece el modelo, el modelo predeterminado es fireworks-llama-v2-7b-chat. Consulta la lista completa y más actualizada de modelos en [app.fireworks.ai](https://app.fireworks.ai).

```python
import getpass
import os

if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Fireworks API Key:")

# Initialize a Fireworks chat model
chat = ChatFireworks(model="accounts/fireworks/models/mixtral-8x7b-instruct")
```

# Llamar al modelo directamente

Puedes llamar al modelo directamente con un mensaje de sistema y humano para obtener respuestas.

```python
# ChatFireworks Wrapper
system_message = SystemMessage(content="You are to chat with the user.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

```output
AIMessage(content="Hello! I'm an AI language model, a helpful assistant designed to chat and assist you with any questions or information you might need. I'm here to make your experience as smooth and enjoyable as possible. How can I assist you today?")
```

```python
# Setting additional parameters: temperature, max_tokens, top_p
chat = ChatFireworks(
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    temperature=1,
    max_tokens=20,
)
system_message = SystemMessage(content="You are to chat with the user.")
human_message = HumanMessage(content="How's the weather today?")
chat.invoke([system_message, human_message])
```

```output
AIMessage(content="I'm an AI and do not have the ability to experience the weather firsthand. However,")
```

# Llamada de herramienta

Fireworks ofrece el modelo de llamada de herramienta [`FireFunction-v1`](https://fireworks.ai/blog/firefunction-v1-gpt-4-level-function-calling). Puedes usarlo para casos de uso de salida estructurada y llamada de funciones:

```python
from pprint import pprint

from langchain_core.pydantic_v1 import BaseModel


class ExtractFields(BaseModel):
    name: str
    age: int


chat = ChatFireworks(
    model="accounts/fireworks/models/firefunction-v1",
).bind_tools([ExtractFields])

result = chat.invoke("I am a 27 year old named Erick")

pprint(result.additional_kwargs["tool_calls"][0])
```

```output
{'function': {'arguments': '{"name": "Erick", "age": 27}',
              'name': 'ExtractFields'},
 'id': 'call_J0WYP2TLenaFw3UeVU0UnWqx',
 'index': 0,
 'type': 'function'}
```
