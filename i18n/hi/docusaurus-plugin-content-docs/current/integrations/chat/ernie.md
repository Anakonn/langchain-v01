---
sidebar_label: एर्नी बॉट चैट
translated: true
---

# एर्नी बॉट चैट

[ERNIE-Bot](https://cloud.baidu.com/doc/WENXINWORKSHOP/s/jlil56u11) बाइडू द्वारा विकसित एक बड़ा भाषा मॉडल है, जो चीनी डेटा का एक विशाल मात्रा में कवर करता है।
यह नोटबुक एर्नी बॉट चैट मॉडल्स का उपयोग शुरू करने के बारे में कवर करता है।

**डिप्रीकेटेड चेतावनी**

हम `langchain_community.chat_models.ErnieBotChat` का उपयोग कर रहे उपयोगकर्ताओं को `langchain_community.chat_models.QianfanChatEndpoint` का उपयोग करने की सिफारिश करते हैं।

`QianfanChatEndpoint` के लिए दस्तावेज़ [यहाँ](/docs/integrations/chat/baidu_qianfan_endpoint/) है।

हम उपयोगकर्ताओं को `QianfanChatEndpoint` का उपयोग करने की सिफारिश क्यों करते हैं:

1. `QianfanChatEndpoint` क्वियानफान प्लेटफॉर्म में और अधिक एलएलएम का समर्थन करता है।
2. `QianfanChatEndpoint` स्ट्रीमिंग मोड का समर्थन करता है।
3. `QianfanChatEndpoint` फ़ंक्शन कॉलिंग उपयोग का समर्थन करता है।
4. `ErnieBotChat` का रखरखाव नहीं है और डिप्रीकेट किया गया है।

माइग्रेशन के लिए कुछ सुझाव:

- `ernie_client_id` को `qianfan_ak` में बदलें, साथ ही `ernie_client_secret` को `qianfan_sk` में भी बदलें।
- `qianfan` पैकेज इंस्टॉल करें। जैसे `pip install qianfan`
- `ErnieBotChat` को `QianfanChatEndpoint` में बदलें।

```python
from langchain_community.chat_models.baidu_qianfan_endpoint import QianfanChatEndpoint

chat = QianfanChatEndpoint(
    qianfan_ak="your qianfan ak",
    qianfan_sk="your qianfan sk",
)
```

## उपयोग

```python
from langchain_community.chat_models import ErnieBotChat
from langchain_core.messages import HumanMessage

chat = ErnieBotChat(
    ernie_client_id="YOUR_CLIENT_ID", ernie_client_secret="YOUR_CLIENT_SECRET"
)
```

या आप अपने पर्यावरण चर में `client_id` और `client_secret` सेट कर सकते हैं

```bash
export ERNIE_CLIENT_ID=YOUR_CLIENT_ID
export ERNIE_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

```python
chat([HumanMessage(content="hello there, who are you?")])
```

```output
AIMessage(content='Hello, I am an artificial intelligence language model. My purpose is to help users answer questions or provide information. What can I do for you?', additional_kwargs={}, example=False)
```
