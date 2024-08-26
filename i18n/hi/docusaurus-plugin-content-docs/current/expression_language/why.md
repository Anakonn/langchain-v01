---
sidebar_position: 0.5
title: LCEL के लाभ
translated: true
---

import { ColumnContainer, Column } from "@theme/Columns";

:::tip
हम आपको पहले LCEL [शुरू करें](/docs/expression_language/get_started) खंड पढ़ने की सलाह देते हैं।
:::

LCEL को LLM और संबंधित घटकों के साथ उपयोगी ऐप्स बनाने की प्रक्रिया को सरल बनाने के लिए डिज़ाइन किया गया है। यह निम्न प्रदान करके ऐसा करता है:

1. **एक एकीकृत इंटरफ़ेस**: प्रत्येक LCEL ऑब्जेक्ट `Runnable` इंटरफ़ेस को लागू करता है, जो आमंत्रण विधियों (`invoke`, `batch`, `stream`, `ainvoke`, ...) का एक सामान्य सेट परिभाषित करता है। यह LCEL ऑब्जेक्टों की श्रृंखला के लिए भी उपयोगी ऑपरेशन जैसे मध्यवर्ती चरणों का बैचिंग और स्ट्रीमिंग का समर्थन करना संभव बनाता है, क्योंकि LCEL ऑब्जेक्टों की प्रत्येक श्रृंखला खुद एक LCEL ऑब्जेक्ट है।
2. **संरचना प्राथमिकताएं**: LCEL कई प्राथमिकताएं प्रदान करता है जो श्रृंखलाओं को संयोजित करना, घटकों को समानांतर करना, बैकअप जोड़ना, श्रृंखला के आंतरिक घटकों को गतिशील रूप से कॉन्फ़िगर करना और अधिक आसान बनाते हैं।

LCEL के मूल्य को बेहतर समझने के लिए, यह उसे कार्य में देखना और उसके बिना समान कार्यक्षमता को कैसे पुनर्निर्मित किया जा सकता है, इस पर विचार करना मददगार होगा। इस वॉकथ्रू में हम ऐसा ही करेंगे अपने [मूल उदाहरण](/docs/expression_language/get_started#basic_example) के साथ, जिसे हम शुरू करने के खंड से लिया है। हम अपने सरल प्रोम्प्ट + मॉडल श्रृंखला को लेंगे, जिसके तहत पहले से ही बहुत सारी कार्यक्षमता परिभाषित है, और देखेंगे कि इसे पुनर्निर्मित करने के लिए क्या करना होगा।

```python
%pip install --upgrade --quiet  langchain-core langchain-openai langchain-anthropic
```

## आमंत्रण

सबसे सरल मामले में, हम केवल एक विषय स्ट्रिंग को पास करना चाहते हैं और एक मज़ेदार स्ट्रिंग वापस प्राप्त करना चाहते हैं:

<ColumnContainer>

<Column>

#### LCEL के बिना

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

## स्ट्रीम

अगर हम परिणामों को स्ट्रीम करना चाहते हैं, तो हमें अपने फ़ंक्शन को बदलना होगा:

<ColumnContainer>
<Column>

#### LCEL के बिना

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

## बैच

अगर हम समानांतर में एक इनपुट बैच पर चलना चाहते हैं, तो हमें एक नया फ़ंक्शन की आवश्यकता होगी:

<ColumnContainer>
<Column>

#### LCEL के बिना

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

## असिंक्रोनस

अगर हमें एक असिंक्रोनस संस्करण की आवश्यकता है:

<ColumnContainer>
<Column>

#### LCEL के बिना

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

## असिंक्रोनस बैच

<ColumnContainer>
<Column>

#### LCEL के बिना

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

## चैट मॉडल के बजाय LLM

अगर हम पूर्णता अंतःक्रिया के बजाय पूर्णता अंतःक्रिया अंतःक्रिया का उपयोग करना चाहते हैं:

<ColumnContainer>
<Column>

#### LCEL के बिना

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

## अलग मॉडल प्रदाता

अगर हम OpenAI के बजाय Anthropic का उपयोग करना चाहते हैं:

<ColumnContainer>
<Column>

#### LCEL के बिना

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

## रनटाइम कॉन्फ़िगरेशन

अगर हम चैट मॉडल या LLM का चयन रनटाइम पर कॉन्फ़िगर करना चाहते हैं:

<ColumnContainer>
<Column>

#### LCEL के बिना

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

#### LCEL के साथ

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

## लॉगिंग

अगर हम अपने मध्यवर्ती परिणामों को लॉग करना चाहते हैं:

<ColumnContainer>
<Column>

#### LCEL के बिना

हम प्रदर्शनात्मक उद्देश्यों के लिए मध्यवर्ती चरणों को `print` करेंगे।

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

प्रत्येक घटक में LangSmith के साथ एकीकरण है। अगर हम निम्नलिखित दो पर्यावरण चर सेट करते हैं, तो सभी श्रृंखला ट्रेस LangSmith में लॉग किए जाते हैं।

```python
import os

os.environ["LANGCHAIN_API_KEY"] = "..."
os.environ["LANGCHAIN_TRACING_V2"] = "true"

anthropic_chain.invoke("ice cream")
```

यहां हमारा LangSmith ट्रेस दिखता है: https://smith.langchain.com/public/e4de52f8-bcd9-4732-b950-deee4b04e313/r

</Column>
</ColumnContainer>

## बैकअप

अगर हम बैकअप लॉजिक जोड़ना चाहते हैं, अगर एक मॉडल API डाउन हो जाता है:

<ColumnContainer>
<Column>

#### LCEL के बिना

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

## पूर्ण कोड तुलना

यहां तक कि इस सरल मामले में भी, हमारी LCEL श्रृंखला बहुत सारी कार्यक्षमता को संक्षिप्त रूप में पैक करती है। जैसे-जैसे श्रृंखलाएं अधिक जटिल होती हैं, यह विशेष रूप से मूल्यवान हो जाता है।

<ColumnContainer>
<Column>

#### LCEL के बिना

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

## अगले कदम

LCEL के बारे में और अधिक सीखने के लिए, हम आपको सिफारिश करते हैं:
- पूरे LCEL [इंटरफ़ेस](/docs/expression_language/interface) के बारे में पढ़ना, जिसे हमने यहां केवल आंशिक रूप से कवर किया है।
- [प्राथमिकताओं](/docs/expression_language/primitives) का अन्वेषण करना ताकि आप LCEL द्वारा प्रदान की जाने वाली चीजों के बारे में और अधिक जान सकें।
