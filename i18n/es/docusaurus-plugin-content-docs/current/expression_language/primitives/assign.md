---
keywords:
- RunnablePassthrough
- assign
- LCEL
sidebar_position: 6
title: 'Asignar: Agregar valores al estado'
translated: true
---

# Agregar valores al estado de la cadena

El método estático `RunnablePassthrough.assign(...)` toma un valor de entrada y agrega los argumentos adicionales pasados a la función de asignación.

Esto es útil cuando se crea aditivamente un diccionario para usar como entrada en un paso posterior, que es un patrón común de LCEL.

Aquí hay un ejemplo:

```python
%pip install --upgrade --quiet langchain langchain-openai
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 24.0 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

runnable = RunnableParallel(
    extra=RunnablePassthrough.assign(mult=lambda x: x["num"] * 3),
    modified=lambda x: x["num"] + 1,
)

runnable.invoke({"num": 1})
```

```output
{'extra': {'num': 1, 'mult': 3}, 'modified': 2}
```

Vamos a desglosar lo que está sucediendo aquí.

- La entrada a la cadena es `{"num": 1}`. Esto se pasa a un `RunnableParallel`, que invoca los ejecutables que se le pasan en paralelo con esa entrada.
- Se invoca el valor bajo la clave `extra`. `RunnablePassthrough.assign()` mantiene las claves originales en el diccionario de entrada (`{"num": 1}`), y asigna una nueva clave llamada `mult`. El valor es `lambda x: x["num"] * 3)`, que es `3`. Por lo tanto, el resultado es `{"num": 1, "mult": 3}`.
- `{"num": 1, "mult": 3}` se devuelve a la llamada `RunnableParallel` y se establece como el valor de la clave `extra`.
- Al mismo tiempo, se llama a la clave `modified`. El resultado es `2`, ya que la lambda extrae una clave llamada `"num"` de su entrada y le suma uno.

Por lo tanto, el resultado es `{'extra': {'num': 1, 'mult': 3}, 'modified': 2}`.

## Transmisión en flujo continuo

Una característica agradable de este método es que permite que los valores pasen a través tan pronto como estén disponibles. Para mostrar esto, usaremos `RunnablePassthrough.assign()` para devolver inmediatamente los documentos fuente en una cadena de recuperación:

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

generation_chain = prompt | model | StrOutputParser()

retrieval_chain = {
    "context": retriever,
    "question": RunnablePassthrough(),
} | RunnablePassthrough.assign(output=generation_chain)

stream = retrieval_chain.stream("where did harrison work?")

for chunk in stream:
    print(chunk)
```

```output
{'question': 'where did harrison work?'}
{'context': [Document(page_content='harrison worked at kensho')]}
{'output': ''}
{'output': 'H'}
{'output': 'arrison'}
{'output': ' worked'}
{'output': ' at'}
{'output': ' Kens'}
{'output': 'ho'}
{'output': '.'}
{'output': ''}
```

Podemos ver que el primer fragmento contiene el `"question"` original, ya que eso está inmediatamente disponible. El segundo fragmento contiene `"context"` ya que el recuperador termina segundo. Finalmente, la salida de la `generation_chain` se transmite en fragmentos tan pronto como esté disponible.
