---
keywords:
- RunnablePassthrough
- LCEL
sidebar_position: 5
title: 'Passthrough: Pasar a través de las entradas'
translated: true
---

# Pasar datos a través

RunnablePassthrough por sí solo le permite pasar las entradas sin cambios. Esto generalmente se usa en conjunto con RunnableParallel para pasar datos a través de una nueva clave en el mapa.

Vea el ejemplo a continuación:

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

runnable = RunnableParallel(
    passed=RunnablePassthrough(),
    modified=lambda x: x["num"] + 1,
)

runnable.invoke({"num": 1})
```

```output
{'passed': {'num': 1}, 'extra': {'num': 1, 'mult': 3}, 'modified': 2}
```

Como se ve arriba, la clave `passed` se llamó con `RunnablePassthrough()` y simplemente pasó `{'num': 1}`.

También establecimos una segunda clave en el mapa con `modified`. Esto usa una lambda para establecer un solo valor, sumando 1 al num, lo que resultó en la clave `modified` con el valor de `2`.

## Ejemplo de recuperación

En el ejemplo a continuación, vemos un caso de uso donde usamos `RunnablePassthrough` junto con `RunnableParallel`.

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

Aquí se espera que la entrada al prompt sea un mapa con las claves "context" y "question". La entrada del usuario es solo la pregunta. Entonces necesitamos obtener el contexto usando nuestro recuperador y pasar la pregunta del usuario bajo la clave "question". En este caso, RunnablePassthrough nos permite pasar la pregunta del usuario al prompt y al modelo.
