---
translated: true
---

# 병렬 도구 사용

[다중 도구 체인](/docs/use_cases/tool_use/multiple_tools) 가이드에서는 여러 도구 중에서 선택하는 함수 호출 체인을 구축하는 방법을 살펴보았습니다. 2023년 가을에 출시된 OpenAI 모델과 같은 일부 모델은 병렬 함수 호출도 지원하여 단일 모델 호출에서 여러 함수를 호출할 수 있습니다(또는 동일한 함수를 여러 번 호출할 수 있습니다). 여러 도구 가이드에서 이전에 작성한 체인은 사실 이미 이를 지원합니다.

## 설정

이 가이드를 위해 다음 패키지를 설치해야 합니다:

```python
%pip install --upgrade --quiet langchain-core
```

[LangSmith](/docs/langsmith/)에서 실행을 추적하려면 다음 환경 변수를 주석 해제하고 설정하세요:

```python
import getpass
import os

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

```

## 도구들

```python
from langchain_core.tools import tool


@tool
def multiply(first_int: int, second_int: int) -> int:
    """두 정수를 곱합니다."""
    return first_int * second_int


@tool
def add(first_int: int, second_int: int) -> int:
    "두 정수를 더합니다."
    return first_int + second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "밑수를 지수의 거듭제곱으로 만듭니다."
    return base**exponent
```

# 체인

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" hideGoogle="true"/>

```python
# | echo: false

# | output: false

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

```python
from operator import itemgetter
from typing import Dict, List, Union

from langchain_core.messages import AIMessage
from langchain_core.runnables import (
    Runnable,
    RunnableLambda,
    RunnableMap,
    RunnablePassthrough,
)

tools = [multiply, exponentiate, add]
llm_with_tools = llm.bind_tools(tools)
tool_map = {tool.name: tool for tool in tools}


def call_tools(msg: AIMessage) -> Runnable:
    """간단한 순차적 도구 호출 도우미."""
    tool_map = {tool.name: tool for tool in tools}
    tool_calls = msg.tool_calls.copy()
    for tool_call in tool_calls:
        tool_call["output"] = tool_map[tool_call["name"]].invoke(tool_call["args"])
    return tool_calls


chain = llm_with_tools | call_tools
```

```python
chain.invoke(
    "23 곱하기 7은 얼마인가요, 그리고 5 곱하기 18은 얼마이고 백만 더하기 십억 그리고 서른일곱을 세제곱하세요"
)
```

```output
[{'name': 'multiply',
  'args': {'first_int': 23, 'second_int': 7},
  'id': 'call_22tgOrsVLyLMsl2RLbUhtycw',
  'output': 161},
 {'name': 'multiply',
  'args': {'first_int': 5, 'second_int': 18},
  'id': 'call_EbKHEG3TjqBhEwb7aoxUtgzf',
  'output': 90},
 {'name': 'add',
  'args': {'first_int': 1000000, 'second_int': 1000000000},
  'id': 'call_LUhu2IT3vINxlTc5fCVY6Nhi',
  'output': 1001000000},
 {'name': 'exponentiate',
  'args': {'base': 37, 'exponent': 3},
  'id': 'call_bnCZIXelOKkmcyd4uGXId9Ct',
  'output': 50653}]
```