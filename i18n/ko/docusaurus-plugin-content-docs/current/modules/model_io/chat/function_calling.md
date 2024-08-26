---
sidebar_position: 2
title: 도구/함수 호출
translated: true
---

# 도구 호출

:::info
우리는 "도구 호출"이라는 용어를 "함수 호출"과 혼용하여 사용합니다. 비록 함수 호출이 때때로 단일 함수의 호출을 의미하기도 하지만, 우리는 모든 모델이 각 메시지에서 여러 도구나 함수 호출을 반환할 수 있다고 간주합니다.
:::

:::tip
도구 호출을 지원하는 모든 모델 목록은 [여기](/docs/integrations/chat/)에서 확인하세요.
:::

도구 호출을 통해 모델은 주어진 프롬프트에 대해 사용자 정의 스키마와 일치하는 출력을 생성할 수 있습니다. 이름이 암시하듯 모델이 어떤 작업을 수행하는 것처럼 보이지만 실제로는 그렇지 않습니다! 모델은 도구에 대한 인수를 제시하며, 실제로 도구를 실행할지 여부는 사용자에게 달려 있습니다. 예를 들어 비정형 텍스트에서 [특정 스키마와 일치하는 출력을 추출](/docs/use_cases/extraction/)하려는 경우, 모델에 원하는 스키마와 일치하는 매개변수를 취하는 "추출" 도구를 제공하고 생성된 출력을 최종 결과로 처리할 수 있습니다.

도구 호출에는 이름, 인수 딕셔너리, 선택적 식별자가 포함됩니다. 인수 딕셔너리는 `{argument_name: argument_value}` 형식으로 구조화됩니다.

[Anthropic](https://www.anthropic.com/), [Cohere](https://cohere.com/), [Google](https://cloud.google.com/vertex-ai), [Mistral](https://mistral.ai/), [OpenAI](https://openai.com/) 등 많은 LLM 제공업체가 도구 호출 기능의 변형을 지원합니다. 이러한 기능은 일반적으로 LLM 요청에 사용 가능한 도구와 그 스키마를 포함할 수 있도록 하며, 응답에는 이러한 도구에 대한 호출을 포함할 수 있습니다. 예를 들어, 검색 엔진 도구가 주어진 경우, LLM은 쿼리를 처리하기 위해 먼저 검색 엔진에 대한 호출을 발행할 수 있습니다. LLM을 호출하는 시스템은 도구 호출을 수신하고 이를 실행한 후 출력 결과를 LLM에 반환하여 응답을 보완할 수 있습니다. LangChain은 [내장 도구](/docs/integrations/tools/) 모음과 [사용자 정의 도구](/docs/modules/tools/custom_tools)를 정의하는 여러 방법을 지원합니다. 도구 호출은 [도구 사용 체인 및 에이전트](/docs/use_cases/tool_use)를 구축하고 모델에서 구조화된 출력을 얻는 데 매우 유용합니다.

제공업체는 도구 스키마와 도구 호출을 포맷하는 데 다양한 규칙을 채택합니다. 예를 들어, Anthropic은 도구 호출을 더 큰 콘텐츠 블록 내에서 파싱된 구조로 반환합니다:

```python
[
  {
    "text": "<thinking>\nI should use a tool.\n</thinking>",
    "type": "text"
  },
  {
    "id": "id_value",
    "input": {"arg_name": "arg_value"},
    "name": "tool_name",
    "type": "tool_use"
  }
]
```

반면 OpenAI는 도구 호출을 별도의 매개변수로 분리하며, 인수는 JSON 문자열로 제공합니다:

```python
{
  "tool_calls": [
    {
      "id": "id_value",
      "function": {
        "arguments": '{"arg_name": "arg_value"}',
        "name": "tool_name"
      },
      "type": "function"
    }
  ]
}
```

LangChain은 도구를 정의하고, 이를 LLM에 전달하며, 도구 호출을 나타내는 표준 인터페이스를 구현합니다.

## 요청: 모델에 도구 전달

모델이 도구를 호출할 수 있도록 하려면, 채팅 요청을 할 때 도구 스키마를 전달해야 합니다. 도구 호출 기능을 지원하는 LangChain ChatModels는 도구 객체, Pydantic 클래스 또는 JSON 스키마 목록을 수신하고 이를 공급자별 예상 포맷으로 채팅 모델에 바인딩하는 `.bind_tools` 메서드를 구현합니다. 바인딩된 채팅 모델의 후속 호출은 모델 API 호출마다 도구 스키마를 포함합니다.

### 도구 스키마 정의: LangChain 도구

예를 들어, Python 함수에 `@tool` 데코레이터를 사용하여 사용자 정의 도구의 스키마를 정의할 수 있습니다:

```python
from langchain_core.tools import tool


@tool
def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b


@tool
def multiply(a: int, b: int) -> int:
    """Multiplies a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b


tools = [add, multiply]
```

### 도구 스키마 정의: Pydantic 클래스

동일하게 Pydantic을 사용하여 스키마를 정의할 수 있습니다. Pydantic은 도구 입력이 더 복잡할 때 유용합니다:

```python
from langchain_core.pydantic_v1 import BaseModel, Field


# Note that the docstrings here are crucial, as they will be passed along
# to the model along with the class name.
class add(BaseModel):
    """Add two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


class multiply(BaseModel):
    """Multiply two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


tools = [add, multiply]
```

다음과 같이 채팅 모델에 바인딩할 수 있습니다:

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
  fireworksParams={`model="accounts/fireworks/models/firefunction-v1", temperature=0`}
/>

### 도구 스키마 바인딩

`bind_tools()` 메서드를 사용하여 `Multiply`를 "도구"로 변환하고 모델에 바인딩할 수 있습니다(즉, 모델이 호출될 때마다 이를 전달).

```python
# | echo: false
# | output: false

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

```python
llm_with_tools = llm.bind_tools(tools)
```

## 요청: 도구 호출 강제

`bind_tools(tools)`를 사용하면 모델이 하나의 도구 호출, 여러 도구 호출 또는 도구 호출을 전혀 반환하지 않을 수 있습니다. 일부 모델은 도구 호출을 강제할 수 있는 `tool_choice` 매개변수를 지원합니다. 이를 지원하는 모델의 경우, 항상 호출할 도구의 이름을 `tool_choice="xyz_tool_name"`으로 전달할 수 있습니다. 또는 특정 도구를 지정하지 않고 최소 하나의 도구를 호출하도록 강제하려면 `tool_choice="any"`를 전달할 수 있습니다.

:::note
현재 `tool_choice="any"` 기능은 OpenAI, MistralAI, FireworksAI, Groq에서 지원됩니다.

현재 Anthropic은 `tool_choice`를 전혀 지원하지 않습니다.
:::

모델이 항상 multiply 도구를 호출하도록 하려면:

```python
always_multiply_llm = llm.bind_tools([multiply], tool_choice="multiply")
```

그리고 add 또는 multiply 중 하나를 항상 호출하도록 하려면:

```python
always_call_tool_llm = llm.bind_tools([add, multiply], tool_choice="any")
```

## 응답: 모델 출력에서 도구 호출 읽기

도구 호출이 LLM 응답에 포함된 경우, 이는 `.tool_calls` 속성의 [AIMessage](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage) 또는 [AIMessageChunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk) (스트리밍 시) 내의 [ToolCall](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolCall.html#langchain_core.messages.tool.ToolCall) 객체 목록으로 첨부됩니다. `ToolCall`은 도구 이름, 인수 값의 딕셔너리, 선택적 식별자를 포함하는 타이핑된 딕셔너리입니다. 도구 호출이 없는 메시지는 이 속성에 대해 빈 목록을 기본값으로 합니다.

예시:

```python
query = "What is 3 * 12? Also, what is 11 + 49?"

llm_with_tools.invoke(query).tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 3, 'b': 12},
  'id': 'call_UL7E2232GfDHIQGOM4gJfEDD'},
 {'name': 'add',
  'args': {'a': 11, 'b': 49},
  'id': 'call_VKw8t5tpAuzvbHgdAXe9mjUx'}]
```

`.tool_calls` 속성은 유효한 도구 호출을 포함해야 합니다. 때때로, 모델 제공업체가 잘못된 도구 호출(예: 유효하지 않은 JSON 인수)을 출력할 수 있습니다. 이러한 경우 파싱이 실패하면 [InvalidToolCall](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.InvalidToolCall.html#langchain_core.messages.tool.InvalidToolCall) 인스턴스가 `.invalid_tool_calls` 속성에 채워집니다. `InvalidToolCall`은 이름, 문자열 인수, 식별자, 오류 메시지를 가질 수 있습니다.

원하는 경우, [출력 파서](/docs/modules/model_io/output_parsers)를 사용하여 출력을 추가로 처리할 수 있습니다. 예를 들어, 원래의 Pydantic 클래스에 다시 변환할 수 있습니다:

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser

chain = llm_with_tools | PydanticToolsParser(tools=[multiply, add])
chain.invoke(query)
```

```output
[multiply(a=3, b=12), add(a=11, b=49)]
```

## 응답: 스트리밍

스트리밍 컨텍스트에서 도구가 호출될 때, [메시지 청크](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk)는 `.tool_call_chunks` 속성의 목록을 통해 [tool call chunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolCallChunk.html#langchain_core.messages.tool.ToolCallChunk) 객체로 채워집니다. `ToolCallChunk`는 도구 `name`, `args`, `id`에 대한 선택적 문자열 필드와 청크를 결합하는 데 사용할 수 있는 선택적 정수 필드 `index`를 포함합니다. 도구 호출의 일부분이 다른 청크에 걸쳐 스트리밍될 수 있기 때문에 필드는 선택적입니다(예: 인수의 하위 문자열을 포함하는 청크는 도구 이름과 ID에 대해 null 값을 가질 수 있음).

메시지 청크는 부모 메시지 클래스에서 상속되므로, 도구 호출 청크를 포함하는 [AIMessageChunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk)는 `.tool_calls` 및 `.invalid_tool_calls` 필드도 포함합니다. 이러한 필드는 메시지의 도구 호출 청크에서 최선의 노력을 기울여 파싱됩니다.

현재 모든 제공업체가 도구 호출에 대한 스트리밍을 지원하는 것은 아닙니다.

예시:

```python
async for chunk in llm_with_tools.astream(query):
    print(chunk.tool_call_chunks)
```

```output
[]
[{'name': 'multiply', 'args': '', 'id': 'call_5Gdgx3R2z97qIycWKixgD2OU', 'index': 0}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 0}]
[{'name': None, 'args': ': 3, ', 'id': None, 'index': 0}]
[{'name': None, 'args': '"b": 1', 'id': None, 'index': 0}]
[{'name': None, 'args': '2}', 'id': None, 'index': 0}]
[{'name': 'add', 'args': '', 'id': 'call_DpeKaF8pUCmLP0tkinhdmBgD', 'index': 1}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 1}]
[{'name': None, 'args': ': 11,', 'id': None, 'index': 1}]
[{'name': None, 'args': ' "b": ', 'id': None, 'index': 1}]
[{'name': None, 'args': '49}', 'id': None, 'index': 1}]
[]
```

메시지 청크를 추가하면 해당하는 도구 호출 청크가 병합된다는 점에 유의하세요. 이는 LangChain의 다양한 [도구 출력 파서](/docs/modules/model_io/output_parsers/types/openai_tools/)가 스트리밍을 지원하는 원칙입니다.

예를 들어, 아래에서는 도구 호출 청크를 누적합니다:

```python
first = True
async for chunk in llm_with_tools.astream(query):
    if first:
        gathered = chunk
        first = False
    else:
        gathered = gathered + chunk

    print(gathered.tool_call_chunks)
```

```output
[]
[{'name': 'multiply', 'args': '', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a"', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, ', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 1', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a"', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11,', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": ', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": 49}', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": 49}', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
```

```python
print(type(gathered.tool_call_chunks[0]["args"]))
```

```output
<class 'str'>
```

그리고 아래에서는 부분 파싱을 시연하기 위해 도구 호출을 누적합니다:

```python
first = True
async for chunk in llm_with_tools.astream(query):
    if first:
        gathered = chunk
        first = False
    else:
        gathered = gathered + chunk

    print(gathered.tool_calls)
```

```output
[]
[]
[{'name': 'multiply', 'args': {}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 1}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
```

```python
print(type(gathered.tool_calls[0]["args"]))
```

```output
<class 'dict'>
```

## 요청: 모델에 도구 출력 전달

모델이 생성한 도구 호출을 실제로 호출하고 도구 결과를 모델에 다시 전달하려면, `ToolMessage`를 사용할 수 있습니다.

```python
from langchain_core.messages import HumanMessage, ToolMessage


@tool
def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b


@tool
def multiply(a: int, b: int) -> int:
    """Multiplies a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b


tools = [add, multiply]
llm_with_tools = llm.bind_tools(tools)

messages = [HumanMessage(query)]
ai_msg = llm_with_tools.invoke(messages)
messages.append(ai_msg)

for tool_call in ai_msg.tool_calls:
    selected_tool = {"add": add, "multiply": multiply}[tool_call["name"].lower()]
    tool_output = selected_tool.invoke(tool_call["args"])
    messages.append(ToolMessage(tool_output, tool_call_id=tool_call["id"]))

messages
```

```output
[HumanMessage(content='What is 3 * 12? Also, what is 11 + 49?'),
 AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_Jja7J89XsjrOLA5rAjULqTSL', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'multiply'}, 'type': 'function'}, {'id': 'call_K4ArVEUjhl36EcSuxGN1nwvZ', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 49, 'prompt_tokens': 144, 'total_tokens': 193}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_a450710239', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-9db7e8e1-86d5-4015-9f43-f1d33abea64d-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_Jja7J89XsjrOLA5rAjULqTSL'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_K4ArVEUjhl36EcSuxGN1nwvZ'}]),
 ToolMessage(content='36', tool_call_id='call_Jja7J89XsjrOLA5rAjULqTSL'),
 ToolMessage(content='60', tool_call_id='call_K4ArVEUjhl36EcSuxGN1nwvZ')]
```

```python
llm_with_tools.invoke(messages)
```

```output
AIMessage(content='3 * 12 = 36\n11 + 49 = 60', response_metadata={'token_usage': {'completion_tokens': 16, 'prompt_tokens': 209, 'total_tokens': 225}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_3b956da36b', 'finish_reason': 'stop', 'logprobs': None}, id='run-a55f8cb5-6d6d-4835-9c6b-7de36b2590c7-0')
```

## 요청: 소수 샷 프롬프트

더 복잡한 도구 사용의 경우, 소수 샷 예제를 프롬프트에 추가하는 것이 매우 유용합니다. 이를 위해 `ToolCall`과 해당 `ToolMessage`가 포함된 `AIMessage`를 프롬프트에 추가할 수 있습니다.

:::note
대부분의 모델에서는 ToolCall과 ToolMessage ID가 일치하는 것이 중요합니다. 따라서 각 ToolCalls가 있는 AIMessage 뒤에는 해당 ID가 있는 ToolMessage가 따라와야 합니다.

예를 들어, 몇 가지 특별한 지시사항이 있어도 모델이 연산 순서에 의해 혼란스러울 수 있습니다:

```python
llm_with_tools.invoke(
    "Whats 119 times 8 minus 20. Don't do any math yourself, only use tools for math. Respect order of operations"
).tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_RofMKNQ2qbWAFaMsef4cpTS9'},
 {'name': 'add',
  'args': {'a': 952, 'b': -20},
  'id': 'call_HjOfoF8ceMCHmO3cpwG6oB3X'}]
```

모델은 아직 119 * 8의 결과를 알 수 없기 때문에 아무것도 더하려고 해서는 안 됩니다.

예제를 포함한 프롬프트를 추가하여 이러한 동작을 수정할 수 있습니다:

```python
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

examples = [
    HumanMessage(
        "What's the product of 317253 and 128472 plus four", name="example_user"
    ),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[
            {"name": "multiply", "args": {"x": 317253, "y": 128472}, "id": "1"}
        ],
    ),
    ToolMessage("16505054784", tool_call_id="1"),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[{"name": "add", "args": {"x": 16505054784, "y": 4}, "id": "2"}],
    ),
    ToolMessage("16505054788", tool_call_id="2"),
    AIMessage(
        "The product of 317253 and 128472 plus four is 16505054788",
        name="example_assistant",
    ),
]

system = """You are bad at math but are an expert at using a calculator.

Use past tool usage as an example of how to correctly use the tools."""
few_shot_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        *examples,
        ("human", "{query}"),
    ]
)

chain = {"query": RunnablePassthrough()} | few_shot_prompt | llm_with_tools
chain.invoke("Whats 119 times 8 minus 20").tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_tWwpzWqqc8dQtN13CyKZCVMe'}]
```

Seems like we get the correct output this time.

Here's what the [LangSmith trace](https://smith.langchain.com/public/f70550a1-585f-4c9d-a643-13148ab1616f/r) looks like.

## 다음 단계

- **출력 파싱**: 함수 호출 API 응답을 다양한 형식으로 추출하는 방법에 대해 알아보려면 [OpenAI Tools 출력
    파서](/docs/modules/model_io/output_parsers/types/openai_tools/) 및 [OpenAI Functions 출력
    파서](/docs/modules/model_io/output_parsers/types/openai_functions/)를 참조하세요.
- **구조화된 출력 체인**: [일부 모델은 생성자](/docs/modules/model_io/chat/structured_output/)를 가지고 있어 구조화된 출력 체인을 생성하는 작업을 처리합니다.
- **도구 사용**: [이 가이드](/docs/use_cases/tool_use/)에서 호출된 도구를 호출하는 체인 및 에이전트를 구성하는 방법을 참조하세요.
