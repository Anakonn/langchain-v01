---
sidebar_label: मूनशॉट
translated: true
---

# मूनशॉटचैट

[मूनशॉट](https://platform.moonshot.cn/) एक चीनी स्टार्टअप है जो कंपनियों और व्यक्तियों के लिए एलएलएम सेवा प्रदान करता है।

यह उदाहरण LangChain का उपयोग करके मूनशॉट इन्फरेंस के साथ चैट करने के बारे में बताता है।

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
