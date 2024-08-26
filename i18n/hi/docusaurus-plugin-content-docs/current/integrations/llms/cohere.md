---
translated: true
---

# Cohere

>[Cohere](https://cohere.ai/about) एक कनाडाई स्टार्टअप है जो मानव-मशीन इंटरैक्शन को बेहतर बनाने में मदद करने वाले प्राकृतिक भाषा प्रसंस्करण मॉडल प्रदान करता है।

[API संदर्भ](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.cohere.Cohere.html) पर सभी गुणों और विधियों का विस्तृत प्लेटफॉर्म देखें।

## सेटअप

एकीकरण `langchain-community` पैकेज में मौजूद है। हमें `cohere` पैकेज को भी स्थापित करना होगा। हम इन्हें निम्नलिखित तरीके से स्थापित कर सकते हैं:

```bash
pip install -U langchain-community langchain-cohere
```

हमें एक [Cohere API कुंजी](https://cohere.com/) भी प्राप्त करनी होगी और `COHERE_API_KEY` पर्यावरण चर को सेट करना होगा:

```python
import getpass
import os

os.environ["COHERE_API_KEY"] = getpass.getpass()
```

```output
 ········
```

[LangSmith](https://smith.langchain.com/) को सेट करना भी उपयोगी (लेकिन आवश्यक नहीं) है क्योंकि यह सर्वश्रेष्ठ निरीक्षणयोग्यता प्रदान करता है।

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## उपयोग

Cohere सभी [LLM](/docs/modules/model_io/llms/) कार्यक्षमता का समर्थन करता है:

```python
from langchain_cohere import Cohere
from langchain_core.messages import HumanMessage
```

```python
model = Cohere(model="command", max_tokens=256, temperature=0.75)
```

```python
message = "Knock knock"
model.invoke(message)
```

```output
" Who's there?"
```

```python
await model.ainvoke(message)
```

```output
" Who's there?"
```

```python
for chunk in model.stream(message):
    print(chunk, end="", flush=True)
```

```output
 Who's there?
```

```python
model.batch([message])
```

```output
[" Who's there?"]
```

आप प्रयोक्ता इनपुट को आसानी से संरचित करने के लिए प्रॉम्प्ट टेम्प्लेट के साथ भी आसानी से जोड़ सकते हैं। हम [LCEL](/docs/expression_language) का उपयोग करके ऐसा कर सकते हैं।

```python
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | model
```

```python
chain.invoke({"topic": "bears"})
```

```output
' Why did the teddy bear cross the road?\nBecause he had bear crossings.\n\nWould you like to hear another joke? '
```
