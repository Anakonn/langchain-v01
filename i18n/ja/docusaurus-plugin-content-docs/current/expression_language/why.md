---
sidebar_position: 0.5
title: LCELの利点
translated: true
---

import { ColumnContainer, Column } from "@theme/Columns";

:::tip
LCEL [Get started](/docs/expression_language/get_started)セクションを先に読むことをお勧めします。
:::

LCELは、LLMを使ったアプリケーションの構築と関連コンポーネントの組み合わせを簡素化するように設計されています。これは以下の機能を提供することで実現されています:

1. **統一されたインターフェース**: 全てのLCELオブジェクトは`Runnable`インターフェースを実装しており、共通の呼び出しメソッド(`invoke`、`batch`、`stream`、`ainvoke`、...)が定義されています。これにより、LCELオブジェクトの連鎖も自動的に中間ステップのバッチ処理やストリーミングなどの便利な操作をサポートできるようになります。
2. **構成プリミティブ**: LCELは、チェーンの構成、コンポーネントの並列化、フォールバックの追加、内部の動的な設定など、様々な機能を提供するプリミティブを備えています。

LCELの価値を理解するには、実際の動作を見て、それを自分で再現するにはどうすればよいかを考えるのが役立ちます。このウォークスルーでは、「Get started」セクションの[基本的な例](/docs/expression_language/get_started#basic_example)を使って、その機能を一から再現してみます。シンプルなプロンプト+モデルチェーンの裏側に隠れている多くの機能を見ていきましょう。

```python
%pip install --upgrade --quiet  langchain-core langchain-openai langchain-anthropic
```

## Invoke

最も単純な場合では、トピック文字列を渡すと冗談の文字列が返ってきます:

<ColumnContainer>

<Column>

#### LCELなし

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

#### LCEL

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

## Stream

結果をストリーミングしたい場合は、関数を変更する必要があります:

<ColumnContainer>
<Column>

#### LCELなし

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

#### LCEL

```python
for chunk in chain.stream("ice cream"):
    print(chunk, end="", flush=True)
```

</Column>
</ColumnContainer>

## Batch

バッチ処理をしたい場合も、新しい関数が必要です:

<ColumnContainer>
<Column>

#### LCELなし

```python
from concurrent.futures import ThreadPoolExecutor


def batch_chain(topics: list) -> list:
    with ThreadPoolExecutor(max_workers=5) as executor:
        return list(executor.map(invoke_chain, topics))

batch_chain(["ice cream", "spaghetti", "dumplings"])
```

</Column>

<Column>

#### LCEL

```python
chain.batch(["ice cream", "spaghetti", "dumplings"])
```

</Column>
</ColumnContainer>

## Async

非同期バージョンが必要な場合:

<ColumnContainer>
<Column>

#### LCELなし

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

#### LCEL

```python
await chain.ainvoke("ice cream")
```

</Column>
</ColumnContainer>

## Async Batch

<ColumnContainer>
<Column>

#### LCELなし

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

#### LCEL

```python
await chain.abatch(["ice cream", "spaghetti", "dumplings"])
```

</Column>
</ColumnContainer>

## チャットモデルではなくLLMを使う

completionエンドポイントを使いたい場合:

<ColumnContainer>
<Column>

#### LCELなし

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

#### LCEL

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

## 異なるモデルプロバイダ

OpenAIではなくAnthropicを使いたい場合:

<ColumnContainer>
<Column>

#### LCELなし

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

#### LCEL

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

## ランタイム設定可能性

チャットモデルとLLMの選択をランタイムで変更可能にしたい場合:

<ColumnContainer>
<Column>

#### LCELなし

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
        # Note we haven't implemented this yet.
        return stream_llm_chain(topic)
    elif model == "anthropic":
        # Note we haven't implemented this yet
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
    # You get the idea
    ...

async def abatch_configurable_chain(
    topics: List[str],
    *,
    model: str = "chat_openai"
) -> List[str]:
    ...

invoke_configurable_chain("ice cream", model="openai")
stream = stream_configurable_chain(
    "ice_cream",
    model="anthropic"
)
for chunk in stream:
    print(chunk, end="", flush=True)

# batch_configurable_chain(["ice cream", "spaghetti", "dumplings"])
# await ainvoke_configurable_chain("ice cream")
```

</Column>

<Column>

#### LCEL

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

## ログ

中間結果をログに記録したい場合:

<ColumnContainer>
<Column>

#### LCELなし

説明のために中間ステップを`print`します

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

#### LCEL

全てのコンポーネントがLangSmithとの統合を持っています。以下の2つの環境変数を設定すれば、全てのチェーントレースがLangSmithにログされます。

```python
import os

os.environ["LANGCHAIN_API_KEY"] = "..."
os.environ["LANGCHAIN_TRACING_V2"] = "true"

anthropic_chain.invoke("ice cream")
```

LangSmithのトレースはこちらで確認できます: https://smith.langchain.com/public/e4de52f8-bcd9-4732-b950-deee4b04e313/r

</Column>
</ColumnContainer>

## フォールバック

モデルAPIが停止した場合のフォールバック処理を追加したい場合:

<ColumnContainer>
<Column>

#### LCELなし

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
        # Note: we haven't actually implemented this.
        return await ainvoke_anthropic_chain(topic)

async def batch_chain_with_fallback(topics: List[str]) -> str:
    try:
        return batch_chain(topics)
    except Exception:
        # Note: we haven't actually implemented this.
        return batch_anthropic_chain(topics)

invoke_chain_with_fallback("ice cream")
# await ainvoke_chain_with_fallback("ice cream")
batch_chain_with_fallback(["ice cream", "spaghetti", "dumplings"]))
```

</Column>

<Column>

#### LCEL

```python
fallback_chain = chain.with_fallbacks([anthropic_chain])

fallback_chain.invoke("ice cream")
# await fallback_chain.ainvoke("ice cream")
fallback_chain.batch(["ice cream", "spaghetti", "dumplings"])
```

</Column>
</ColumnContainer>

## 完全なコード比較

この単純な例でも、LCELチェーンには多くの機能が凝縮されています。チェーンがより複雑になるほど、この価値が特に大きくなります。

<ColumnContainer>
<Column>

#### LCELなし

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
    prompt_value = promtp_template.format(topic=topic)
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
        # Note we haven't implemented this yet.
        return stream_llm_chain(topic)
    elif model == "anthropic":
        # Note we haven't implemented this yet
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

#### LCEL

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

## 次のステップ

LCELについてさらに学習するには、以下をお勧めします:
- [Interface](/docs/expression_language/interface)の完全なドキュメントを読む。ここではその一部しか扱っていません。
- [primitives](/docs/expression_language/primitives)を探索し、LCELが提供する機能をさらに理解する。
