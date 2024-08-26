---
sidebar_position: 3
translated: true
---

# 도구 호출을 지원하지 않는 모델 사용하기

이 가이드에서는 특별한 모델 API(예: [빠른 시작](/docs/use_cases/tool_use/quickstart)에서 보여준 도구 호출) 없이 모델을 직접 프롬프트로 도구를 호출하는 체인을 구축하는 방법을 살펴보겠습니다.

## 설정

다음 패키지를 설치해야 합니다:

```python
%pip install --upgrade --quiet langchain langchain-openai
```

그리고 다음 환경 변수를 설정합니다:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# LangSmith를 사용하려면 아래 주석을 해제하세요:

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

```

## 도구 만들기

먼저, 호출할 도구를 만들어야 합니다. 이 예제에서는 함수에서 사용자 지정 도구를 만들 것입니다. 사용자 지정 도구 만들기와 관련된 모든 세부 정보는 [이 가이드](/docs/modules/tools/)를 참조하세요.

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

## 프롬프트 생성하기

모델이 액세스할 수 있는 도구, 해당 도구의 인수 및 모델의 원하는 출력 형식을 지정하는 프롬프트를 작성합니다. 이 경우 `{"name": "...", "arguments": {...}}` 형식의 JSON 블롭을 출력하도록 지시합니다.

```python
from langchain.tools.render import render_text_description

rendered_tools = render_text_description([multiply])
rendered_tools
```

```output
'multiply: multiply(first_int: int, second_int: int) -> int - 두 정수를 곱합니다.'
```

```python
from langchain_core.prompts import ChatPromptTemplate

system_prompt = f"""당신은 다음 도구 세트에 액세스할 수 있는 어시스턴트입니다. 각 도구의 이름과 설명은 다음과 같습니다:

{rendered_tools}

사용자 입력을 기반으로 사용할 도구의 이름과 입력값을 반환하세요. 'name'과 'arguments' 키가 있는 JSON 블롭으로 응답을 반환하세요."""

prompt = ChatPromptTemplate.from_messages(
    [("system", system_prompt), ("user", "{input}")]
)
```

## 출력 파서 추가하기

모델 출력을 JSON으로 구문 분석하기 위해 `JsonOutputParser`를 사용합니다.

```python
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = prompt | model | JsonOutputParser()
chain.invoke({"input": "13 곱하기 4는 얼마인가요"})
```

```output
{'name': 'multiply', 'arguments': {'first_int': 13, 'second_int': 4}}
```

## 도구 호출하기

모델에서 생성된 "arguments"를 전달하여 체인의 일부로 도구를 호출할 수 있습니다.

```python
from operator import itemgetter

chain = prompt | model | JsonOutputParser() | itemgetter("arguments") | multiply
chain.invoke({"input": "13 곱하기 4는 얼마인가요"})
```

```output
52
```

## 여러 도구에서 선택하기

체인이 선택할 수 있는 여러 도구가 있다고 가정해 봅시다.

```python
@tool
def add(first_int: int, second_int: int) -> int:
    "두 정수를 더합니다."
    return first_int + second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "밑수를 지수의 거듭제곱으로 만듭니다."
    return base**exponent
```

함수 호출을 통해 이렇게 할 수 있습니다:

모델에서 선택한 도구를 실행하려면 모델 출력을 기반으로 도구를 반환하는 함수를 사용하면 됩니다. 구체적으로, 우리의 함수는 모델 출력의 "arguments" 부분을 가져와 선택한 도구에 전달하는 서브체인을 반환합니다.

```python
tools = [add, exponentiate, multiply]


def tool_chain(model_output):
    tool_map = {tool.name: tool for tool in tools}
    chosen_tool = tool_map[model_output["name"]]
    return itemgetter("arguments") | chosen_tool
```

```python
rendered_tools = render_text_description(tools)
system_prompt = f"""당신은 다음 도구 세트에 액세스할 수 있는 어시스턴트입니다. 각 도구의 이름과 설명은 다음과 같습니다:

{rendered_tools}

사용자 입력을 기반으로 사용할 도구의 이름과 입력값을 반환하세요. 'name'과 'arguments' 키가 있는 JSON 블롭으로 응답을 반환하세요."""

prompt = ChatPromptTemplate.from_messages(
    [("system", system_prompt), ("user", "{input}")]
)

chain = prompt | model | JsonOutputParser() | tool_chain
chain.invoke({"input": "3 더하기 1132는 얼마인가요"})
```

```output
1135
```

## 도구 입력 반환하기

도구 출력뿐만 아니라 도구 입력을 반환하는 것도 유용할 수 있습니다. `RunnablePassthrough.assign`을 사용하여 쉽게 할 수 있습니다. 이는 RunnablePassthrough 구성 요소에 대한 입력(사전이라고 가정)을 받아 키를 추가하면서 현재 입력에 있는 모든 것을 그대로 전달합니다.

```python
from langchain_core.runnables import RunnablePassthrough

chain = (
    prompt | model | JsonOutputParser() | RunnablePassthrough.assign(output=tool_chain)
)
chain.invoke({"input": "3 더하기 1132는 얼마인가요"})
```

```output
{'name': 'add',
 'arguments': {'first_int': 3, 'second_int': 1132},
 'output': 1135}
```