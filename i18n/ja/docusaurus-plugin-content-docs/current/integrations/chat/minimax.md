---
sidebar_label: MiniMax
translated: true
---

# MiniMaxチャット

[Minimax](https://api.minimax.chat)は、企業や個人向けにLLMサービスを提供する中国のスタートアップです。

このサンプルでは、LangChainを使ってMiniMaxインファレンスとチャットする方法について説明します。

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
