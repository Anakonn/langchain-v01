---
translated: true
---

# SparkLLM Chat

SparkLLM 채팅 모델 API는 iFlyTek에서 제공하는 것입니다. 자세한 내용은 [iFlyTek 오픈 플랫폼](https://www.xfyun.cn/)을 참조하십시오.

## 기본 사용법

```python
"""기본 초기화 및 호출 예시"""
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

- [iFlyTek SparkLLM API 콘솔](https://console.xfyun.cn/services/bm3)에서 SparkLLM의 app_id, api_key 및 api_secret을 얻고, 환경 변수 `IFLYTEK_SPARK_APP_ID`, `IFLYTEK_SPARK_API_KEY` 및 `IFLYTEK_SPARK_API_SECRET`을 설정하거나 위 예제와 같이 `ChatSparkLLM`을 생성할 때 매개변수로 전달하십시오. 자세한 내용은 [iFlyTek SparkLLM 소개](https://xinghuo.xfyun.cn/sparkapi)를 참조하십시오.

## 스트리밍을 사용하는 ChatSparkLLM

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

## v2 사용 예시

```python
"""기본 초기화 및 호출 예시"""
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