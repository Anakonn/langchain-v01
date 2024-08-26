---
sidebar_label: Moonshot
translated: true
---

# MoonshotChat

[Moonshot](https://platform.moonshot.cn/) est une startup chinoise qui fournit un service LLM aux entreprises et aux particuliers.

Cet exemple explique comment utiliser LangChain pour interagir avec Moonshot Inference pour Chat.

```python
import os

# Generate your api key from: https://platform.moonshot.cn/console/api-keys
os.environ["MOONSHOT_API_KEY"] = "MOONSHOT_API_KEY"
```

```python
from langchain_community.chat_models.moonshot import MoonshotChat
from langchain_core.messages import HumanMessage, SystemMessage
```

```python
chat = MoonshotChat()
# or use a specific model
# Available models: https://platform.moonshot.cn/docs
# chat = MoonshotChat(model="moonshot-v1-128k")
```

```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    ),
]

chat.invoke(messages)
```
