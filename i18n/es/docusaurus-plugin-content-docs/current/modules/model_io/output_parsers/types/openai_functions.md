---
translated: true
---

# Funciones de OpenAI

Estos analizadores de salida utilizan la llamada a funciones de OpenAI para estructurar sus salidas. Esto significa que solo se pueden utilizar con modelos que admitan la llamada a funciones. Hay algunas variantes diferentes:

- [JsonOutputFunctionsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_functions.JsonOutputFunctionsParser.html#langchain_core.output_parsers.openai_functions.JsonOutputFunctionsParser): Devuelve los argumentos de la llamada a la función como JSON
- [PydanticOutputFunctionsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_functions.PydanticOutputFunctionsParser.html#langchain_core.output_parsers.openai_functions.PydanticOutputFunctionsParser): Devuelve los argumentos de la llamada a la función como un modelo Pydantic
- [JsonKeyOutputFunctionsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_functions.JsonKeyOutputFunctionsParser.html#langchain_core.output_parsers.openai_functions.JsonKeyOutputFunctionsParser): Devuelve el valor de una clave específica en la llamada a la función como JSON
- [PydanticAttrOutputFunctionsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_functions.PydanticAttrOutputFunctionsParser.html#langchain_core.output_parsers.openai_functions.PydanticAttrOutputFunctionsParser): Devuelve el valor de una clave específica en la llamada a la función como un modelo Pydantic

```python
from langchain_community.utils.openai_functions import (
    convert_pydantic_to_openai_function,
)
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import ChatOpenAI
```

```python
class Joke(BaseModel):
    """Joke to tell user."""

    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")


openai_functions = [convert_pydantic_to_openai_function(Joke)]
```

```python
model = ChatOpenAI(temperature=0)
```

```python
prompt = ChatPromptTemplate.from_messages(
    [("system", "You are helpful assistant"), ("user", "{input}")]
)
```

## JsonOutputFunctionsParser

```python
from langchain.output_parsers.openai_functions import JsonOutputFunctionsParser
```

```python
parser = JsonOutputFunctionsParser()
```

```python
chain = prompt | model.bind(functions=openai_functions) | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
{'setup': "Why don't scientists trust atoms?",
 'punchline': 'Because they make up everything!'}
```

```python
for s in chain.stream({"input": "tell me a joke"}):
    print(s)
```

```output
{}
{'setup': ''}
{'setup': 'Why'}
{'setup': 'Why don'}
{'setup': "Why don't"}
{'setup': "Why don't scientists"}
{'setup': "Why don't scientists trust"}
{'setup': "Why don't scientists trust atoms"}
{'setup': "Why don't scientists trust atoms?", 'punchline': ''}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}
```

## JsonKeyOutputFunctionsParser

Esto simplemente extrae una sola clave de la respuesta devuelta. Esto es útil cuando se quiere devolver una lista de cosas.

```python
from typing import List

from langchain.output_parsers.openai_functions import JsonKeyOutputFunctionsParser
```

```python
class Jokes(BaseModel):
    """Jokes to tell user."""

    joke: List[Joke]
    funniness_level: int
```

```python
parser = JsonKeyOutputFunctionsParser(key_name="joke")
```

```python
openai_functions = [convert_pydantic_to_openai_function(Jokes)]
chain = prompt | model.bind(functions=openai_functions) | parser
```

```python
chain.invoke({"input": "tell me two jokes"})
```

```output
[{'setup': "Why don't scientists trust atoms?",
  'punchline': 'Because they make up everything!'},
 {'setup': 'Why did the scarecrow win an award?',
  'punchline': 'Because he was outstanding in his field!'}]
```

```python
for s in chain.stream({"input": "tell me two jokes"}):
    print(s)
```

```output
[]
[{}]
[{'setup': ''}]
[{'setup': 'Why'}]
[{'setup': 'Why don'}]
[{'setup': "Why don't"}]
[{'setup': "Why don't scientists"}]
[{'setup': "Why don't scientists trust"}]
[{'setup': "Why don't scientists trust atoms"}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': ''}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': ''}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scare'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': ''}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because he'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because he was'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because he was outstanding'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because he was outstanding in'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because he was outstanding in his'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because he was outstanding in his field'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because he was outstanding in his field!'}]
```

## PydanticOutputFunctionsParser

Esto se basa en `JsonOutputFunctionsParser`, pero pasa los resultados a un modelo Pydantic. Esto permite una validación adicional si se desea.

```python
from langchain.output_parsers.openai_functions import PydanticOutputFunctionsParser
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


parser = PydanticOutputFunctionsParser(pydantic_schema=Joke)
```

```python
openai_functions = [convert_pydantic_to_openai_function(Joke)]
chain = prompt | model.bind(functions=openai_functions) | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
Joke(setup="Why don't scientists trust atoms?", punchline='Because they make up everything!')
```
