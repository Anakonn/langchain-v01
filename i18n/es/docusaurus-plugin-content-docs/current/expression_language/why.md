---
sidebar_position: 0.5
title: Ventajas de LCEL
translated: true
---

import { ColumnContainer, Column } from "@theme/Columns";

:::tip
Le recomendamos leer primero la sección [Comenzar](/docs/expression_language/get_started) de LCEL.
:::

LCEL está diseñado para agilizar el proceso de construir aplicaciones útiles con LLM y combinar componentes relacionados. Lo hace proporcionando:

1. **Una interfaz unificada**: Cada objeto LCEL implementa la interfaz `Runnable`, que define un conjunto común de métodos de invocación (`invoke`, `batch`, `stream`, `ainvoke`, ...). Esto hace posible que las cadenas de objetos LCEL también admitan automáticamente operaciones útiles como el procesamiento por lotes y el streaming de pasos intermedios, ya que cada cadena de objetos LCEL es en sí misma un objeto LCEL.
2. **Primitivas de composición**: LCEL proporciona una serie de primitivas que facilitan la composición de cadenas, la paralelización de componentes, la adición de mecanismos de reserva, la configuración dinámica de los internos de la cadena y más.

Para comprender mejor el valor de LCEL, es útil verlo en acción y pensar en cómo podríamos recrear una funcionalidad similar sin él. En este tutorial haremos precisamente eso con nuestro [ejemplo básico](/docs/expression_language/get_started#basic_example) de la sección de inicio. Tomaremos nuestra sencilla cadena de solicitud + modelo, que ya define mucha funcionalidad bajo el capó, y veremos qué se necesitaría para recrear todo ello.

```python
%pip install --upgrade --quiet  langchain-core langchain-openai langchain-anthropic
```

## Invocar

En el caso más sencillo, solo queremos pasar una cadena de tema y obtener una cadena de broma:

<ColumnContainer>

<Column>

#### Sin LCEL

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

## Transmitir

Si queremos transmitir los resultados, tendremos que cambiar nuestra función:

<ColumnContainer>
<Column>

#### Sin LCEL

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

## Lote

Si queremos ejecutar en un lote de entradas en paralelo, necesitaremos una nueva función:

<ColumnContainer>
<Column>

#### Sin LCEL

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

## Asíncrono

Si necesitamos una versión asíncrona:

<ColumnContainer>
<Column>

#### Sin LCEL

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

## Lote asíncrono

<ColumnContainer>
<Column>

#### Sin LCEL

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

## LLM en lugar de modelo de chat

Si queremos usar un punto final de finalización en lugar de un punto final de chat:

<ColumnContainer>
<Column>

#### Sin LCEL

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

## Diferente proveedor de modelos

Si queremos usar Anthropic en lugar de OpenAI:

<ColumnContainer>
<Column>

#### Sin LCEL

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

## Configurabilidad en tiempo de ejecución

Si quisiéramos hacer que la elección del modelo de chat o LLM sea configurable en tiempo de ejecución:

<ColumnContainer>
<Column>

#### Sin LCEL

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

#### Con LCEL

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

## Registro

Si queremos registrar nuestros resultados intermedios:

<ColumnContainer>
<Column>

#### Sin LCEL

Imprimiremos los pasos intermedios con fines ilustrativos.

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

Cada componente tiene integraciones integradas con LangSmith. Si establecemos las siguientes dos variables de entorno, todos los rastros de la cadena se registran en LangSmith.

```python
import os

os.environ["LANGCHAIN_API_KEY"] = "..."
os.environ["LANGCHAIN_TRACING_V2"] = "true"

anthropic_chain.invoke("ice cream")
```

Aquí está cómo se ve nuestro rastro de LangSmith: https://smith.langchain.com/public/e4de52f8-bcd9-4732-b950-deee4b04e313/r

</Column>
</ColumnContainer>

## Mecanismos de reserva

Si quisiéramos agregar lógica de reserva, en caso de que una API de modelo esté inactiva:

<ColumnContainer>
<Column>

#### Sin LCEL

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

## Comparación de código completo

Incluso en este caso simple, nuestra cadena LCEL empaqueta de manera concisa mucha funcionalidad. A medida que las cadenas se vuelven más complejas, esto se vuelve especialmente valioso.

<ColumnContainer>
<Column>

#### Sin LCEL

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

## Próximos pasos

Para continuar aprendiendo sobre LCEL, le recomendamos:
- Leer sobre la [Interfaz](/docs/expression_language/interface) completa de LCEL, que solo hemos cubierto parcialmente aquí.
- Explorar los [primitivos](/docs/expression_language/primitives) para aprender más sobre lo que ofrece LCEL.
