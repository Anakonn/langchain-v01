---
sidebar_label: अभिनेता
translated: true
---

# ChatUpstage

यह नोटबुक Upstage चैट मॉडल्स का उपयोग शुरू करने के बारे में कवर करता है।

## इंस्टॉलेशन

`langchain-upstage` पैकेज इंस्टॉल करें।

```bash
pip install -U langchain-upstage
```

## वातावरण सेटअप

निम्नलिखित पर्यावरण चर सेट करना सुनिश्चित करें:

- `UPSTAGE_API_KEY`: [Upstage कंसोल](https://console.upstage.ai/) से आपका Upstage API कुंजी।

## उपयोग

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_upstage import ChatUpstage

chat = ChatUpstage()
```

```python
# using chat invoke
chat.invoke("Hello, how are you?")
```

```python
# using chat stream
for m in chat.stream("Hello, how are you?"):
    print(m)
```

## श्रृंखलाबद्ध

```python
# using chain
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant that translates English to French."),
        ("human", "Translate this sentence from English to French. {english_text}."),
    ]
)
chain = prompt | chat

chain.invoke({"english_text": "Hello, how are you?"})
```
