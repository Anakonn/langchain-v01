---
sidebar_label: MiniMax
translated: true
---

# MiniMaxChat

[Minimax](https://api.minimax.chat) est une startup chinoise qui fournit un service LLM aux entreprises et aux particuliers.

Cet exemple explique comment utiliser LangChain pour interagir avec MiniMax Inference pour Chat.

```python
import os

os.environ["MINIMAX_GROUP_ID"] = "MINIMAX_GROUP_ID"
os.environ["MINIMAX_API_KEY"] = "MINIMAX_API_KEY"
```

```python
from langchain_community.chat_models import MiniMaxChat
from langchain_core.messages import HumanMessage
```

```python
chat = MiniMaxChat()
```

```python
chat(
    [
        HumanMessage(
            content="Translate this sentence from English to French. I love programming."
        )
    ]
)
```
