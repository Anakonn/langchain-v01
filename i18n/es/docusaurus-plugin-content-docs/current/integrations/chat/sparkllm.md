---
translated: true
---

# SparkLLM Chat

Modelos de chat SparkLLM API de iFlyTek. Para más información, consulte [iFlyTek Open Platform](https://www.xfyun.cn/).

## Uso básico

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

- Obtenga el app_id, api_key y api_secret de SparkLLM de [iFlyTek SparkLLM API Console](https://console.xfyun.cn/services/bm3) (para más información, consulte [iFlyTek SparkLLM Intro](https://xinghuo.xfyun.cn/sparkapi)), luego establezca las variables de entorno `IFLYTEK_SPARK_APP_ID`, `IFLYTEK_SPARK_API_KEY` y `IFLYTEK_SPARK_API_SECRET` o pase los parámetros al crear `ChatSparkLLM` como se muestra en la demostración anterior.

## Para ChatSparkLLM con Streaming

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

## Para v2

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
