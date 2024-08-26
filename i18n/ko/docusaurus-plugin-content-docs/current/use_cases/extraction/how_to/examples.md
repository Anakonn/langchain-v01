---
sidebar_position: 1
title: 참조 예제 사용
translated: true
---

추출 품질은 LLM에 참조 예제를 제공하여 종종 개선될 수 있습니다.

:::tip
이 튜토리얼은 도구 호출 모델과 함께 예제를 사용하는 방법에 중점을 두지만, 이 기술은 일반적으로 적용 가능하며 JSON 모드 또는 프롬프트 기반 기술에도 효과적입니다.
:::

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# 지침과 추가 컨텍스트를 제공하기 위해 맞춤 프롬프트를 정의합니다.

# 1) 추출 품질을 향상시키기 위해 프롬프트 템플릿에 예제를 추가할 수 있습니다.

# 2) 텍스트가 추출된 문서에 대한 메타데이터와 같은 추가 매개변수를 도입할 수 있습니다.

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "당신은 전문가 추출 알고리즘입니다. "
            "텍스트에서 관련 정보를 추출하십시오. "
            "추출하려는 속성의 값을 모를 경우 "
            "해당 속성의 값으로 null을 반환하십시오.",
        ),
        # ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        MessagesPlaceholder("examples"),  # <-- 예제!
        # ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
        ("human", "{text}"),
    ]
)
```

템플릿을 테스트해 봅시다:

```python
from langchain_core.messages import (
    HumanMessage,
)

prompt.invoke(
    {"text": "이것은 일부 텍스트입니다", "examples": [HumanMessage(content="테스트 1 2 3")]}
)
```

```output
ChatPromptValue(messages=[SystemMessage(content="당신은 전문가 추출 알고리즘입니다. 텍스트에서 관련 정보를 추출하십시오. 추출하려는 속성의 값을 모를 경우 해당 속성의 값으로 null을 반환하십시오."), HumanMessage(content='테스트 1 2 3'), HumanMessage(content='이것은 일부 텍스트입니다')])
```

## 스키마 정의

빠른 시작에서 사용한 person 스키마를 다시 사용해 보겠습니다.

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI


class Person(BaseModel):
    """사람에 대한 정보"""

    # ^ 엔티티 Person에 대한 Doc-string.
    # 이 Doc-string은 스키마 Person의 설명으로 LLM에 전달되어
    # 추출 결과를 개선하는 데 도움이 될 수 있습니다.

    # 주의할 점:
    # 1. 각 필드는 `optional`입니다 -- 이를 통해 모델이 추출을 거부할 수 있습니다!
    # 2. 각 필드는 `description`을 가지고 있습니다 -- 이 설명은 LLM에 의해 사용됩니다.
    # 좋은 설명이 있으면 추출 결과를 개선할 수 있습니다.
    name: Optional[str] = Field(..., description="사람의 이름")
    hair_color: Optional[str] = Field(
        ..., description="알려진 경우 사람의 머리 색깔"
    )
    height_in_meters: Optional[str] = Field(..., description="미터 단위로 측정한 키")


class Data(BaseModel):
    """사람들에 대한 추출된 데이터"""

    # 여러 엔티티를 추출할 수 있도록 모델을 생성합니다.
    people: List[Person]
```

## 참조 예제 정의

예제는 입력-출력 쌍의 목록으로 정의될 수 있습니다.

각 예제는 예제 `입력` 텍스트와 텍스트에서 추출해야 할 내용을 보여주는 예제 `출력`을 포함합니다.

:::important
이 부분은 약간 복잡할 수 있으니, 이해되지 않더라도 무시해도 괜찮습니다!

예제의 형식은 사용된 API(예: 도구 호출 또는 JSON 모드 등)에 맞아야 합니다.

여기서는 형식화된 예제가 도구 호출 API에 대해 예상되는 형식과 일치할 것입니다.
:::

```python
import uuid
from typing import Dict, List, TypedDict

from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
from langchain_core.pydantic_v1 import BaseModel, Field


class Example(TypedDict):
    """텍스트 입력과 예상 도구 호출로 구성된 예제의 표현.

    추출의 경우, 도구 호출은 pydantic 모델의 인스턴스로 표현됩니다.
    """

    input: str  # 이것은 예제 텍스트입니다
    tool_calls: List[BaseModel]  # 추출해야 할 pydantic 모델의 인스턴스


def tool_example_to_messages(example: Example) -> List[BaseMessage]:
    """예제를 LLM에 입력할 수 있는 메시지 목록으로 변환합니다.

    이 코드는 우리의 예제를 채팅 모델에 입력할 수 있는 메시지 목록으로 변환하는 어댑터입니다.

    예제당 메시지 목록은 다음과 같습니다:

    1) HumanMessage: 추출할 내용을 포함하는 메시지입니다.
    2) AIMessage: 모델에서 추출한 정보를 포함하는 메시지입니다.
    3) ToolMessage: 모델이 도구를 올바르게 요청했음을 모델에게 확인하는 메시지입니다.

    ToolMessage는 일부 채팅 모델이 에이전트보다 추출 사용 사례에 최적화되어 있기 때문에 필요합니다.
    """
    messages: List[BaseMessage] = [HumanMessage(content=example["input"])]
    openai_tool_calls = []
    for tool_call in example["tool_calls"]:
        openai_tool_calls.append(
            {
                "id": str(uuid.uuid4()),
                "type": "function",
                "function": {
                    # 현재 함수 이름은 pydantic 모델 이름과 일치합니다.
                    # 이것은 현재 API에서 암시적으로 제공되며,
                    # 시간이 지남에 따라 개선될 것입니다.
                    "name": tool_call.__class__.__name__,
                    "arguments": tool_call.json(),
                },
            }
        )
    messages.append(
        AIMessage(content="", additional_kwargs={"tool_calls": openai_tool_calls})
    )
    tool_outputs = example.get("tool_outputs") or [
        "You have correctly called this tool."
    ] * len(openai_tool_calls)
    for output, tool_call in zip(tool_outputs, openai_tool_calls):
        messages.append(ToolMessage(content=output, tool_call_id=tool_call["id"]))
    return messages
```

다음으로 예제를 정의하고 메시지 형식으로 변환해 봅시다.

```python
examples = [
    (
        "The ocean is vast and blue. It's more than 20,000 feet deep. There are many fish in it.",
        Person(name=None, height_in_meters=None, hair_color=None),
    ),
    (
        "Fiona traveled far from France to Spain.",
        Person(name="Fiona", height_in_meters=None, hair_color=None),
    ),
]


messages = []

for text, tool_call in examples:
    messages.extend(
        tool_example_to_messages({"input": text, "tool_calls": [tool_call]})
    )
```

프롬프트를 테스트해 봅시다

```python
prompt.invoke({"text": "이것은 일부 텍스트입니다", "examples": messages})
```

```output
ChatPromptValue(messages=[SystemMessage(content="당신은 전문가 추출 알고리즘입니다. 텍스트에서 관련 정보를 추출하십시오. 추출하려는 속성의 값을 모를 경우 해당 속성의 값으로 null을 반환하십시오."), HumanMessage(content="The ocean is vast and blue. It's more than 20,000 feet deep. There are many fish in it."), AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'c75e57cc-8212-4959-81e9-9477b0b79126', 'type': 'function', 'function': {'name': 'Person', 'arguments': '{"name": null, "hair_color": null, "height_in_meters": null}'}}]}), ToolMessage(content='You have correctly called this tool.', tool_call_id='c75e57cc-8212-4959-81e9-9477b0b79126'), HumanMessage(content='Fiona traveled far from France to Spain.'), AIMessage(content='', additional_kwargs={'tool_calls': [{'id': '69da50b5-e427-44be-b396-1e56d821c6b0', 'type': 'function', 'function': {'name': 'Person', 'arguments': '{"name": "Fiona", "hair_color": null, "height_in_meters": null}'}}]}), ToolMessage(content='You have correctly called this tool.', tool_call_id='69da50b5-e427-44be-b396-1e56d821c6b0'), HumanMessage(content='이것은 일부 텍스트입니다')])
```

## 추출기 생성

여기서는 **gpt-4**를 사용하여 추출기를 생성합니다.

```python
# 도구 호출 모드를 사용합니다, 이는

# 도구 호출이 가능한 모델이 필요합니다.

llm = ChatOpenAI(
    # 가능한 최고의 품질을 파악하기 위해
    # 좋은 모델로 벤치마크를 고려하세요.
    model="gpt-4-0125-preview",
    # 추출을 위해 온도를 0으로 설정하는 것을 기억하세요!
    temperature=0,
)


runnable = prompt | llm.with_structured_output(
    schema=Data,
    method="function_calling",
    include_raw=False,
)
```

```output
/Users/harrisonchase/workplace/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

## 예제 없이 😿

아주 간단한 테스트 케이스에서도 gpt-4를 사용하고 있지만 실패하고 있음을 알 수 있습니다!

```python
for _ in range(5):
    text = "태양계는 크지만 지구에는 달이 하나뿐입니다."
    print(runnable.invoke({"text": text, "examples": []}))
```

```output
people=[]
people=[Person(name='지구', hair_color=None, height_in_meters=None)]
people=[Person(name='지구', hair_color=None, height_in_meters=None)]
people=[]
people=[]
```

## 예제와 함께 😻

참조 예제가 실패를 수정하는 데 도움을 줍니다!

```python
for _ in range(5):
    text = "태양계는 크지만 지구에는 달이 하나뿐입니다."
    print(runnable.invoke({"text": text, "examples": messages}))
```

```output
people=[]
people=[]
people=[]
people=[]
people=[]
```

```python
runnable.invoke(
    {
        "text": "제 이름은 Harrison입니다. 제 머리카락은 검은색입니다.",
        "examples": messages,
    }
)
```

```output
Data(people=[Person(name='Harrison', hair_color='검은색', height_in_meters=None)])
```