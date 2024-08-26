---
translated: true
---

# DeepInfra

[DeepInfra](https://deepinfra.com/?utm_source=langchain) एक सर्वरलेस अनुमान सेवा है जो [विभिन्न एलएलएम](https://deepinfra.com/models?utm_source=langchain) और [एम्बेडिंग मॉडल](https://deepinfra.com/models?type=embeddings&utm_source=langchain) तक पहुंच प्रदान करता है। यह नोटबुक LangChain के साथ DeepInfra का उपयोग करके चैट मॉडल का उपयोग करने के बारे में बताता है।

## वातावरण API कुंजी सेट करें

सुनिश्चित करें कि आप DeepInfra से अपनी API कुंजी प्राप्त करें। आपको [लॉगिन](https://deepinfra.com/login?from=%2Fdash) करना और एक नया टोकन प्राप्त करना होगा।

आपको परीक्षण के लिए 1 घंटे का मुफ्त सर्वरलेस जीपीयू कंप्यूट दिया जाता है। ([यहां](https://github.com/deepinfra/deepctl#deepctl)) देखें)
आप `deepctl auth token` के साथ अपना टोकन प्रिंट कर सकते हैं।

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

## `ChatDeepInfra` भी असिंक्रोनस और स्ट्रीमिंग कार्यक्षमता का समर्थन करता है:

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
