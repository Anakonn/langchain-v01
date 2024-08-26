---
sidebar_position: 4
title: Analyse
translated: true
---

Les LLM capables de bien suivre les instructions des invites peuvent être chargés de produire des informations dans un format donné.

Cette approche s'appuie sur la conception de bonnes invites, puis sur l'analyse de la sortie des LLM pour les faire extraire les informations correctement.

Ici, nous utiliserons Claude qui est excellent pour suivre les instructions ! Voir [Modèles Anthropic](https://www.anthropic.com/api).

```python
from langchain_anthropic.chat_models import ChatAnthropic

model = ChatAnthropic(model_name="claude-3-sonnet-20240229", temperature=0)
```

:::tip
Toutes les mêmes considérations sur la qualité de l'extraction s'appliquent à l'approche d'analyse. Passez en revue les [directives](/docs/use_cases/extraction/guidelines) pour la qualité de l'extraction.

Ce tutoriel se veut simple, mais en général, il devrait vraiment inclure des exemples de référence pour optimiser les performances !
:::

## Utilisation de PydanticOutputParser

L'exemple suivant utilise le `PydanticOutputParser` intégré pour analyser la sortie d'un modèle de conversation.

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

Examinons les informations envoyées au modèle

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

## Analyse personnalisée

Il est facile de créer une invite et un analyseur personnalisés avec `LangChain` et `LCEL`.

Vous pouvez utiliser une simple fonction pour analyser la sortie du modèle !

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

## Autres bibliothèques

Si vous cherchez à extraire en utilisant une approche d'analyse, consultez la bibliothèque [Kor](https://eyurtsev.github.io/kor/). Elle est écrite par l'un des mainteneurs de `LangChain` et aide à concevoir une invite qui prend en compte des exemples, permet de contrôler les formats (par exemple, JSON ou CSV) et exprime le schéma en TypeScript. Elle semble fonctionner assez bien !
