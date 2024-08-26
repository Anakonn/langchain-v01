---
sidebar_position: 0.5
title: LCEL의 장점
translated: true
---

import { ColumnContainer, Column } from "@theme/Columns";

:::tip
LCEL [시작하기](/docs/expression_language/get_started) 섹션을 먼저 읽어보는 것을 추천합니다.
:::

LCEL은 LLMs와 관련된 구성 요소를 결합하여 유용한 앱을 쉽게 만들 수 있도록 설계되었습니다. 이를 위해 다음과 같은 기능을 제공합니다:

1. **통합 인터페이스**: 모든 LCEL 객체는 `Runnable` 인터페이스를 구현하며, 이 인터페이스는 공통 호출 메서드 (`invoke`, `batch`, `stream`, `ainvoke`, ...)를 정의합니다. 이를 통해 LCEL 객체의 체인이 유용한 작업(예: 중간 단계의 배치 및 스트리밍)을 자동으로 지원할 수 있습니다. LCEL 객체의 체인 자체도 LCEL 객체이기 때문입니다.
2. **구성 프리미티브**: LCEL은 체인을 구성하고, 구성 요소를 병렬 처리하고, 폴백을 추가하고, 체인의 내부 구성을 동적으로 설정하는 등의 작업을 쉽게 수행할 수 있는 여러 프리미티브를 제공합니다.

LCEL의 가치를 더 잘 이해하려면, 실제로 작동하는 모습을 보고 LCEL 없이 유사한 기능을 재구현하는 방법을 생각해 보는 것이 도움이 됩니다. 이번 워크스루에서는 시작 섹션의 [기본 예제](/docs/expression_language/get_started#basic_example)를 통해 이를 살펴보겠습니다. 간단한 프롬프트 + 모델 체인을 살펴보고, 이러한 기능을 모두 재구현하는 데 필요한 작업을 알아보겠습니다.

```python
%pip install --upgrade --quiet langchain-core langchain-openai langchain-anthropic
```

## 호출 (Invoke)

가장 간단한 경우, 주제 문자열을 입력받아 농담 문자열을 반환하고 싶을 때:

<ColumnContainer>
<Column>

#### LCEL 없이

```python
from typing import List
import openai

prompt_template = "Tell me a short joke about {topic}"
client = openai.OpenAI()

def call_chat_model(messages: List[dict]) -> str:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
    )
    return response.choices[0].message.content

def invoke_chain(topic: str) -> str:
    prompt_value = prompt_template.format(topic=topic)
    messages = [{"role": "user", "content": prompt_value}]
    return call_chat_model(messages)

invoke_chain("ice cream")
```

</Column>
<Column>

#### LCEL 사용

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

prompt = ChatPromptTemplate.from_template(
    "Tell me a short joke about {topic}"
)
output_parser = StrOutputParser()
model = ChatOpenAI(model="gpt-3.5-turbo")
chain = (
    {"topic": RunnablePassthrough()}
    | prompt
    | model
    | output_parser
)

chain.invoke("ice cream")
```

</Column>
</ColumnContainer>

## 스트림 (Stream)

결과를 스트리밍하고 싶다면, 함수를 다음과 같이 변경해야 합니다:

<ColumnContainer>
<Column>

#### LCEL 없이

```python
from typing import Iterator

def stream_chat_model(messages: List[dict]) -> Iterator[str]:
    stream = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        stream=True,
    )
    for response in stream:
        content = response.choices[0].delta.content
        if content is not None:
            yield content

def stream_chain(topic: str) -> Iterator[str]:
    prompt_value = prompt.format(topic=topic)
    return stream_chat_model([{"role": "user", "content": prompt_value}])

for chunk in stream_chain("ice cream"):
    print(chunk, end="", flush=True)
```

</Column>
<Column>

#### LCEL 사용

```python
for chunk in chain.stream("ice cream"):
    print(chunk, end="", flush=True)
```

</Column>
</ColumnContainer>

## 배치 (Batch)

입력의 배치를 병렬로 실행하려면, 다시 새로운 함수가 필요합니다:

<ColumnContainer>
<Column>

#### LCEL 없이

```python
from concurrent.futures import ThreadPoolExecutor

def batch_chain(topics: list) -> list:
    with ThreadPoolExecutor(max_workers=5) as executor:
        return list(executor.map(invoke_chain, topics))

batch_chain(["ice cream", "spaghetti", "dumplings"])
```

</Column>
<Column>

#### LCEL 사용

```python
chain.batch(["ice cream", "spaghetti", "dumplings"])
```

</Column>
</ColumnContainer>

## 비동기 (Async)

비동기 버전이 필요하다면:

<ColumnContainer>
<Column>

#### LCEL 없이

```python
async_client = openai.AsyncOpenAI()

async def acall_chat_model(messages: List[dict]) -> str:
    response = await async_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
    )
    return response.choices[0].message.content

async def ainvoke_chain(topic: str) -> str:
    prompt_value = prompt_template.format(topic=topic)
    messages = [{"role": "user", "content": prompt_value}]
    return await acall_chat_model(messages)

await ainvoke_chain("ice cream")
```

</Column>

<Column>

#### LCEL 사용

```python
await chain.ainvoke("ice cream")
```

</Column>
</ColumnContainer>

## 비동기 배치 (Async Batch)

<ColumnContainer>
<Column>

#### LCEL 없이

```python
import asyncio
import openai

async def abatch_chain(topics: list) -> list:
    coros = map(ainvoke_chain, topics)
    return await asyncio.gather(*coros)

await abatch_chain(["ice cream", "spaghetti", "dumplings"])
```

</Column>

<Column>

#### LCEL 사용

```python
await chain.abatch(["ice cream", "spaghetti", "dumplings"])
```

</Column>
</ColumnContainer>

## 채팅 모델 대신 LLM 사용

완성(end-point) 지점 대신 채팅 지점을 사용하고 싶다면:

<ColumnContainer>
<Column>

#### LCEL 없이

```python
def call_llm(prompt_value: str) -> str:
    response = client.completions.create(
        model="gpt-3.5-turbo-instruct",
        prompt=prompt_value,
    )
    return response.choices[0].text

def invoke_llm_chain(topic: str) -> str:
    prompt_value = prompt_template.format(topic=topic)
    return call_llm(prompt_value)

invoke_llm_chain("ice cream")
```

</Column>

<Column>

#### LCEL 사용

```python
from langchain_openai import OpenAI

llm = OpenAI(model="gpt-3.5-turbo-instruct")
llm_chain = (
    {"topic": RunnablePassthrough()}
    | prompt
    | llm
    | output_parser
)

llm_chain.invoke("ice cream")
```

</Column>
</ColumnContainer>

## 다른 모델 제공자 사용

OpenAI 대신 Anthropic을 사용하고 싶다면:

<ColumnContainer>
<Column>

#### LCEL 없이

```python
import anthropic

anthropic_template = f"Human:\n\n{prompt_template}\n\nAssistant:"
anthropic_client = anthropic.Anthropic()

def call_anthropic(prompt_value: str) -> str:
    response = anthropic_client.completions.create(
        model="claude-2",
        prompt=prompt_value,
        max_tokens_to_sample=256,
    )
    return response.completion

def invoke_anthropic_chain(topic: str) -> str:
    prompt_value = anthropic_template.format(topic=topic)
    return call_anthropic(prompt_value)

invoke_anthropic_chain("ice cream")
```

</Column>

<Column>

#### LCEL 사용

```python
from langchain_anthropic import ChatAnthropic

anthropic = ChatAnthropic(model="claude-2")
anthropic_chain = (
    {"topic": RunnablePassthrough()}
    | prompt
    | anthropic
    | output_parser
)

anthropic_chain.invoke("ice cream")
```

</Column>
</ColumnContainer>

## 런타임 구성 가능성

런타임에 채팅 모델이나 LLM의 선택을 구성 가능하게 하려면:

<ColumnContainer>
<Column>

#### LCEL 없이

```python
def invoke_configurable_chain(
    topic: str,
    *,
    model: str = "chat_openai"
) -> str:
    if model == "chat_openai":
        return invoke_chain(topic)
    elif model == "openai":
        return invoke_llm_chain(topic)
    elif model == "anthropic":
        return invoke_anthropic_chain(topic)
    else:
        raise ValueError(
            f"Received invalid model '{model}'."
            " Expected one of chat_openai, openai, anthropic"
        )

def stream_configurable_chain(
    topic: str,
    *,
    model: str = "chat_openai"
) -> Iterator[str]:
    if model == "chat_openai":
        return stream_chain(topic)
    elif model == "openai":
        # 아직 구현되지 않았습니다.
        return stream_llm_chain(topic)
    elif model == "anthropic":
        # 아직 구현되지 않았습니다.
        return stream_anthropic_chain(topic)
    else:
        raise ValueError(
            f"Received invalid model '{model}'."
            " Expected one of chat_openai, openai, anthropic"
        )

def batch_configurable_chain(
    topics: List[str],
    *,
    model: str = "chat_openai"
) -> List[str]:
    # 아이디어는 이해되셨을 것입니다.
    ...

async def abatch_configurable_chain(
    topics: List[str],
    *,
    model: str = "chat_openai"
) -> List[str]:
    ...

invoke_configurable_chain("ice cream", model="openai")
stream = stream_configurable_chain(
    "ice cream",
    model="anthropic"
)
for chunk in stream:
    print(chunk, end="", flush=True)

# batch_configurable_chain(["ice cream", "spaghetti", "dumplings"])

# await ainvoke_configurable_chain("ice cream")

```

</Column>

<Column>

#### LCEL 사용

```python
from langchain_core.runnables import ConfigurableField

configurable_model = model.configurable_alternatives(
    ConfigurableField(id="model"),
    default_key="chat_openai",
    openai=llm,
    anthropic=anthropic,
)
configurable_chain = (
    {"topic": RunnablePassthrough()}
    | prompt
    | configurable_model
    | output_parser
)
```

```python
configurable_chain.invoke(
    "ice cream",
    config={"model": "openai"}
)
stream = configurable_chain.stream(
    "ice cream",
    config={"model": "anthropic"}
)
for chunk in stream:
    print(chunk, end="", flush=True)

configurable_chain.batch(["ice cream", "spaghetti", "dumplings"])

# await configurable_chain.ainvoke("ice cream")

```

</Column>
</ColumnContainer>

## 로깅 (Logging)

중간 결과를 로깅하려면:

<ColumnContainer>
<Column>

#### LCEL 없이

설명을 위해 중간 단계를 `print`합니다.

```python
def invoke_anthropic_chain_with_logging(topic: str) -> str:
    print(f"Input: {topic}")
    prompt_value = anthropic_template.format(topic=topic)
    print(f"Formatted prompt: {prompt_value}")
    output = call_anthropic(prompt_value)
    print(f"Output: {output}")
    return output

invoke_anthropic_chain_with_logging("ice cream")
```

</Column>

<Column>

#### LCEL 사용

모든 구성 요소는 LangSmith와의 통합을 내장하고 있습니다. 다음 두 환경 변수를 설정하면 모든 체인 추적이 LangSmith에 로깅됩니다.

```python
import os

os.environ["LANGCHAIN_API_KEY"] = "..."
os.environ["LANGCHAIN_TRACING_V2"] = "true"

anthropic_chain.invoke("ice cream")
```

여기 LangSmith 추적 결과가 있습니다: [LangSmith Trace](https://smith.langchain.com/public/e4de52f8-bcd9-4732-b950-deee4b04e313/r)

</Column>
</ColumnContainer>

## 폴백 (Fallbacks)

한 모델 API가 다운된 경우에 대한 폴백 로직을 추가하려면:

<ColumnContainer>
<Column>

#### LCEL 없이

```python
def invoke_chain_with_fallback(topic: str) -> str:
    try:
        return invoke_chain(topic)
    except Exception:
        return invoke_anthropic_chain(topic)

async def ainvoke_chain_with_fallback(topic: str) -> str:
    try:
        return await ainvoke_chain(topic)
    except Exception:
        # 참고: 실제로 구현되지는 않았습니다.
        return await ainvoke_anthropic_chain(topic)

async def batch_chain_with_fallback(topics: List[str]) -> str:
    try:
        return batch_chain(topics)
    except Exception:
        # 참고: 실제로 구현되지는 않았습니다.
        return batch_anthropic_chain(topics)

invoke_chain_with_fallback("ice cream")
# await ainvoke_chain_with_fallback("ice cream")

batch_chain_with_fallback(["ice cream", "spaghetti", "dumplings"])
```

</Column>

<Column>

#### LCEL 사용

```python
fallback_chain = chain.with_fallbacks([anthropic_chain])

fallback_chain.invoke("ice cream")
# await fallback_chain.ainvoke("ice cream")

fallback_chain.batch(["ice cream", "spaghetti", "dumplings"])
```

</Column>
</ColumnContainer>

## 전체 코드 비교

이 간단한 경우에서도 LCEL 체인은 많은 기능을 간결하게 포함하고 있습니다. 체인이 더 복잡해질수록 이 장점은 더욱 두드러집니다.

<ColumnContainer>
<Column>

#### LCEL 없이

```python
from concurrent.futures import ThreadPoolExecutor
from typing import Iterator, List, Tuple

import anthropic
import openai

prompt_template = "Tell me a short joke about {topic}"
anthropic_template = f"Human:\n\n{prompt_template}\n\nAssistant:"
client = openai.OpenAI()
async_client = openai.AsyncOpenAI()
anthropic_client = anthropic.Anthropic()

def call_chat_model(messages: List[dict]) -> str:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
    )
    return response.choices[0].message.content

def invoke_chain(topic: str) -> str:
    print(f"Input: {topic}")
    prompt_value = prompt_template.format(topic=topic)
    print(f"Formatted prompt: {prompt_value}")
    messages = [{"role": "user", "content": prompt_value}]
    output = call_chat_model(messages)
    print(f"Output: {output}")
    return output

def stream_chat_model(messages: List[dict]) -> Iterator[str]:
    stream = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        stream=True,
    )
    for response in stream:
        content = response.choices[0].delta.content
        if content is not None:
            yield content

def stream_chain(topic: str) -> Iterator[str]:
    print(f"Input: {topic}")
    prompt_value = prompt.format(topic=topic)
    print(f"Formatted prompt: {prompt_value}")
    stream = stream_chat_model([{"role": "user", "content": prompt_value}])
    for chunk in stream:
        print(f"Token: {chunk}", end="")
        yield chunk

def batch_chain(topics: list) -> list:
    with ThreadPoolExecutor(max_workers=5) as executor:
        return list(executor.map(invoke_chain, topics))

def call_llm(prompt_value: str) -> str:
    response = client.completions.create(
        model="gpt-3.5-turbo-instruct",
        prompt=prompt_value,
    )
    return response.choices[0].text

def invoke_llm_chain(topic: str) -> str:
    print(f"Input: {topic}")
    prompt_value = prompt_template.format(topic=topic)
    print(f"Formatted prompt: {prompt_value}")
    output = call_llm(prompt_value)
    print(f"Output: {output}")
    return output

def call_anthropic(prompt_value: str) -> str:
    response = anthropic_client.completions.create(
        model="claude-2",
        prompt=prompt_value,
        max_tokens_to_sample=256,
    )
    return response.completion

def invoke_anthropic_chain(topic: str) -> str:
    print(f"Input: {topic}")
    prompt_value = anthropic_template.format(topic=topic)
    print(f"Formatted prompt: {prompt_value}")
    output = call_anthropic(prompt_value)
    print(f"Output: {output}")
    return output

async def ainvoke_anthropic_chain(topic: str) -> str:
    ...

def stream_anthropic_chain(topic: str) -> Iterator[str]:
    ...

def batch_anthropic_chain(topics: List[str]) -> List[str]:
    ...

def invoke_configurable_chain(
    topic: str,
    *,
    model: str = "chat_openai"
) -> str:
    if model == "chat_openai":
        return invoke_chain(topic)
    elif model == "openai":
        return invoke_llm_chain(topic)
    elif model == "anthropic":
        return invoke_anthropic_chain(topic)
    else:
        raise ValueError(
            f"Received invalid model '{model}'."
            " Expected one of chat_openai, openai, anthropic"
        )

def stream_configurable_chain(
    topic: str,
    *,
    model: str = "chat_openai"
) -> Iterator[str]:
    if model == "chat_openai":
        return stream_chain(topic)
    elif model == "openai":
        # 참고: 아직 구현되지 않았습니다.
        return stream_llm_chain(topic)
    elif model == "anthropic":
        # 참고: 아직 구현되지 않았습니다.
        return stream_anthropic_chain(topic)
    else:
        raise ValueError(
            f"Received invalid model '{model}'."
            " Expected one of chat_openai, openai, anthropic"
        )

def batch_configurable_chain(
    topics: List[str],
    *,
    model: str = "chat_openai"
) -> List[str]:
    ...

async def abatch_configurable_chain(
    topics: List[str],
    *,
    model: str = "chat_openai"
) -> List[str]:
    ...

def invoke_chain_with_fallback(topic: str) -> str:
    try:
        return invoke_chain(topic)
    except Exception:
        return invoke_anthropic_chain(topic)

async def ainvoke_chain_with_fallback(topic: str) -> str:
    try:
        return await ainvoke_chain(topic)
    except Exception:
        return await ainvoke_anthropic_chain(topic)

async def batch_chain_with_fallback(topics: List[str]) -> str:
    try:
        return batch_chain(topics)
    except Exception:
        return batch_anthropic_chain(topics)
```

</Column>

<Column>

#### LCEL 사용

```python
import os

from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_openai import OpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, ConfigurableField

os.environ["LANGCHAIN_API_KEY"] = "..."
os.environ["LANGCHAIN_TRACING_V2"] = "true"

prompt = ChatPromptTemplate.from_template(
    "Tell me a short joke about {topic}"
)
chat_openai = ChatOpenAI(model="gpt-3.5-turbo")
openai = OpenAI(model="gpt-3.5-turbo-instruct")
anthropic = ChatAnthropic(model="claude-2")
model = (
    chat_openai
    .with_fallbacks([anthropic])
    .configurable_alternatives(
        ConfigurableField(id="model"),
        default_key="chat_openai",
        openai=openai,
        anthropic=anthropic,
    )
)

chain = (
    {"topic": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

</Column>
</ColumnContainer>

## 다음 단계

LCEL에 대해 계속 배우기 위해 다음을 추천합니다:

- 여기서 다루지 않은 LCEL [인터페이스](/docs/expression_language/interface)에 대해 읽어보기.
- LCEL이 제공하는 [프리미티브](/docs/expression_language/primitives)를 탐색하여 더 알아보기.