---
sidebar_position: 0
title: Prompt + LLM
translated: true
---

La composición más común y valiosa es tomar:

``PromptTemplate`` / ``ChatPromptTemplate`` -> ``LLM`` / ``ChatModel`` -> ``OutputParser``

Casi cualquier otra cadena que construyas usará este bloque de construcción.

## PromptTemplate + LLM

La composición más simple es simplemente combinar un prompt y un modelo para crear una cadena que tome la entrada del usuario, la agregue a un prompt, la pase a un modelo y devuelva la salida cruda del modelo.

Nota, puedes mezclar y combinar PromptTemplate/ChatPromptTemplates y LLMs/ChatModels como quieras aquí.
%pip install --upgrade --quiet  langchain langchain-openai

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template("tell me a joke about {foo}")
model = ChatOpenAI()
chain = prompt | model
```

```python
chain.invoke({"foo": "bears"})
```

```output
AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!", additional_kwargs={}, example=False)
```

A menudo queremos adjuntar kwargs que se pasarán a cada llamada al modelo. Aquí hay algunos ejemplos de eso:

### Adjuntar secuencias de detención

```python
chain = prompt | model.bind(stop=["\n"])
```

```python
chain.invoke({"foo": "bears"})
```

```output
AIMessage(content='Why did the bear never wear shoes?', additional_kwargs={}, example=False)
```

### Adjuntar información de llamada a función

```python
functions = [
    {
        "name": "joke",
        "description": "A joke",
        "parameters": {
            "type": "object",
            "properties": {
                "setup": {"type": "string", "description": "The setup for the joke"},
                "punchline": {
                    "type": "string",
                    "description": "The punchline for the joke",
                },
            },
            "required": ["setup", "punchline"],
        },
    }
]
chain = prompt | model.bind(function_call={"name": "joke"}, functions=functions)
```

```python
chain.invoke({"foo": "bears"}, config={})
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'joke', 'arguments': '{\n  "setup": "Why don\'t bears wear shoes?",\n  "punchline": "Because they have bear feet!"\n}'}}, example=False)
```

## PromptTemplate + LLM + OutputParser

También podemos agregar un analizador de salida para transformar fácilmente la salida cruda de LLM/ChatModel en un formato más manejable

```python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | model | StrOutputParser()
```

Observe que ahora devuelve una cadena, un formato mucho más manejable para las tareas posteriores

```python
chain.invoke({"foo": "bears"})
```

```output
"Why don't bears wear shoes?\n\nBecause they have bear feet!"
```

### Analizador de salida de funciones

Cuando especificas la función a devolver, es posible que solo quieras analizar eso directamente

```python
from langchain.output_parsers.openai_functions import JsonOutputFunctionsParser

chain = (
    prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonOutputFunctionsParser()
)
```

```python
chain.invoke({"foo": "bears"})
```

```output
{'setup': "Why don't bears like fast food?",
 'punchline': "Because they can't catch it!"}
```

```python
from langchain.output_parsers.openai_functions import JsonKeyOutputFunctionsParser

chain = (
    prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke({"foo": "bears"})
```

```output
"Why don't bears wear shoes?"
```

## Simplificar la entrada

Para hacer que la invocación sea aún más sencilla, podemos agregar un `RunnableParallel` para que se encargue de crear el diccionario de entrada del prompt por nosotros:

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

map_ = RunnableParallel(foo=RunnablePassthrough())
chain = (
    map_
    | prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke("bears")
```

```output
"Why don't bears wear shoes?"
```

Dado que estamos componiendo nuestro mapa con otro Runnable, incluso podemos usar un poco de azúcar sintáctico y usar solo un diccionario:

```python
chain = (
    {"foo": RunnablePassthrough()}
    | prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke("bears")
```

```output
"Why don't bears like fast food?"
```
