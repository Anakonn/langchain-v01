---
translated: true
---

# Herramientas de OpenAI

Estos analizadores de salida extraen llamadas a herramientas de la API de llamada de funciones de OpenAI. Esto significa que solo se pueden usar con modelos que admiten la llamada de funciones y, específicamente, los últimos parámetros `tools` y `tool_choice`. Le recomendamos que se familiarice con [la llamada de funciones](/docs/modules/model_io/chat/function_calling) antes de leer esta guía.

Hay algunas variantes diferentes de analizadores de salida:

- [JsonOutputToolsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_tools.JsonOutputToolsParser.html#langchain_core.output_parsers.openai_tools.JsonOutputToolsParser): Devuelve los argumentos de la llamada a la función como JSON
- [JsonOutputKeyToolsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_tools.JsonOutputKeyToolsParser.html#langchain_core.output_parsers.openai_tools.JsonOutputKeyToolsParser): Devuelve el valor de una clave específica en la llamada a la función como JSON
- [PydanticToolsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_tools.PydanticToolsParser.html#langchain_core.output_parsers.openai_tools.PydanticToolsParser): Devuelve los argumentos de la llamada a la función como un modelo Pydantic

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import ChatOpenAI
```

```python
class Joke(BaseModel):
    """Joke to tell user."""

    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")
```

```python
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0).bind_tools([Joke])
```

```python
model.kwargs["tools"]
```

```output
[{'type': 'function',
  'function': {'name': 'Joke',
   'description': 'Joke to tell user.',
   'parameters': {'type': 'object',
    'properties': {'setup': {'description': 'question to set up a joke',
      'type': 'string'},
     'punchline': {'description': 'answer to resolve the joke',
      'type': 'string'}},
    'required': ['setup', 'punchline']}}}]
```

```python
prompt = ChatPromptTemplate.from_messages(
    [("system", "You are helpful assistant"), ("user", "{input}")]
)
```

## JsonOutputToolsParser

```python
from langchain.output_parsers.openai_tools import JsonOutputToolsParser
```

```python
parser = JsonOutputToolsParser()
```

```python
chain = prompt | model | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
[{'type': 'Joke',
  'args': {'setup': "Why don't scientists trust atoms?",
   'punchline': 'Because they make up everything!'}}]
```

Para incluir el id de la llamada a la herramienta, podemos especificar `return_id=True`:

```python
parser = JsonOutputToolsParser(return_id=True)
chain = prompt | model | parser
chain.invoke({"input": "tell me a joke"})
```

```output
[{'type': 'Joke',
  'args': {'setup': "Why don't scientists trust atoms?",
   'punchline': 'Because they make up everything!'},
  'id': 'call_Isuoh0RTeQzzOKGg5QlQ7UqI'}]
```

## JsonOutputKeyToolsParser

Esto simplemente extrae una sola clave de la respuesta devuelta. Esto es útil cuando se pasa una sola herramienta y solo se quieren sus argumentos.

```python
from typing import List

from langchain.output_parsers.openai_tools import JsonOutputKeyToolsParser
```

```python
parser = JsonOutputKeyToolsParser(key_name="Joke")
```

```python
chain = prompt | model | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
[{'setup': "Why don't scientists trust atoms?",
  'punchline': 'Because they make up everything!'}]
```

Ciertos modelos pueden devolver varias invocaciones de herramientas en cada llamada, por lo que de forma predeterminada la salida es una lista. Si solo queremos devolver la primera invocación de la herramienta, podemos especificar `first_tool_only=True`

```python
parser = JsonOutputKeyToolsParser(key_name="Joke", first_tool_only=True)
chain = prompt | model | parser
chain.invoke({"input": "tell me a joke"})
```

```output
{'setup': "Why don't scientists trust atoms?",
 'punchline': 'Because they make up everything!'}
```

## PydanticToolsParser

Esto se basa en `JsonOutputToolsParser`, pero pasa los resultados a un modelo Pydantic. Esto permite una validación adicional si lo desea.

```python
from langchain.output_parsers.openai_tools import PydanticToolsParser
```

```python
class Joke(BaseModel):
    """Joke to tell user."""

    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")

    # You can add custom validation logic easily with Pydantic.
    @validator("setup")
    def question_ends_with_question_mark(cls, field):
        if field[-1] != "?":
            raise ValueError("Badly formed question!")
        return field


parser = PydanticToolsParser(tools=[Joke])
```

```python
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0).bind_tools([Joke])
chain = prompt | model | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
[Joke(setup="Why don't scientists trust atoms?", punchline='Because they make up everything!')]
```
