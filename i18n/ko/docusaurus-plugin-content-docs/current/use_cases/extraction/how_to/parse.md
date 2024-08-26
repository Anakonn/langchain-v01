---
sidebar_position: 4
title: 구문 분석
translated: true
---

프롬프트 지시를 잘 따를 수 있는 LLM을 사용하면 주어진 형식으로 정보를 출력하도록 할 수 있습니다.

이 접근법은 좋은 프롬프트를 설계한 후 LLM의 출력을 구문 분석하여 정보를 잘 추출하게 만드는 것입니다.

여기서는 지시를 잘 따르는 Claude를 사용할 것입니다! 자세한 내용은 [Anthropic 모델](https://www.anthropic.com/api)을 참조하십시오.

```python
from langchain_anthropic.chat_models import ChatAnthropic

model = ChatAnthropic(model_name="claude-3-sonnet-20240229", temperature=0)
```

:::tip
추출 품질에 대한 모든 고려 사항은 구문 분석 접근 방식에도 동일하게 적용됩니다. 추출 품질에 대한 [지침](/docs/use_cases/extraction/guidelines)을 검토하십시오.

이 튜토리얼은 간단하게 구성되어 있지만 일반적으로 성능을 극대화하기 위해 참조 예제를 포함하는 것이 좋습니다!
:::

## PydanticOutputParser 사용

다음 예제는 내장된 `PydanticOutputParser`를 사용하여 챗 모델의 출력을 구문 분석합니다.

```python
from typing import List, Optional

from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator


class Person(BaseModel):
    """사람에 대한 정보"""

    name: str = Field(..., description="사람의 이름")
    height_in_meters: float = Field(
        ..., description="미터 단위로 표현된 사람의 키"
    )


class People(BaseModel):
    """텍스트에 있는 모든 사람에 대한 식별 정보"""

    people: List[Person]


# 파서 설정

parser = PydanticOutputParser(pydantic_object=People)

# 프롬프트

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "사용자 쿼리에 응답하십시오. 출력을 `json` 태그로 감싸십시오\n{format_instructions}",
        ),
        ("human", "{query}"),
    ]
).partial(format_instructions=parser.get_format_instructions())
```

모델에 어떤 정보가 전달되는지 살펴보겠습니다.

```python
query = "Anna는 23살이며 키가 6피트입니다"
```

```python
print(prompt.format_prompt(query=query).to_string())
```

```output
System: 사용자 쿼리에 응답하십시오. 출력을 `json` 태그로 감싸십시오
출력은 아래 JSON 스키마에 부합하는 JSON 인스턴스로 포맷되어야 합니다.

스키마 {"properties": {"foo": {"title": "Foo", "description": "문자열 목록", "type": "array", "items": {"type": "string"}}}, "required": ["foo"]}의 경우
객체 {"foo": ["bar", "baz"]}는 스키마에 잘 맞는 인스턴스입니다. 객체 {"properties": {"foo": ["bar", "baz"]}}는 잘 맞지 않는 인스턴스입니다.

다음은 출력 스키마입니다:

{"description": "텍스트에 있는 모든 사람에 대한 식별 정보.", "properties": {"people": {"title": "People", "type": "array", "items": {"$ref": "#/definitions/Person"}}}, "required": ["people"], "definitions": {"Person": {"title": "Person", "description": "사람에 대한 정보.", "type": "object", "properties": {"name": {"title": "이름", "description": "사람의 이름", "type": "string"}, "height_in_meters": {"title": "키(미터)", "description": "미터 단위로 표현된 사람의 키", "type": "number"}}, "required": ["name", "height_in_meters"]}}}

Human: Anna는 23살이며 키가 6피트입니다
```

```python
chain = prompt | model | parser
chain.invoke({"query": query})
```

```output
People(people=[Person(name='Anna', height_in_meters=1.83)])
```

## 사용자 정의 구문 분석

`LangChain`과 `LCEL`을 사용하여 사용자 정의 프롬프트와 파서를 쉽게 만들 수 있습니다.

간단한 함수를 사용하여 모델의 출력을 구문 분석할 수 있습니다!

```python
import json
import re
from typing import List, Optional

from langchain_anthropic.chat_models import ChatAnthropic
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator


class Person(BaseModel):
    """사람에 대한 정보"""

    name: str = Field(..., description="사람의 이름")
    height_in_meters: float = Field(
        ..., description="미터 단위로 표현된 사람의 키"
    )


class People(BaseModel):
    """텍스트에 있는 모든 사람에 대한 식별 정보"""

    people: List[Person]


# 프롬프트

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "사용자 쿼리에 응답하십시오. 주어진 스키마와 일치하는 JSON으로 응답하십시오: ```json\n{schema}\n```. "
            "출력을 ```json 및 ``` 태그로 감싸십시오",
        ),
        ("human", "{query}"),
    ]
).partial(schema=People.schema())


# 사용자 정의 파서

def extract_json(message: AIMessage) -> List[dict]:
    """JSON이 ```json 및 ``` 태그 사이에 포함된 문자열에서 JSON 콘텐츠를 추출합니다.

    매개변수:
        text (str): JSON 콘텐츠가 포함된 텍스트.

    반환:
        list: 추출된 JSON 문자열 목록.
    """
    text = message.content
    # JSON 블록을 매칭하는 정규 표현식 패턴 정의
    pattern = r"```json(.*?)```"

    # 문자열에서 패턴의 모든 일치 항목 찾기
    matches = re.findall(pattern, text, re.DOTALL)

    # 일치하는 JSON 문자열 목록 반환, 앞뒤 공백 제거
    try:
        return [json.loads(match.strip()) for match in matches]
    except Exception:
        raise ValueError(f"구문 분석 실패: {message}")
```

```python
query = "Anna는 23살이며 키가 6피트입니다"
print(prompt.format_prompt(query=query).to_string())
```

```output
System: 사용자 쿼리에 응답하십시오. 주어진 스키마와 일치하는 JSON으로 응답하십시오: ```json
{'title': 'People', 'description': '텍스트에 있는 모든 사람에 대한 식별 정보.', 'type': 'object', 'properties': {'people': {'title': 'People', 'type': 'array', 'items': {'$ref': '#/definitions/Person'}}}, 'required': ['people'], 'definitions': {'Person': {'title': 'Person', 'description': '사람에 대한 정보.', 'type': 'object', 'properties': {'name': {'title': '이름', 'description': '사람의 이름', 'type': 'string'}, 'height_in_meters': {'title': '키(미터)', 'description': '미터 단위로 표현된 사람의 키', 'type': 'number'}}, 'required': ['name', 'height_in_meters']}}}
    ```. 출력을 ```json 및 ``` 태그로 감싸십시오
Human: Anna는 23살이며 키가 6피트입니다
```

```python
chain = prompt | model | extract_json
chain.invoke({"query": query})
```

```output
[{'people': [{'name': 'Anna', 'height_in_meters': 1.83}]}]
```

## 다른 라이브러리들

구문 분석 접근 방식을 사용하여 추출하려는 경우 [Kor](https://eyurtsev.github.io/kor/) 라이브러리를 확인하십시오. 이 라이브러리는 `LangChain` 유지 관리자가 작성했으며
예제를 고려한 프롬프트를 작성하고, 형식(JSON 또는 CSV 등)을 제어하며 TypeScript로 스키마를 표현할 수 있도록 도와줍니다. 매우 잘 작동합니다!