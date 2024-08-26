---
sidebar_position: 0
title: 빠른 시작
translated: true
---

이 빠른 시작에서는 **함수/도구 호출**이 가능한 [챗 모델](/docs/modules/model_io/chat/)을 사용하여 텍스트에서 정보를 추출하는 방법을 다룹니다.

:::important
**함수/도구 호출**을 사용한 추출은 [**함수/도구 호출**을 지원하는 모델](/docs/modules/model_io/chat/function_calling)에서만 작동합니다.
:::

## 설정

우리는 **함수/도구 호출**이 가능한 LLM에서 사용할 수 있는 [구조화된 출력](/docs/modules/model_io/chat/structured_output) 방법을 사용할 것입니다.

모델을 선택하고 해당 종속성을 설치한 후 API 키를 설정하세요!

```python
!pip install langchain

# 도구 호출이 가능한 모델 설치

# pip install langchain-openai

# pip install langchain-mistralai

# pip install langchain-fireworks

# 관련 모델에 대한 환경 변수를 설정하거나 .env 파일에서 불러오기:

# import dotenv

# dotenv.load_dotenv()

```

## 스키마

먼저, 텍스트에서 추출하려는 정보를 설명해야 합니다.

Pydantic을 사용하여 개인 정보를 추출하기 위한 예제 스키마를 정의해 보겠습니다.

```python
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Person(BaseModel):
    """사람에 대한 정보"""

    # ^ 엔티티 Person에 대한 Doc-string.
    # 이 Doc-string은 스키마 Person의 설명으로 LLM에 전달되어
    # 추출 결과를 개선하는 데 도움이 될 수 있습니다.

    # 주의할 점:
    # 1. 각 필드는 `optional`입니다 -- 이를 통해 모델이 추출을 거부할 수 있습니다!
    # 2. 각 필드는 `description`을 가지고 있습니다 -- 이 설명은 LLM에 의해 사용됩니다.
    # 좋은 설명이 있으면 추출 결과를 개선할 수 있습니다.
    name: Optional[str] = Field(default=None, description="사람의 이름")
    hair_color: Optional[str] = Field(
        default=None, description="알려진 경우 사람의 머리 색깔"
    )
    height_in_meters: Optional[str] = Field(
        default=None, description="미터 단위로 측정한 키"
    )
```

스키마를 정의할 때 두 가지 모범 사례가 있습니다:

1. **속성**과 **스키마** 자체를 문서화합니다: 이 정보는 LLM에 전달되어 정보 추출의 품질을 향상시키는 데 사용됩니다.
2. LLM이 정보를 만들어내지 않도록 합니다! 위에서 속성에 `Optional`을 사용하여 LLM이 답을 모를 경우 `None`을 출력할 수 있도록 했습니다.

:::important
최상의 성능을 위해 스키마를 잘 문서화하고 텍스트에서 추출할 정보가 없는 경우 모델이 결과를 반환하도록 강제하지 않도록 하세요.
:::

## 추출기

위에서 정의한 스키마를 사용하여 정보 추출기를 만들어 봅시다.

```python
from typing import Optional

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

# 지침과 추가 컨텍스트를 제공하기 위해 맞춤 프롬프트를 정의합니다.

# 1) 추출 품질을 향상시키기 위해 프롬프트 템플릿에 예제를 추가할 수 있습니다.

# 2) 컨텍스트를 고려하여 추가 매개변수를 도입할 수 있습니다 (예: 텍스트가 추출된 문서에 대한 메타데이터 포함).

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "당신은 전문가 추출 알고리즘입니다. "
            "텍스트에서 관련 정보를 추출하십시오. "
            "추출하려는 속성의 값을 모를 경우 "
            "해당 속성의 값으로 null을 반환하십시오.",
        ),
        # 참조 예제를 사용하여 성능을 개선하는 방법은
        # 성능 개선 관련 가이드를 참조하세요.
        # MessagesPlaceholder('examples'),
        ("human", "{text}"),
    ]
)
```

함수/도구 호출을 지원하는 모델을 사용해야 합니다.

이 API와 함께 사용할 수 있는 일부 모델 목록은 [구조화된 출력](/docs/modules/model_io/chat/structured_output)을 참조하세요.

```python
from langchain_mistralai import ChatMistralAI

llm = ChatMistralAI(model="mistral-large-latest", temperature=0)

runnable = prompt | llm.with_structured_output(schema=Person)
```

테스트해 봅시다

```python
text = "Alan Smith는 키가 6피트이고 금발 머리를 가지고 있습니다."
runnable.invoke({"text": text})
```

```output
Person(name='Alan Smith', hair_color='금발', height_in_meters='1.8288')
```

:::important
추출은 생성적입니다 🤯

LLM은 생성 모델이므로 키가 피트로 제공되었지만 이를 미터로 정확히 변환하여 추출하는 등의 멋진 작업을 할 수 있습니다!
:::

## 여러 엔티티

**대부분의 경우** 단일 엔티티가 아닌 엔티티 목록을 추출해야 합니다.

이는 pydantic을 사용하여 모델을 서로 중첩함으로써 쉽게 구현할 수 있습니다.

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Person(BaseModel):
    """사람에 대한 정보"""

    # ^ 엔티티 Person에 대한 Doc-string.
    # 이 Doc-string은 스키마 Person의 설명으로 LLM에 전달되어
    # 추출 결과를 개선하는 데 도움이 될 수 있습니다.

    # 주의할 점:
    # 1. 각 필드는 `optional`입니다 -- 이를 통해 모델이 추출을 거부할 수 있습니다!
    # 2. 각 필드는 `description`을 가지고 있습니다 -- 이 설명은 LLM에 의해 사용됩니다.
    # 좋은 설명이 있으면 추출 결과를 개선할 수 있습니다.
    name: Optional[str] = Field(default=None, description="사람의 이름")
    hair_color: Optional[str] = Field(
        default=None, description="알려진 경우 사람의 머리 색깔"
    )
    height_in_meters: Optional[str] = Field(
        default=None, description="미터 단위로 측정한 키"
    )


class Data(BaseModel):
    """사람들에 대한 추출된 데이터"""

    # 여러 엔티티를 추출할 수 있도록 모델을 생성합니다.
    people: List[Person]
```

:::important
여기서 추출이 완벽하지 않을 수 있습니다. 추출 품질을 개선하기 위해 **참조 예제**를 사용하는 방법과 **지침** 섹션을 계속 확인하세요!
:::

```python
runnable = prompt | llm.with_structured_output(schema=Data)
text = "내 이름은 Jeff이고, 머리는 검은색이며 키는 6피트입니다. Anna의 머리 색깔도 저와 같습니다."
runnable.invoke({"text": text})
```

```output
Data(people=[Person(name='Jeff', hair_color=None, height_in_meters=None), Person(name='Anna', hair_color=None, height_in_meters=None)])
```

:::tip
스키마가 **여러 엔티티**의 추출을 허용할 때, 텍스트에 관련 정보가 없는 경우 빈 목록을 제공하여 **엔티티 없음**을 모델이 추출하도록 허용할 수도 있습니다.

이는 일반적으로 **좋은** 일입니다! 이를 통해 엔티티에서 **필수** 속성을 지정하면서도 모델이 반드시 이 엔티티를 감지하도록 강제하지 않을 수 있습니다.
:::

## 다음 단계

LangChain을 사용한 추출의 기본 개념을 이해했으므로 다음 사용 방법 가이드로 진행할 준비가 되었습니다:

- [예제 추가](/docs/use_cases/extraction/how_to/examples): **참조 예제**를 사용하여 성능을 개선하는 방법을 배웁니다.
- [긴 텍스트 처리](/docs/use_cases/extraction/how_to/handle_long_text): 텍스트가 LLM의 컨텍스트 윈도우에 맞지 않는 경우 어떻게 해야 하는지 알아봅니다.
- [파일 처리](/docs/use_cases/extraction/how_to/handle_files): PDF와 같은 파일에서 추출하기 위해 LangChain 문서 로더와 파서를 사용하는 예제.
- [파싱 접근 방식 사용](/docs/use_cases/extraction/how_to/parse): **도구/함수 호출**을 지원하지 않는 모델로 추출하기 위해 프롬프트 기반 접근 방식을 사용합니다.
- [지침](/docs/use_cases/extraction/guidelines): 추출 작업에서 좋은 성능을 얻기 위한 지침.