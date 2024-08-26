---
keywords:
- RunnableParallel
- RunnableMap
- LCEL
sidebar_position: 1
title: 'Paralelo: Formatear datos'
translated: true
---

# Formatear entradas y salida

El primitivo `RunnableParallel` es esencialmente un diccionario cuyos valores son runnables (o cosas que se pueden coaccionar a runnables, como funciones). Ejecuta todos sus valores en paralelo, y cada valor se llama con la entrada general del `RunnableParallel`. El valor de retorno final es un diccionario con los resultados de cada valor bajo su clave apropiada.

Es útil para paralelizar operaciones, pero también puede ser útil para manipular la salida de un Runnable para que coincida con el formato de entrada del siguiente Runnable en una secuencia.

Aquí se espera que la entrada al prompt sea un mapa con las claves "context" y "question". La entrada del usuario es solo la pregunta. Entonces necesitamos obtener el contexto usando nuestro recuperador y pasar la entrada del usuario bajo la clave "question".

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()
template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)
model = ChatOpenAI()

retrieval_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)

retrieval_chain.invoke("where did harrison work?")
```

```output
'Harrison worked at Kensho.'
```

::: {.callout-tip}
Tenga en cuenta que al componer un RunnableParallel con otro Runnable ni siquiera necesitamos envolver nuestro diccionario en la clase RunnableParallel: la conversión de tipos se maneja por nosotros. En el contexto de una cadena, estos son equivalentes:
:::

```python
{"context": retriever, "question": RunnablePassthrough()}
```

```python
RunnableParallel({"context": retriever, "question": RunnablePassthrough()})
```

```python
RunnableParallel(context=retriever, question=RunnablePassthrough())
```

## Usar itemgetter como atajo

Tenga en cuenta que puede usar `itemgetter` de Python como atajo para extraer datos del mapa al combinarlo con `RunnableParallel`. Puede encontrar más información sobre itemgetter en la [Documentación de Python](https://docs.python.org/3/library/operator.html#operator.itemgetter).

En el ejemplo a continuación, usamos itemgetter para extraer claves específicas del mapa:

```python
from operator import itemgetter

from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()

template = """Answer the question based only on the following context:
{context}

Question: {question}

Answer in the following language: {language}
"""
prompt = ChatPromptTemplate.from_template(template)

chain = (
    {
        "context": itemgetter("question") | retriever,
        "question": itemgetter("question"),
        "language": itemgetter("language"),
    }
    | prompt
    | model
    | StrOutputParser()
)

chain.invoke({"question": "where did harrison work", "language": "italian"})
```

```output
'Harrison ha lavorato a Kensho.'
```

## Paralelizar pasos

RunnableParallel (también conocido como RunnableMap) facilita la ejecución de múltiples Runnables en paralelo y la devolución de la salida de estos Runnables como un mapa.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel
from langchain_openai import ChatOpenAI

model = ChatOpenAI()
joke_chain = ChatPromptTemplate.from_template("tell me a joke about {topic}") | model
poem_chain = (
    ChatPromptTemplate.from_template("write a 2-line poem about {topic}") | model
)

map_chain = RunnableParallel(joke=joke_chain, poem=poem_chain)

map_chain.invoke({"topic": "bear"})
```

```output
{'joke': AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!"),
 'poem': AIMessage(content="In the wild's embrace, bear roams free,\nStrength and grace, a majestic decree.")}
```

## Paralelismo

RunnableParallel también es útil para ejecutar procesos independientes en paralelo, ya que cada Runnable del mapa se ejecuta en paralelo. Por ejemplo, podemos ver que nuestras anteriores `joke_chain`, `poem_chain` y `map_chain` tienen aproximadamente el mismo tiempo de ejecución, a pesar de que `map_chain` ejecuta las otras dos.

```python
%%timeit

joke_chain.invoke({"topic": "bear"})
```

```output
958 ms ± 402 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```

```python
%%timeit

poem_chain.invoke({"topic": "bear"})
```

```output
1.22 s ± 508 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```

```python
%%timeit

map_chain.invoke({"topic": "bear"})
```

```output
1.15 s ± 119 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```
