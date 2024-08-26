---
translated: true
---

# SparkLLM Chat

Modèles de chat SparkLLM API par iFlyTek. Pour plus d'informations, voir [iFlyTek Open Platform](https://www.xfyun.cn/).

## Utilisation de base

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

- Obtenez l'app_id, api_key et api_secret de SparkLLM depuis [iFlyTek SparkLLM API Console](https://console.xfyun.cn/services/bm3) (pour plus d'informations, voir [iFlyTek SparkLLM Intro](https://xinghuo.xfyun.cn/sparkapi)), puis définissez les variables d'environnement `IFLYTEK_SPARK_APP_ID`, `IFLYTEK_SPARK_API_KEY` et `IFLYTEK_SPARK_API_SECRET` ou transmettez les paramètres lors de la création de `ChatSparkLLM` comme dans la démonstration ci-dessus.

## Pour ChatSparkLLM avec Streaming

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

## Pour v2

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
