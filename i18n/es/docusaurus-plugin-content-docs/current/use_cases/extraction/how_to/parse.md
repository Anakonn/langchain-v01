---
sidebar_position: 4
title: Análisis
translated: true
---

Los LLM que pueden seguir bien las instrucciones de los mensajes pueden encargarse de generar información en un formato determinado.

Este enfoque se basa en diseñar buenos mensajes y luego analizar la salida de los LLM para hacer que extraigan bien la información.

Aquí, usaremos Claude, ¡que es genial siguiendo instrucciones! Consulta [Modelos de Anthropic](https://www.anthropic.com/api).

```python
from langchain_anthropic.chat_models import ChatAnthropic

model = ChatAnthropic(model_name="claude-3-sonnet-20240229", temperature=0)
```

:::tip
Todas las mismas consideraciones sobre la calidad de la extracción se aplican al enfoque de análisis. Revisa las [directrices](/docs/use_cases/extraction/guidelines) para la calidad de la extracción.

¡Este tutorial está diseñado para ser sencillo, pero en general debería incluir ejemplos de referencia para obtener el máximo rendimiento!
:::

## Uso de PydanticOutputParser

El siguiente ejemplo utiliza el `PydanticOutputParser` integrado para analizar la salida de un modelo de chat.

```python
from typing import List, Optional

from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator


class Person(BaseModel):
    """Information about a person."""

    name: str = Field(..., description="The name of the person")
    height_in_meters: float = Field(
        ..., description="The height of the person expressed in meters."
    )


class People(BaseModel):
    """Identifying information about all people in a text."""

    people: List[Person]


# Set up a parser
parser = PydanticOutputParser(pydantic_object=People)

# Prompt
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Answer the user query. Wrap the output in `json` tags\n{format_instructions}",
        ),
        ("human", "{query}"),
    ]
).partial(format_instructions=parser.get_format_instructions())
```

Echemos un vistazo a la información que se envía al modelo

```python
query = "Anna is 23 years old and she is 6 feet tall"
```

```python
print(prompt.format_prompt(query=query).to_string())
```

```output
System: Answer the user query. Wrap the output in `json` tags
The output should be formatted as a JSON instance that conforms to the JSON schema below.

As an example, for the schema {"properties": {"foo": {"title": "Foo", "description": "a list of strings", "type": "array", "items": {"type": "string"}}}, "required": ["foo"]}
the object {"foo": ["bar", "baz"]} is a well-formatted instance of the schema. The object {"properties": {"foo": ["bar", "baz"]}} is not well-formatted.

Here is the output schema:

{"description": "Identifying information about all people in a text.", "properties": {"people": {"title": "People", "type": "array", "items": {"$ref": "#/definitions/Person"}}}, "required": ["people"], "definitions": {"Person": {"title": "Person", "description": "Information about a person.", "type": "object", "properties": {"name": {"title": "Name", "description": "The name of the person", "type": "string"}, "height_in_meters": {"title": "Height In Meters", "description": "The height of the person expressed in meters.", "type": "number"}}, "required": ["name", "height_in_meters"]}}}

Human: Anna is 23 years old and she is 6 feet tall
```

```python
chain = prompt | model | parser
chain.invoke({"query": query})
```

```output
People(people=[Person(name='Anna', height_in_meters=1.83)])
```

## Análisis personalizado

¡Es fácil crear un mensaje y un analizador personalizados con `LangChain` y `LCEL`!

¡Puedes usar una función sencilla para analizar la salida del modelo!

```python
import json
import re
from typing import List, Optional

from langchain_anthropic.chat_models import ChatAnthropic
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator


class Person(BaseModel):
    """Information about a person."""

    name: str = Field(..., description="The name of the person")
    height_in_meters: float = Field(
        ..., description="The height of the person expressed in meters."
    )


class People(BaseModel):
    """Identifying information about all people in a text."""

    people: List[Person]


# Prompt
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Answer the user query. Output your answer as JSON that  "
            "matches the given schema: ```json\n{schema}\n```. "
            "Make sure to wrap the answer in ```json and ``` tags",
        ),
        ("human", "{query}"),
    ]
).partial(schema=People.schema())


# Custom parser
def extract_json(message: AIMessage) -> List[dict]:
    """Extracts JSON content from a string where JSON is embedded between ```json and ``` tags.

    Parameters:
        text (str): The text containing the JSON content.

    Returns:
        list: A list of extracted JSON strings.
    """
    text = message.content
    # Define the regular expression pattern to match JSON blocks
    pattern = r"```json(.*?)```"

    # Find all non-overlapping matches of the pattern in the string
    matches = re.findall(pattern, text, re.DOTALL)

    # Return the list of matched JSON strings, stripping any leading or trailing whitespace
    try:
        return [json.loads(match.strip()) for match in matches]
    except Exception:
        raise ValueError(f"Failed to parse: {message}")
```

```python
query = "Anna is 23 years old and she is 6 feet tall"
print(prompt.format_prompt(query=query).to_string())
```

```output
System: Answer the user query. Output your answer as JSON that  matches the given schema: ```json
{'title': 'People', 'description': 'Identifying information about all people in a text.', 'type': 'object', 'properties': {'people': {'title': 'People', 'type': 'array', 'items': {'$ref': '#/definitions/Person'}}}, 'required': ['people'], 'definitions': {'Person': {'title': 'Person', 'description': 'Information about a person.', 'type': 'object', 'properties': {'name': {'title': 'Name', 'description': 'The name of the person', 'type': 'string'}, 'height_in_meters': {'title': 'Height In Meters', 'description': 'The height of the person expressed in meters.', 'type': 'number'}}, 'required': ['name', 'height_in_meters']}}}
    ```. Make sure to wrap the answer in ```json and ``` tags
Human: Anna is 23 years old and she is 6 feet tall
```

```python
chain = prompt | model | extract_json
chain.invoke({"query": query})
```

```output
[{'people': [{'name': 'Anna', 'height_in_meters': 1.83}]}]
```

## Otras bibliotecas

Si estás buscando extraer usando un enfoque de análisis, echa un vistazo a la biblioteca [Kor](https://eyurtsev.github.io/kor/). Está escrita por uno de los mantenedores de `LangChain` y ayuda a crear un mensaje que tenga en cuenta los ejemplos, permite controlar los formatos (por ejemplo, JSON o CSV) y expresar el esquema en TypeScript. ¡Parece funcionar bastante bien!
