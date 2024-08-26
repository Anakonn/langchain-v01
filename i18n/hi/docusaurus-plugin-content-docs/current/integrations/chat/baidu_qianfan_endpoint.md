---
sidebar_label: बैडू क़्यानफ़ान
translated: true
---

# क़्यानफ़ानचैटएंडपॉइंट

बैडू AI क्लाउड क़्यानफ़ान प्लेटफ़ॉर्म एक वन-स्टॉप बड़े मॉडल विकास और सेवा संचालन प्लेटफ़ॉर्म है जो उद्यम डेवलपर्स के लिए है। क़्यानफ़ान न केवल वेनक्सिन यियान (ERNIE-Bot) और तीसरे पक्ष के ओपन-सोर्स मॉडल्स को प्रदान करता है, बल्कि विभिन्न AI विकास उपकरण और पूरा विकास वातावरण भी प्रदान करता है, जो ग्राहकों को बड़े मॉडल अनुप्रयोगों का उपयोग और विकास आसान बनाता है।

मूलभूत रूप से, ये मॉडल निम्नलिखित प्रकार में विभाजित हैं:

- एम्बेडिंग
- चैट
- पूर्णता

इस नोटबुक में, हम लैंगचेन के साथ [क़्यानफ़ान](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html) का उपयोग करने के बारे में बताएंगे, मुख्य रूप से `चैट` के लिए जो लैंगचेन में `langchain/chat_models` पैकेज से संबंधित है:

## API प्रारंभीकरण

बैडू क़्यानफ़ान पर आधारित एलएलएम सेवाओं का उपयोग करने के लिए, आपको इन पैरामीटरों को प्रारंभ करना होगा:

आप या तो पर्यावरण चर में AK,SK को प्रारंभ कर सकते हैं या पैरामीटर प्रारंभ कर सकते हैं:

```base
export QIANFAN_AK=XXX
export QIANFAN_SK=XXX
```

## वर्तमान में समर्थित मॉडल:

- ERNIE-Bot-turbo (डिफ़ॉल्ट मॉडल)
- ERNIE-Bot
- BLOOMZ-7B
- Llama-2-7b-chat
- Llama-2-13b-chat
- Llama-2-70b-chat
- Qianfan-BLOOMZ-7B-compressed
- Qianfan-Chinese-Llama-2-7B
- ChatGLM2-6B-32K
- AquilaChat-7B

## सेटअप

```python
"""For basic init and call"""
import os

from langchain_community.chat_models import QianfanChatEndpoint
from langchain_core.language_models.chat_models import HumanMessage

os.environ["QIANFAN_AK"] = "Your_api_key"
os.environ["QIANFAN_SK"] = "You_secret_Key"
```

## उपयोग

```python
chat = QianfanChatEndpoint(streaming=True)
messages = [HumanMessage(content="Hello")]
chat.invoke(messages)
```

```output
AIMessage(content='您好！请问您需要什么帮助？我将尽力回答您的问题。')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='您好！有什么我可以帮助您的吗？')
```

```python
chat.batch([messages])
```

```output
[AIMessage(content='您好！有什么我可以帮助您的吗？')]
```

### स्ट्रीमिंग

```python
try:
    for chunk in chat.stream(messages):
        print(chunk.content, end="", flush=True)
except TypeError as e:
    print("")
```

```output
您好！有什么我可以帮助您的吗？
```

## क़्यानफ़ान में अलग-अलग मॉडल का उपयोग करें

डिफ़ॉल्ट मॉडल ERNIE-Bot-turbo है, अगर आप अपना खुद का मॉडल ERNIE Bot या तीसरे पक्ष के ओपन-सोर्स मॉडल पर तैनात करना चाहते हैं, तो आप इन चरणों का पालन कर सकते हैं:

1. (वैकल्पिक, अगर मॉडल डिफ़ॉल्ट मॉडलों में शामिल हैं, तो इसे छोड़ दें) क़्यानफ़ान कंसोल में अपना मॉडल तैनात करें, अपना खुद का कस्टमाइज़्ड तैनाती एंडपॉइंट प्राप्त करें।
2. प्रारंभीकरण में `endpoint` फ़ील्ड को सेट करें:

```python
chatBot = QianfanChatEndpoint(
    streaming=True,
    model="ERNIE-Bot",
)

messages = [HumanMessage(content="Hello")]
chatBot.invoke(messages)
```

```output
AIMessage(content='Hello，可以回答问题了，我会竭尽全力为您解答，请问有什么问题吗？')
```

## मॉडल पैरामीटर:

अभी तक, केवल `ERNIE-Bot` और `ERNIE-Bot-turbo` मॉडल पैरामीटर नीचे समर्थित हैं, हम भविष्य में और मॉडल समर्थन कर सकते हैं।

- तापमान
- शीर्ष_पी
- दंड_स्कोर

```python
chat.invoke(
    [HumanMessage(content="Hello")],
    **{"top_p": 0.4, "temperature": 0.1, "penalty_score": 1},
)
```

```output
AIMessage(content='您好！有什么我可以帮助您的吗？')
```
