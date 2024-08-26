---
sidebar_position: 0
translated: true
---

# 빠른 시작

이 가이드에서는 도구를 호출하는 체인과 에이전트를 만드는 기본 방법을 설명합니다. 도구는 API, 함수, 데이터베이스 등 거의 모든 것이 될 수 있습니다. 도구를 사용하면 모델의 기능을 단순히 텍스트/메시지를 출력하는 것 이상으로 확장할 수 있습니다. 도구를 사용하는 모델을 사용할 때의 핵심은 모델이 올바른 도구를 선택하고 올바른 입력값을 제공하도록 정확하게 프롬프트를 작성하고 응답을 파싱하는 것입니다.

## 설정

이 가이드를 위해 다음 패키지를 설치해야 합니다:

```python
%pip install --upgrade --quiet langchain
```

[LangSmith](/docs/langsmith/)에서 실행을 추적하려면 다음 환경 변수를 주석 해제하고 설정하세요:

```python
import getpass
import os

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

```

## 도구 만들기

먼저, 호출할 도구를 만들어야 합니다. 이 예제에서는 함수에서 사용자 지정 도구를 만들 것입니다. 사용자 지정 도구 만들기에 대한 자세한 정보는 [이 가이드](/docs/modules/tools/)를 참조하세요.

```python
from langchain_core.tools import tool


@tool
def multiply(first_int: int, second_int: int) -> int:
    """두 정수를 곱합니다."""
    return first_int * second_int
```

```python
print(multiply.name)
print(multiply.description)
print(multiply.args)
```

```output
multiply
multiply(first_int: int, second_int: int) -> int - 두 정수를 곱합니다.
{'first_int': {'title': 'First Int', 'type': 'integer'}, 'second_int': {'title': 'Second Int', 'type': 'integer'}}
```

```python
multiply.invoke({"first_int": 4, "second_int": 5})
```

```output
20
```

## 체인

도구를 고정된 횟수만큼 사용해야 하는 경우, 이를 수행하는 체인을 만들 수 있습니다. 사용자 지정 숫자를 곱하는 간단한 체인을 만들어 보겠습니다.

![chain](../../../../../../static/img/tool_chain.svg)

### 도구/함수 호출

LLM과 도구를 함께 사용하는 가장 신뢰할 수 있는 방법 중 하나는 도구 호출 API(함수 호출이라고도 함)를 사용하는 것입니다. 이는 도구 호출을 명시적으로 지원하는 모델에서만 작동합니다. 도구 호출을 지원하는 모델 목록은 [여기](/docs/integrations/chat/)에서 확인할 수 있으며, 도구 호출 사용 방법에 대한 자세한 내용은 [이 가이드](/docs/modules/model_io/chat/function_calling)를 참조하세요.

먼저 모델과 도구를 정의하겠습니다. 하나의 도구 `multiply`부터 시작하겠습니다.

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>

```python
# | echo: false

# | output: false

from langchain_openai.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

`bind_tools`를 사용하여 도구의 정의를 각 모델 호출의 일부로 전달하여 모델이 적절할 때 도구를 호출할 수 있도록 합니다:

```python
llm_with_tools = llm.bind_tools([multiply])
```

모델이 도구를 호출하면, 이는 출력의 `AIMessage.tool_calls` 속성에 나타납니다:

```python
msg = llm_with_tools.invoke("5 곱하기 42는 얼마인가요")
msg.tool_calls
```

```output
[{'name': 'multiply',
  'args': {'first_int': 5, 'second_int': 42},
  'id': 'call_cCP9oA3tRz7HDrjFn1FdmDaG'}]
```

[LangSmith 트레이스를 여기서 확인하세요](https://smith.langchain.com/public/81ff0cbd-e05b-4720-bf61-2c9807edb708/r).

### 도구 호출하기

훌륭합니다! 도구 호출을 생성할 수 있습니다. 그러나 실제로 도구를 호출하려면 어떻게 해야 할까요? 이를 위해 생성된 도구 인수를 도구에 전달해야 합니다. 간단한 예로, 첫 번째 도구 호출의 인수를 추출하겠습니다:

```python
from operator import itemgetter

chain = llm_with_tools | (lambda x: x.tool_calls[0]["args"]) | multiply
chain.invoke("4 곱하기 23은 얼마인가요")
```

```output
92
```

[LangSmith 트레이스를 여기서 확인하세요](https://smith.langchain.com/public/16bbabb9-fc9b-41e5-a33d-487c42df4f85/r).

## 에이전트

체인은 사용자 입력에 대해 필요한 도구 사용 순서를 알고 있을 때 좋습니다. 그러나 특정 사용 사례에서는 도구를 몇 번 사용하는지 입력에 따라 달라집니다. 이러한 경우 모델 자체가 도구를 몇 번 사용하고 어떤 순서로 사용할지 결정하도록 하고 싶습니다. [에이전트](/docs/modules/agents/)는 이를 가능하게 해줍니다.

LangChain에는 다양한 사용 사례에 최적화된 여러 내장 에이전트가 있습니다. 모든 [에이전트 유형은 여기에서](/docs/modules/agents/agent_types/) 확인할 수 있습니다.

여기서는 가장 신뢰할 수 있는 종류이며 대부분의 사용 사례에 권장되는 [도구 호출 에이전트](/docs/modules/agents/agent_types/tool_calling/)를 사용하겠습니다.

![agent](../../../../../../static/img/tool_agent.svg)

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_tool_calling_agent
```

```python
# 사용할 프롬프트를 가져옵니다 - "agent_scratchpad" 및 "input" 변수를 포함하는 모든 프롬프트로 대체할 수 있습니다!

prompt = hub.pull("hwchase17/openai-tools-agent")
prompt.pretty_print()
```

```output
================================[1m System Message [0m================================

You are a helpful assistant

=============================[1m Messages Placeholder [0m=============================

[33;1m[1;3m{chat_history}[0m

================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m

=============================[1m Messages Placeholder [0m=============================

[33;1m[1;3m{agent_scratchpad}[0m
```

에이전트는 또한 여러 도구를 쉽게 사용할 수 있게 해줍니다. 여러 도구를 사용하는 체인을 구축하는 방법에 대해 자세히 알아보려면 [다중 도구 체인](/docs/use_cases/tool_use/multiple_tools) 페이지를 확인하세요.

```python
@tool
def add(first_int: int, second_int: int) -> int:
    "두 정수를 더합니다."
    return first_int + second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "밑수를 지수의 거듭제곱으로 만듭니다."
    return base**exponent


tools = [multiply, add, exponentiate]
```

```python
# 도구 호출 에이전트를 구성합니다

agent = create_tool_calling_agent(llm, tools, prompt)
```

```python
# 에이전트와 도구를 전달하여 에이전트 실행기를 만듭니다

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

에이전트를 사용하면 도구를 임의로 여러 번 사용할 수 있는 질문을 할 수 있습니다:

```python
agent_executor.invoke(
    {
        "input": "3을 다섯 제곱하고, 그것을 열두와 셋의 합으로 곱한 다음, 전체 결과를 제곱하세요"
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 3, 'exponent': 5}`


[0m[38;5;200m[1;3m243[0m[32;1m[1;3m
Invoking: `add` with `{'first_int': 12, 'second_int': 3}`


[0m[33;1m[1;3m15[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 243, 'second_int': 15}`


[0m[36;1m[1;3m3645[0m[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 405, 'exponent': 2}`


[0m[38;5;200m[1;3m164025[0m[32;1m[1;3m3을 다섯 제곱한 결과는 243입니다.

열두와 셋의 합은 15입니다.

243에 15를 곱하면 3645가 됩니다.

마지막으로 3645를 제곱하면 164025가 됩니다.[0m

[1m> Finished chain.[0m
```

```output
{'input': '3을 다섯 제곱하고, 그것을 열두와 셋의 합으로 곱한 다음, 전체 결과를 제곱하세요',
 'output': '3을 다섯 제곱한 결과는 243입니다. \n\n열두와 셋의 합은 15입니다. \n\n243에 15를 곱하면 3645가 됩니다. \n\n마지막으로 3645를 제곱하면 164025가 됩니다.'}
```

[LangSmith 트레이스를 여기서 확인하세요](https://smith.langchain.com/public/eeeb27a4-a2f8-4f06-a3af-9c983f76146c/r).

## 다음 단계

여기에서는 체인과 에이전트를 사용하여 도구를 사용하는 기본 방법을 설명했습니다. 다음 섹션을 탐색하는 것을 권장합니다:

- [에이전트](/docs/modules/agents/): 에이전트와 관련된 모든 것.
- [다중 도구 선택](/docs/use_cases/tool_use/multiple_tools): 여러 도구에서 선택하는 도구 체인을 만드는 방법.
- [도구 사용을 위한 프롬프트 작성](/docs/use_cases/tool_use/prompting): 함수 호출 API를 사용하지 않고 모델을 직접 프롬프트하여 도구 체인을 만드는 방법.
- [병렬 도구 사용](/docs/use_cases/tool_use/parallel): 여러 도구를 동시에 호출하는 도구 체인을 만드는 방법.