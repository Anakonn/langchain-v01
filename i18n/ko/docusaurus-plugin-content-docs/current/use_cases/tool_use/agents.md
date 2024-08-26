---
sidebar_position: 1
translated: true
---

## 에이전트를 활용한 반복적인 도구 사용

체인은 사용자 입력에 필요한 도구 사용 순서를 알고 있을 때 유용합니다. 그러나 특정 사용 사례에서는 도구를 몇 번 사용하는지가 입력에 따라 달라집니다. 이러한 경우, 모델 자체가 도구를 몇 번 사용하고 어떤 순서로 사용할지 결정하도록 하고 싶습니다. [에이전트](/docs/modules/agents/)를 사용하면 이를 할 수 있습니다.

LangChain에는 다양한 사용 사례에 최적화된 여러 내장 에이전트가 있습니다. 모든 [에이전트 유형에 대해 여기에서 읽어보세요](/docs/modules/agents/agent_types/).

우리는 일반적으로 가장 신뢰할 수 있고 대부분의 사용 사례에 권장되는 [도구 호출 에이전트](/docs/modules/agents/agent_types/tool_calling/)를 사용할 것입니다. 여기서 "도구 호출"은 도구 정의를 명시적으로 모델에 전달하고 명시적인 도구 호출을 얻을 수 있는 특정 유형의 모델 API를 의미합니다. 도구 호출 모델에 대한 자세한 내용은 [이 가이드](/docs/modules/model_io/chat/function_calling/)를 참조하세요.

![에이전트](../../../../../../static/img/tool_agent.svg)

## 설정

다음 패키지를 설치해야 합니다:

```python
%pip install --upgrade --quiet langchain langchainhub
```

LangSmith를 사용하려면 아래 환경 변수를 설정하세요:

```python
import getpass
import os

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

```

## 도구 생성

먼저 호출할 도구를 생성해야 합니다. 이 예에서는 함수에서 사용자 정의 도구를 생성할 것입니다. 사용자 정의 도구 생성에 대한 자세한 내용은 [이 가이드](/docs/modules/tools/)를 참조하세요.

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
    "기수를 지수의 제곱으로 만듭니다."
    return base**exponent

tools = [multiply, add, exponentiate]
```

## 프롬프트 생성

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_tool_calling_agent
```

```python
# 사용할 프롬프트 가져오기 - 수정 가능합니다!

prompt = hub.pull("hwchase17/openai-tools-agent")
prompt.pretty_print()
```

```output
================================[1m 시스템 메시지 [0m================================

당신은 도움이 되는 비서입니다

=============================[1m 메시지 자리 표시자 [0m=============================

[33;1m[1;3m{chat_history}[0m

================================[1m 인간 메시지 [0m=================================

[33;1m[1;3m{input}[0m

=============================[1m 메시지 자리 표시자 [0m=============================

[33;1m[1;3m{agent_scratchpad}[0m
```

## 에이전트 생성

도구 호출 기능이 있는 모델을 사용해야 합니다. 도구 호출을 지원하는 모델을 [여기서 확인하세요](/docs/integrations/chat/).

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>

```python
# | echo: false

# | output: false

from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
```

```python
# 도구 호출 에이전트 생성

agent = create_tool_calling_agent(llm, tools, prompt)
```

```python
# 에이전트와 도구를 전달하여 에이전트 실행기를 생성합니다

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## 에이전트 호출

```python
agent_executor.invoke(
    {
        "input": "3을 다섯 번 제곱하고 열두와 셋의 합으로 곱한 다음, 전체 결과를 제곱합니다"
    }
)
```

```output
[1m> 새로운 AgentExecutor 체인에 진입 중...[0m
[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 3, 'exponent': 5}`
responded: [{'text': "자, 단계별로 분해해보겠습니다:", 'type': 'text'}, {'id': 'toolu_01CjdiDhDmMtaT1F4R7hSV5D', 'input': {'base': 3, 'exponent': 5}, 'name': 'exponentiate', 'type': 'tool_use'}]

[0m[38;5;200m[1;3m243[0m[32;1m[1;3m
Invoking: `add` with `{'first_int': 12, 'second_int': 3}`
responded: [{'text': '3을 다섯 번 제곱한 값은 243입니다.', 'type': 'text'}, {'id': 'toolu_01EKqn4E5w3Zj7bQ8s8xmi4R', 'input': {'first_int': 12, 'second_int': 3}, 'name': 'add', 'type': 'tool_use'}]

[0m[33;1m[1;3m15[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 243, 'second_int': 15}`
responded: [{'text': '12 + 3 = 15', 'type': 'text'}, {'id': 'toolu_017VZJgZBYbwMo2KGD6o6hsQ', 'input': {'first_int': 243, 'second_int': 15}, 'name': 'multiply', 'type': 'tool_use'}]

[0m[36;1m[1;3m3645[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 3645, 'second_int': 3645}`
responded: [{'text': '243 * 15 = 3645', 'type': 'text'}, {'id': 'toolu_01RtFCcQgbVGya3NVDgTYKTa', 'input': {'first_int': 3645, 'second_int': 3645}, 'name': 'multiply', 'type': 'tool_use'}]

[0m[36;1m[1;3m13286025[0m[32;1m[1;3m그래서 3645의 제곱은 13,286,025입니다.

따라서, 3을 다섯 번 제곱한 값(243)에 12 + 3(15)을 곱한 다음, 전체 결과를 제곱한 최종 결과는 13,286,025입니다.[0m

[1m> 체인이 완료되었습니다.[0m
```

```output
{'input': '3을 다섯 번 제곱하고 열두와 셋의 합으로 곱한 다음, 전체 결과를 제곱합니다',
 'output': '그래서 3645의 제곱은 13,286,025입니다.\n\n따라서, 3을 다섯 번 제곱한 값(243)에 12 + 3(15)을 곱한 다음, 전체 결과를 제곱한 최종 결과는 13,286,025입니다.'}
```

[LangSmith 추적을 여기에서 확인할 수 있습니다](https://smith.langchain.com/public/92694ff3-71b7-44ed-bc45-04bdf04d4689/r).