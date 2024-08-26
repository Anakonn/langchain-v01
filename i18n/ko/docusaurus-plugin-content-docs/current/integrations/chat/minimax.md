---
sidebar_label: MiniMax
translated: true
---

# MiniMaxChat

[Minimax](https://api.minimax.chat)은 기업과 개인을 위한 LLM 서비스를 제공하는 중국 스타트업입니다.

이 예제에서는 LangChain을 사용하여 MiniMax Inference for Chat와 상호작용하는 방법을 설명합니다.

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