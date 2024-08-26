---
translated: true
---

# SparkLLM चैट

iFlyTek द्वारा SparkLLM चैट मॉडल्स API। अधिक जानकारी के लिए, देखें [iFlyTek Open Platform](https://www.xfyun.cn/)।

## मूलभूत उपयोग

```python
"""For basic init and call"""
from langchain_community.chat_models import ChatSparkLLM
from langchain_core.messages import HumanMessage

chat = ChatSparkLLM(
    spark_app_id="<app_id>", spark_api_key="<api_key>", spark_api_secret="<api_secret>"
)
message = HumanMessage(content="Hello")
chat([message])
```

```output
AIMessage(content='Hello! How can I help you today?')
```

- [iFlyTek SparkLLM API कंसोल](https://console.xfyun.cn/services/bm3) से SparkLLM का app_id, api_key और api_secret प्राप्त करें (अधिक जानकारी के लिए, देखें [iFlyTek SparkLLM परिचय](https://xinghuo.xfyun.cn/sparkapi)), फिर `IFLYTEK_SPARK_APP_ID`, `IFLYTEK_SPARK_API_KEY` और `IFLYTEK_SPARK_API_SECRET` पर्यावरण चर सेट करें या ऊपर दिए गए डेमो के रूप में पैरामीटर पास करें।

## स्ट्रीमिंग के साथ ChatSparkLLM के लिए

```python
chat = ChatSparkLLM(
    spark_app_id="<app_id>",
    spark_api_key="<api_key>",
    spark_api_secret="<api_secret>",
    streaming=True,
)
for chunk in chat.stream("Hello!"):
    print(chunk.content, end="")
```

```output
Hello! How can I help you today?
```

## v2 के लिए

```python
"""For basic init and call"""
from langchain_community.chat_models import ChatSparkLLM
from langchain_core.messages import HumanMessage

chat = ChatSparkLLM(
    spark_app_id="<app_id>",
    spark_api_key="<api_key>",
    spark_api_secret="<api_secret>",
    spark_api_url="wss://spark-api.xf-yun.com/v2.1/chat",
    spark_llm_domain="generalv2",
)
message = HumanMessage(content="Hello")
chat([message])
```
