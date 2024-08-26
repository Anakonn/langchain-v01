---
sidebar_position: 2
translated: true
---

# 여러 도구 중 선택하기

[빠른 시작](/docs/use_cases/tool_use/quickstart)에서는 단일 `multiply` 도구를 호출하는 체인을 만드는 방법을 살펴보았습니다. 이제 이 체인이 여러 도구 중에서 선택하여 호출할 수 있도록 확장하는 방법을 살펴보겠습니다. 기본적으로 여러 도구를 라우팅할 수 있는 [에이전트](/docs/use_cases/tool_use/agents)와 달리 체인에 집중하겠습니다.

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

## 도구

기존에 `multiply` 도구가 있었음을 기억하세요:

```python
from langchain_core.tools import tool

@tool
def multiply(first_int: int, second_int: int) -> int:
    """두 정수를 곱합니다."""
    return first_int * second_int
```

이제 `exponentiate`와 `add` 도구를 추가해보겠습니다:

```python
@tool
def add(first_int: int, second_int: int) -> int:
    "두 정수를 더합니다."
    return first_int + second_int

@tool
def exponentiate(base: int, exponent: int) -> int:
    "기수를 지수로 거듭제곱합니다."
    return base**exponent
```

하나의 도구를 사용하는 것과 여러 도구를 사용하는 것의 주요 차이점은 모델이 사전에 어떤 도구를 호출할지 확신할 수 없다는 점입니다. 따라서 [빠른 시작](/docs/use_cases/tool_use/quickstart)에서처럼 특정 도구를 체인에 하드코딩할 수 없습니다. 대신 `call_tools`라는 `RunnableLambda`를 추가하여 도구 호출이 포함된 AI 메시지를 받아 올바른 도구로 라우팅합니다.

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>

```python
# | echo: false

# | output: false

from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
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
    """간단한 순차 도구 호출 헬퍼."""
    tool_map = {tool.name: tool for tool in tools}
    tool_calls = msg.tool_calls.copy()
    for tool_call in tool_calls:
        tool_call["output"] = tool_map[tool_call["name"]].invoke(tool_call["args"])
    return tool_calls

chain = llm_with_tools | call_tools
```

```python
chain.invoke("23 곱하기 7은 얼마인가요")
```

```output
[{'name': 'multiply',
  'args': {'first_int': 23, 'second_int': 7},
  'id': 'toolu_01Wf8kUs36kxRKLDL8vs7G8q',
  'output': 161}]
```

```python
chain.invoke("백만 더하기 십억")
```

```output
[{'name': 'add',
  'args': {'first_int': 1000000, 'second_int': 1000000000},
  'id': 'toolu_012aK4xZBQg2sXARsFZnqxHh',
  'output': 1001000000}]
```

```python
chain.invoke("서른일곱을 세제곱해줘")
```

```output
[{'name': 'exponentiate',
  'args': {'base': 37, 'exponent': 3},
  'id': 'toolu_01VDU6X3ugDb9cpnnmCZFPbC',
  'output': 50653}]
```