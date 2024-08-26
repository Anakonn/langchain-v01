---
sidebar_label: MiniMax
translated: true
---

# MiniMaxChat

[Minimax](https://api.minimax.chat) एक चीनी स्टार्टअप है जो कंपनियों और व्यक्तियों के लिए LLM सेवा प्रदान करता है।

यह उदाहरण LangChain का उपयोग करके MiniMax Inference के साथ चैट करने के बारे में बताता है।

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
