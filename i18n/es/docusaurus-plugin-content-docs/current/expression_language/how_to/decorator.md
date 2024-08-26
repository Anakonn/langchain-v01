---
translated: true
---

# Crear un ejecutable con el decorador @chain

También puedes convertir una función arbitraria en una cadena agregando un decorador `@chain`. Esto es funcionalmente equivalente a envolverlo en un [`RunnableLambda`](/docs/expression_language/primitives/functions).

Esto tendrá el beneficio de una mejor observabilidad al rastrear correctamente tu cadena. Cualquier llamada a ejecutables dentro de esta función se rastreará como hijos anidados.

También te permitirá usar esto como cualquier otro ejecutable, componerlo en una cadena, etc.

¡Echemos un vistazo a esto en acción!

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import chain
from langchain_openai import ChatOpenAI
```

```python
prompt1 = ChatPromptTemplate.from_template("Tell me a joke about {topic}")
prompt2 = ChatPromptTemplate.from_template("What is the subject of this joke: {joke}")
```

```python
@chain
def custom_chain(text):
    prompt_val1 = prompt1.invoke({"topic": text})
    output1 = ChatOpenAI().invoke(prompt_val1)
    parsed_output1 = StrOutputParser().invoke(output1)
    chain2 = prompt2 | ChatOpenAI() | StrOutputParser()
    return chain2.invoke({"joke": parsed_output1})
```

`custom_chain` ahora es un ejecutable, lo que significa que deberás usar `invoke`

```python
custom_chain.invoke("bears")
```

```output
'The subject of this joke is bears.'
```

Si revisas tus rastros de LangSmith, deberías ver un rastro de `custom_chain`, con las llamadas a OpenAI anidadas debajo
