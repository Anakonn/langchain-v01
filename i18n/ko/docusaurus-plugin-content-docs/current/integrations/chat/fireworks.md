---
sidebar_label: Fireworks
translated: true
---

# ChatFireworks

> [Fireworks](https://app.fireworks.ai/)는 혁신적인 AI 실험 및 생산 플랫폼을 통해 생성 AI 제품 개발을 가속화합니다.

이 예제는 `ChatFireworks` 모델과 상호 작용하는 방법을 설명합니다.

%pip install langchain-fireworks

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_fireworks import ChatFireworks
```

# 설정

1. `langchain-fireworks` 패키지가 환경에 설치되어 있는지 확인하십시오.
2. [Fireworks AI](http://fireworks.ai)에 로그인하여 API 키를 받고, 이를 `FIREWORKS_API_KEY` 환경 변수로 설정하십시오.
3. 모델 ID를 사용하여 모델을 설정하십시오. 모델이 설정되지 않은 경우 기본 모델은 fireworks-llama-v2-7b-chat입니다. 최신 모델 목록은 [app.fireworks.ai](https://app.fireworks.ai)에서 확인할 수 있습니다.

```python
import getpass
import os

if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Fireworks API Key:")

# Fireworks 채팅 모델 초기화

chat = ChatFireworks(model="accounts/fireworks/models/mixtral-8x7b-instruct")
```

# 모델 직접 호출

시스템 메시지와 사용자 메시지를 사용하여 모델을 직접 호출할 수 있습니다.

```python
# ChatFireworks 래퍼

system_message = SystemMessage(content="You are to chat with the user.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

```output
AIMessage(content="Hello! I'm an AI language model, a helpful assistant designed to chat and assist you with any questions or information you might need. I'm here to make your experience as smooth and enjoyable as possible. How can I assist you today?")
```

```python
# 추가 매개변수 설정: temperature, max_tokens, top_p

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

# 도구 호출

Fireworks는 구조화된 출력 및 함수 호출 사용 사례를 위해 [`FireFunction-v1` 도구 호출 모델](https://fireworks.ai/blog/firefunction-v1-gpt-4-level-function-calling)을 제공합니다.

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