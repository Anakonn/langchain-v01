---
canonical: https://python.langchain.com/v0.1/docs/integrations/chat/fireworks
sidebar_label: Fireworks
translated: false
---

# ChatFireworks

>[Fireworks](https://app.fireworks.ai/) accelerates product development on generative AI by creating an innovative AI experiment and production platform.

This example goes over how to use LangChain to interact with `ChatFireworks` models.
%pip install langchain-fireworks

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_fireworks import ChatFireworks
```

# Setup

1. Make sure the `langchain-fireworks` package is installed in your environment.
2. Sign in to [Fireworks AI](http://fireworks.ai) for the an API Key to access our models, and make sure it is set as the `FIREWORKS_API_KEY` environment variable.
3. Set up your model using a model id. If the model is not set, the default model is fireworks-llama-v2-7b-chat. See the full, most up-to-date model list on [app.fireworks.ai](https://app.fireworks.ai).

```python
import getpass
import os

if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Fireworks API Key:")

# Initialize a Fireworks chat model
chat = ChatFireworks(model="accounts/fireworks/models/mixtral-8x7b-instruct")
```

# Calling the Model Directly

You can call the model directly with a system and human message to get answers.

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

# Tool Calling

Fireworks offers the [`FireFunction-v1` tool calling model](https://fireworks.ai/blog/firefunction-v1-gpt-4-level-function-calling). You can use it for structured output and function calling use cases:

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