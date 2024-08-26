---
sidebar_label: Tongyi Qwen
translated: true
---

# ChatTongyi

Tongyi Qwen은 Alibaba의 Damo Academy에서 개발한 대형 언어 모델입니다. 이 모델은 자연어 이해와 의미 분석을 통해 사용자 입력을 기반으로 사용자의 의도를 이해하고 다양한 도메인과 작업에서 사용자에게 서비스를 제공합니다. 명확하고 자세한 지침을 제공함으로써 기대에 더 잘 부합하는 결과를 얻을 수 있습니다.
이 노트북에서는 [Tongyi](https://www.aliyun.com/product/dashscope)와 LangChain을 사용하는 방법을 소개합니다. 주로 `Chat`에 해당하는 `langchain/chat_models` 패키지를 다룹니다.

```python
# 패키지 설치

%pip install --upgrade --quiet dashscope
```

```python
# 새로운 토큰 가져오기: https://help.aliyun.com/document_detail/611472.html?spm=a2c4g.2399481.0.0

from getpass import getpass

DASHSCOPE_API_KEY = getpass()
```

```output
 ········
```

```python
import os

os.environ["DASHSCOPE_API_KEY"] = DASHSCOPE_API_KEY
```

```python
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.messages import HumanMessage

chatLLM = ChatTongyi(
    streaming=True,
)
res = chatLLM.stream([HumanMessage(content="hi")], streaming=True)
for r in res:
    print("chat resp:", r)
```

```output
chat resp: content='Hello! How' additional_kwargs={} example=False
chat resp: content=' can I assist you today?' additional_kwargs={} example=False
```

```python
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    ),
]
chatLLM(messages)
```

```output
AIMessageChunk(content="J'aime programmer.", additional_kwargs={}, example=False)
```

## 도구 호출

ChatTongyi는 도구와 그 인수를 설명하고, 모델이 호출할 도구와 해당 도구에 대한 입력을 JSON 객체로 반환하는 도구 호출 API를 지원합니다.

```python
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.messages import HumanMessage, SystemMessage

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "현재 시간을 알고 싶을 때 유용합니다.",
            "parameters": {},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "지정된 도시의 날씨를 조회하고 싶을 때 유용합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "도시 또는 군구, 예: 서울특별시, 부산광역시, 강남구 등.",
                    }
                },
            },
            "required": ["location"],
        },
    },
]

messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="What is the weather like in San Francisco?"),
]
chatLLM = ChatTongyi()
llm_kwargs = {"tools": tools, "result_format": "message"}
ai_message = chatLLM.bind(**llm_kwargs).invoke(messages)
ai_message
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'function': {'name': 'get_current_weather', 'arguments': '{"location": "San Francisco"}'}, 'id': '', 'type': 'function'}]}, response_metadata={'model_name': 'qwen-turbo', 'finish_reason': 'tool_calls', 'request_id': 'dae79197-8780-9b7e-8c15-6a83e2a53534', 'token_usage': {'input_tokens': 229, 'output_tokens': 19, 'total_tokens': 248}}, id='run-9e06f837-582b-473b-bb1f-5e99a68ecc10-0', tool_calls=[{'name': 'get_current_weather', 'args': {'location': 'San Francisco'}, 'id': ''}])
```