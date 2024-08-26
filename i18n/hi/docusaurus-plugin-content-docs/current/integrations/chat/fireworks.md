---
sidebar_label: फायरवर्क्स
translated: true
---

# चैटफायरवर्क्स

>[फायरवर्क्स](https://app.fireworks.ai/) जेनरेटिव एआई पर उत्पाद विकास को त्वरित करता है, जो एक नवीन एआई प्रयोग और उत्पादन प्लेटफॉर्म बनाता है।

यह उदाहरण LangChain का उपयोग करके `ChatFireworks` मॉडल के साथ कैसे काम करना है, इस बारे में बताता है।
%pip install langchain-fireworks

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_fireworks import ChatFireworks
```

# सेटअप

1. सुनिश्चित करें कि `langchain-fireworks` पैकेज आपके वातावरण में स्थापित है।
2. [Fireworks AI](http://fireworks.ai) में साइन इन करें और हमारे मॉडल तक पहुंचने के लिए एक API कुंजी प्राप्त करें, और यह `FIREWORKS_API_KEY` पर्यावरण चर के रूप में सेट है।
3. एक मॉडल आईडी का उपयोग करके अपना मॉडल सेट करें। यदि मॉडल सेट नहीं है, तो डिफ़ॉल्ट मॉडल fireworks-llama-v2-7b-chat है। [app.fireworks.ai](https://app.fireworks.ai) पर पूर्ण, सबसे अद्यतन मॉडल सूची देखें।

```python
import getpass
import os

if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Fireworks API Key:")

# Initialize a Fireworks chat model
chat = ChatFireworks(model="accounts/fireworks/models/mixtral-8x7b-instruct")
```

# मॉडल को सीधे कॉल करना

आप उत्तर प्राप्त करने के लिए एक सिस्टम और मानव संदेश के साथ मॉडल को सीधे कॉल कर सकते हैं।

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

# टूल कॉलिंग

Fireworks [`FireFunction-v1` टूल कॉलिंग मॉडल](https://fireworks.ai/blog/firefunction-v1-gpt-4-level-function-calling) प्रदान करता है। आप इसका उपयोग संरचित आउटपुट और फ़ंक्शन कॉलिंग उपयोग मामलों के लिए कर सकते हैं:

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
