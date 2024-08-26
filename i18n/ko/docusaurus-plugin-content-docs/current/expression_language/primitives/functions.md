---
keywords:
- RunnableLambda
- LCEL
sidebar_position: 3
title: 'Lambda: 사용자 정의 함수 실행'
translated: true
---

# 사용자 정의 함수 실행

파이프라인에서 임의의 함수를 사용할 수 있습니다.

이러한 함수에 대한 모든 입력은 단일 인수여야 합니다. 여러 인수를 허용하는 함수가 있는 경우 단일 입력을 허용하고 이를 여러 인수로 분해하는 래퍼를 작성해야 합니다.
%pip install --upgrade --quiet langchain langchain-openai

```python
from operator import itemgetter

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda
from langchain_openai import ChatOpenAI


def length_function(text):
    return len(text)


def _multiple_length_function(text1, text2):
    return len(text1) * len(text2)


def multiple_length_function(_dict):
    return _multiple_length_function(_dict["text1"], _dict["text2"])


prompt = ChatPromptTemplate.from_template("what is {a} + {b}")
model = ChatOpenAI()

chain1 = prompt | model

chain = (
    {
        "a": itemgetter("foo") | RunnableLambda(length_function),
        "b": {"text1": itemgetter("foo"), "text2": itemgetter("bar")}
        | RunnableLambda(multiple_length_function),
    }
    | prompt
    | model
)
```

```python
chain.invoke({"foo": "bar", "bar": "gah"})
```

```output
AIMessage(content='3 + 9 = 12', response_metadata={'token_usage': {'completion_tokens': 7, 'prompt_tokens': 14, 'total_tokens': 21}, 'model_name': 'gpt-3.5-turbo', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'stop', 'logprobs': None}, id='run-bd204541-81fd-429a-ad92-dd1913af9b1c-0')
```

## 실행 가능한 구성 수락

실행 가능한 람다는 [RunnableConfig](https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.config.RunnableConfig.html#langchain_core.runnables.config.RunnableConfig)를 선택적으로 수락할 수 있으며, 이를 사용하여 콜백, 태그 및 기타 구성 정보를 중첩 실행에 전달할 수 있습니다.

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableConfig
```

```python
import json


def parse_or_fix(text: str, config: RunnableConfig):
    fixing_chain = (
        ChatPromptTemplate.from_template(
            "Fix the following text:\n\n```text\n{input}\n```\nError: {error}"
            " Don't narrate, just respond with the fixed data."
        )
        | ChatOpenAI()
        | StrOutputParser()
    )
    for _ in range(3):
        try:
            return json.loads(text)
        except Exception as e:
            text = fixing_chain.invoke({"input": text, "error": e}, config)
    return "Failed to parse"
```

```python
from langchain_community.callbacks import get_openai_callback

with get_openai_callback() as cb:
    output = RunnableLambda(parse_or_fix).invoke(
        "{foo: bar}", {"tags": ["my-tag"], "callbacks": [cb]}
    )
    print(output)
    print(cb)
```

```output
{'foo': 'bar'}
Tokens Used: 62
	Prompt Tokens: 56
	Completion Tokens: 6
Successful Requests: 1
Total Cost (USD): $9.6e-05
```

# 스트리밍

LCEL 파이프라인에서 제너레이터 함수(즉, `yield` 키워드를 사용하고 반복자처럼 동작하는 함수)를 사용할 수 있습니다.

이 제너레이터의 서명은 `Iterator[Input] -> Iterator[Output]`이어야 합니다. 비동기 제너레이터의 경우: `AsyncIterator[Input] -> AsyncIterator[Output]`.

다음과 같은 경우 유용합니다:

- 사용자 정의 출력 파서 구현
- 스트리밍 기능을 유지하면서 이전 단계의 출력 수정

다음은 쉼표로 구분된 목록에 대한 사용자 정의 출력 파서의 예입니다:

```python
from typing import Iterator, List

prompt = ChatPromptTemplate.from_template(
    "Write a comma-separated list of 5 animals similar to: {animal}. Do not include numbers"
)
model = ChatOpenAI(temperature=0.0)

str_chain = prompt | model | StrOutputParser()
```

```python
for chunk in str_chain.stream({"animal": "bear"}):
    print(chunk, end="", flush=True)
```

```output
lion, tiger, wolf, gorilla, panda
```

```python
str_chain.invoke({"animal": "bear"})
```

```output
'lion, tiger, wolf, gorilla, panda'
```

```python
# 이는 쉼표로 구분된 목록으로 llm 토큰의 반복자를 분할하는 사용자 정의 파서입니다.

def split_into_list(input: Iterator[str]) -> Iterator[List[str]]:
    # 쉼표가 나올 때까지 부분 입력을 보관합니다.
    buffer = ""
    for chunk in input:
        # 현재 청크를 버퍼에 추가합니다.
        buffer += chunk
        # 버퍼에 쉼표가 있는 동안
        while "," in buffer:
            # 버퍼를 쉼표로 분할합니다.
            comma_index = buffer.index(",")
            # 쉼표 앞의 모든 것을 반환합니다.
            yield [buffer[:comma_index].strip()]
            # 나머지는 다음 반복을 위해 보관합니다.
            buffer = buffer[comma_index + 1 :]
    # 마지막 청크를 반환합니다.
    yield [buffer.strip()]
```

```python
list_chain = str_chain | split_into_list
```

```python
for chunk in list_chain.stream({"animal": "bear"}):
    print(chunk, flush=True)
```

```output
['lion']
['tiger']
['wolf']
['gorilla']
['panda']
```

```python
list_chain.invoke({"animal": "bear"})
```

```output
['lion', 'tiger', 'wolf', 'gorilla', 'elephant']
```

## 비동기 버전

```python
from typing import AsyncIterator


async def asplit_into_list(
    input: AsyncIterator[str],
) -> AsyncIterator[List[str]]:  # async def
    buffer = ""
    async for (
        chunk
    ) in input:  # `input`은 `async_generator` 객체이므로 `async for`를 사용합니다.
        buffer += chunk
        while "," in buffer:
            comma_index = buffer.index(",")
            yield [buffer[:comma_index].strip()]
            buffer = buffer[comma_index + 1 :]
    yield [buffer.strip()]


list_chain = str_chain | asplit_into_list
```

```python
async for chunk in list_chain.astream({"animal": "bear"}):
    print(chunk, flush=True)
```

```output
['lion']
['tiger']
['wolf']
['gorilla']
['panda']
```

```python
await list_chain.ainvoke({"animal": "bear"})
```

```output
['lion', 'tiger', 'wolf', 'gorilla', 'panda']
```