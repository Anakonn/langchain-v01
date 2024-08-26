---
translated: true
---

# SparkLLMチャット

iFlyTekのSparkLLMチャットモデルAPI。詳細は[iFlyTek Open Platform](https://www.xfyun.cn/)を参照してください。

## 基本的な使い方

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

- [iFlyTek SparkLLM APIコンソール](https://console.xfyun.cn/services/bm3)からSparkLLMのapp_id、api_keyおよびapi_secretを取得し (詳細は[iFlyTek SparkLLM Intro](https://xinghuo.xfyun.cn/sparkapi)を参照)、環境変数`IFLYTEK_SPARK_APP_ID`、`IFLYTEK_SPARK_API_KEY`および`IFLYTEK_SPARK_API_SECRET`を設定するか、デモのように`ChatSparkLLM`を作成するときにパラメーターを渡してください。

## ストリーミング付きのChatSparkLLMの場合

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

## v2の場合

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
