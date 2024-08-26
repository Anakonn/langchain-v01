---
sidebar_position: 4
translated: true
---

# 부분 프롬프트 템플릿

다른 방법과 마찬가지로, 프롬프트 템플릿을 "부분적으로" 만드는 것이 합리적일 수 있습니다. 예를 들어, 필요한 값의 하위 집합만 전달하여 나머지 하위 집합의 값만 기대하는 새로운 프롬프트 템플릿을 만들 수 있습니다.

LangChain은 이를 두 가지 방법으로 지원합니다:
1. 문자열 값을 사용한 부분 형식화.
2. 문자열 값을 반환하는 함수를 사용한 부분 형식화.

이 두 가지 다른 방법은 서로 다른 사용 사례를 지원합니다. 아래 예제에서는 두 가지 사용 사례의 동기와 LangChain에서 이를 수행하는 방법을 살펴봅니다.

## 문자열을 사용한 부분

프롬프트 템플릿을 부분적으로 만들고 싶은 일반적인 사용 사례는 변수 중 일부를 먼저 얻는 경우입니다. 예를 들어, `foo`와 `baz`라는 두 개의 변수가 필요한 프롬프트 템플릿이 있다고 가정합시다. `foo` 값은 초기에 얻을 수 있지만 `baz` 값은 나중에 얻을 수 있는 경우, 두 변수를 모두 가지고 있는 곳에서 프롬프트 템플릿에 전달하기까지 기다리는 것이 성가실 수 있습니다. 대신 `foo` 값으로 프롬프트 템플릿을 부분적으로 만들고, 부분적으로 만든 프롬프트 템플릿을 전달한 다음 그것만 사용할 수 있습니다. 이를 수행하는 예는 다음과 같습니다:

```python
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("{foo}{bar}")
partial_prompt = prompt.partial(foo="foo")
print(partial_prompt.format(bar="baz"))
```

```output
foobaz
```

또한 부분적으로 채워진 변수로 프롬프트를 초기화할 수도 있습니다.

```python
prompt = PromptTemplate(
    template="{foo}{bar}", input_variables=["bar"], partial_variables={"foo": "foo"}
)
print(prompt.format(bar="baz"))
```

```output
foobaz
```

## 함수를 사용한 부분

다른 일반적인 사용 사례는 함수를 사용하여 부분을 만드는 것입니다. 이 경우의 사용 사례는 항상 공통된 방식으로 가져오고 싶은 변수가 있을 때입니다. 이의 대표적인 예가 날짜 또는 시간입니다. 항상 현재 날짜를 포함하고 싶은 프롬프트가 있다고 가정합시다. 프롬프트에 하드 코딩할 수는 없고, 다른 입력 변수와 함께 전달하는 것도 약간 성가실 수 있습니다. 이 경우 현재 날짜를 항상 반환하는 함수로 프롬프트를 부분적으로 만드는 것이 매우 편리합니다.

```python
from datetime import datetime


def _get_datetime():
    now = datetime.now()
    return now.strftime("%m/%d/%Y, %H:%M:%S")
```

```python
prompt = PromptTemplate(
    template="Tell me a {adjective} joke about the day {date}",
    input_variables=["adjective", "date"],
)
partial_prompt = prompt.partial(date=_get_datetime)
print(partial_prompt.format(adjective="funny"))
```

```output
Tell me a funny joke about the day 12/27/2023, 10:45:22
```

또한 부분적으로 채워진 변수로 프롬프트를 초기화하는 것이 이 워크플로에서 더 합리적인 경우가 많습니다.

```python
prompt = PromptTemplate(
    template="Tell me a {adjective} joke about the day {date}",
    input_variables=["adjective"],
    partial_variables={"date": _get_datetime},
)
print(prompt.format(adjective="funny"))
```

```output
Tell me a funny joke about the day 12/27/2023, 10:45:36
```
