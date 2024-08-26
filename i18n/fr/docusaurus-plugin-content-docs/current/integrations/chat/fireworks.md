---
sidebar_label: Feux d'artifice
translated: true
---

# ChatFireworks

>[Feux d'artifice](https://app.fireworks.ai/) accélère le développement de produits sur l'IA générative en créant une plateforme innovante d'expérimentation et de production d'IA.

Cet exemple explique comment utiliser LangChain pour interagir avec les modèles `ChatFireworks`.
%pip install langchain-fireworks

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_fireworks import ChatFireworks
```

# Configuration

1. Assurez-vous que le package `langchain-fireworks` est installé dans votre environnement.
2. Connectez-vous à [Fireworks AI](http://fireworks.ai) pour obtenir une clé API afin d'accéder à nos modèles, et assurez-vous qu'elle est définie en tant que variable d'environnement `FIREWORKS_API_KEY`.
3. Configurez votre modèle à l'aide d'un ID de modèle. Si le modèle n'est pas défini, le modèle par défaut est fireworks-llama-v2-7b-chat. Consultez la liste complète et la plus à jour des modèles sur [app.fireworks.ai](https://app.fireworks.ai).

```python
import getpass
import os

if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Fireworks API Key:")

# Initialize a Fireworks chat model
chat = ChatFireworks(model="accounts/fireworks/models/mixtral-8x7b-instruct")
```

# Appel direct du modèle

Vous pouvez appeler le modèle directement avec un message système et un message humain pour obtenir des réponses.

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

# Appel d'outil

Fireworks propose le modèle d'appel d'outil [`FireFunction-v1`](https://fireworks.ai/blog/firefunction-v1-gpt-4-level-function-calling). Vous pouvez l'utiliser pour des cas d'utilisation de sortie structurée et d'appel de fonction :

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
