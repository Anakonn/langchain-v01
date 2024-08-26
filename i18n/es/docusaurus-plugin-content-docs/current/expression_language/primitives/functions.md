---
keywords:
- RunnableLambda
- LCEL
sidebar_position: 3
title: 'Lambda: Ejecutar funciones personalizadas'
translated: true
---

# Ejecutar funciones personalizadas

Puedes usar funciones arbitrarias en la canalización.

Tenga en cuenta que todas las entradas a estas funciones deben ser un SOLO argumento. Si tiene una función que acepta varios argumentos, debe escribir un wrapper que acepte una sola entrada y la desempaque en varios argumentos.
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

## Aceptar una Runnable Config

Las lambdas ejecutables pueden aceptar opcionalmente un [RunnableConfig](https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.config.RunnableConfig.html#langchain_core.runnables.config.RunnableConfig), que pueden usar para pasar devoluciones de llamada, etiquetas y otra información de configuración a ejecuciones anidadas.

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

# Streaming

Puedes usar funciones generadoras (es decir, funciones que usan la palabra clave `yield` y se comportan como iteradores) en una canalización LCEL.

La firma de estos generadores debe ser `Iterator[Input] -> Iterator[Output]`. O para generadores asíncronos: `AsyncIterator[Input] -> AsyncIterator[Output]`.

Estos son útiles para:
- implementar un analizador de salida personalizado
- modificar la salida de un paso anterior, mientras se conservan las capacidades de transmisión

Aquí hay un ejemplo de un analizador de salida personalizado para listas separadas por comas:

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
# This is a custom parser that splits an iterator of llm tokens
# into a list of strings separated by commas
def split_into_list(input: Iterator[str]) -> Iterator[List[str]]:
    # hold partial input until we get a comma
    buffer = ""
    for chunk in input:
        # add current chunk to buffer
        buffer += chunk
        # while there are commas in the buffer
        while "," in buffer:
            # split buffer on comma
            comma_index = buffer.index(",")
            # yield everything before the comma
            yield [buffer[:comma_index].strip()]
            # save the rest for the next iteration
            buffer = buffer[comma_index + 1 :]
    # yield the last chunk
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

## Versión asíncrona

```python
from typing import AsyncIterator


async def asplit_into_list(
    input: AsyncIterator[str],
) -> AsyncIterator[List[str]]:  # async def
    buffer = ""
    async for (
        chunk
    ) in input:  # `input` is a `async_generator` object, so use `async for`
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
