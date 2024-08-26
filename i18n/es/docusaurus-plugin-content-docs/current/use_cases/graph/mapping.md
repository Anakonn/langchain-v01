---
sidebar_position: 1
translated: true
---

# Asignación de valores a la base de datos

En esta guía repasaremos las estrategias para mejorar la generación de consultas de la base de datos de gráficos mediante la asignación de valores de las entradas de los usuarios a la base de datos.
Cuando se utilizan las cadenas de gráficos incorporadas, el LLM conoce el esquema del gráfico, pero no tiene información sobre los valores de las propiedades almacenadas en la base de datos.
Por lo tanto, podemos introducir un nuevo paso en el sistema de preguntas y respuestas de la base de datos de gráficos para asignar con precisión los valores.

## Configuración

Primero, obtén los paquetes necesarios y establece las variables de entorno:

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai neo4j
```

Nos basamos en los modelos de OpenAI en esta guía, pero puedes intercambiarlos por el proveedor de modelos de tu elección.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Uncomment the below to use LangSmith. Not required.
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
```

```output
 ········
```

A continuación, debemos definir las credenciales de Neo4j.
Sigue [estos pasos de instalación](https://neo4j.com/docs/operations-manual/current/installation/) para configurar una base de datos Neo4j.

```python
os.environ["NEO4J_URI"] = "bolt://localhost:7687"
os.environ["NEO4J_USERNAME"] = "neo4j"
os.environ["NEO4J_PASSWORD"] = "password"
```

El siguiente ejemplo creará una conexión con una base de datos Neo4j y la poblará con datos de ejemplo sobre películas y sus actores.

```python
from langchain_community.graphs import Neo4jGraph

graph = Neo4jGraph()

# Import movie information

movies_query = """
LOAD CSV WITH HEADERS FROM
'https://raw.githubusercontent.com/tomasonjo/blog-datasets/main/movies/movies_small.csv'
AS row
MERGE (m:Movie {id:row.movieId})
SET m.released = date(row.released),
    m.title = row.title,
    m.imdbRating = toFloat(row.imdbRating)
FOREACH (director in split(row.director, '|') |
    MERGE (p:Person {name:trim(director)})
    MERGE (p)-[:DIRECTED]->(m))
FOREACH (actor in split(row.actors, '|') |
    MERGE (p:Person {name:trim(actor)})
    MERGE (p)-[:ACTED_IN]->(m))
FOREACH (genre in split(row.genres, '|') |
    MERGE (g:Genre {name:trim(genre)})
    MERGE (m)-[:IN_GENRE]->(g))
"""

graph.query(movies_query)
```

```output
[]
```

## Detección de entidades en la entrada del usuario

Tenemos que extraer los tipos de entidades/valores que queremos asignar a una base de datos de gráficos. En este ejemplo, estamos tratando con un gráfico de películas, por lo que podemos asignar películas y personas a la base de datos.

```python
from typing import List, Optional

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)


class Entities(BaseModel):
    """Identifying information about entities."""

    names: List[str] = Field(
        ...,
        description="All the person or movies appearing in the text",
    )


prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are extracting person and movies from the text.",
        ),
        (
            "human",
            "Use the given format to extract information from the following "
            "input: {question}",
        ),
    ]
)


entity_chain = prompt | llm.with_structured_output(Entities)
```

Podemos probar la cadena de extracción de entidades.

```python
entities = entity_chain.invoke({"question": "Who played in Casino movie?"})
entities
```

```output
Entities(names=['Casino'])
```

Utilizaremos una cláusula `CONTAINS` simple para hacer coincidir las entidades con la base de datos. En la práctica, es posible que desees utilizar una búsqueda difusa o un índice de texto completo para permitir pequeños errores de ortografía.

```python
match_query = """MATCH (p:Person|Movie)
WHERE p.name CONTAINS $value OR p.title CONTAINS $value
RETURN coalesce(p.name, p.title) AS result, labels(p)[0] AS type
LIMIT 1
"""


def map_to_database(entities: Entities) -> Optional[str]:
    result = ""
    for entity in entities.names:
        response = graph.query(match_query, {"value": entity})
        try:
            result += f"{entity} maps to {response[0]['result']} {response[0]['type']} in database\n"
        except IndexError:
            pass
    return result


map_to_database(entities)
```

```output
'Casino maps to Casino Movie in database\n'
```

## Cadena de generación de Cypher personalizada

Necesitamos definir un prompt de Cypher personalizado que tome la información de asignación de entidades junto con el esquema y la pregunta del usuario para construir una instrucción Cypher.
Utilizaremos el lenguaje de expresión de LangChain para lograrlo.

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Generate Cypher statement based on natural language input
cypher_template = """Based on the Neo4j graph schema below, write a Cypher query that would answer the user's question:
{schema}
Entities in the question map to the following database values:
{entities_list}
Question: {question}
Cypher query:"""  # noqa: E501

cypher_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Given an input question, convert it to a Cypher query. No pre-amble.",
        ),
        ("human", cypher_template),
    ]
)

cypher_response = (
    RunnablePassthrough.assign(names=entity_chain)
    | RunnablePassthrough.assign(
        entities_list=lambda x: map_to_database(x["names"]),
        schema=lambda _: graph.get_schema,
    )
    | cypher_prompt
    | llm.bind(stop=["\nCypherResult:"])
    | StrOutputParser()
)
```

```python
cypher = cypher_response.invoke({"question": "Who played in Casino movie?"})
cypher
```

```output
'MATCH (:Movie {title: "Casino"})<-[:ACTED_IN]-(actor)\nRETURN actor.name'
```

## Generación de respuestas basadas en los resultados de la base de datos

Ahora que tenemos una cadena que genera la instrucción Cypher, necesitamos ejecutar la instrucción Cypher en la base de datos y enviar los resultados de la base de datos de vuelta a un LLM para generar la respuesta final.
Nuevamente, utilizaremos LCEL.

```python
from langchain.chains.graph_qa.cypher_utils import CypherQueryCorrector, Schema

# Cypher validation tool for relationship directions
corrector_schema = [
    Schema(el["start"], el["type"], el["end"])
    for el in graph.structured_schema.get("relationships")
]
cypher_validation = CypherQueryCorrector(corrector_schema)

# Generate natural language response based on database results
response_template = """Based on the the question, Cypher query, and Cypher response, write a natural language response:
Question: {question}
Cypher query: {query}
Cypher Response: {response}"""  # noqa: E501

response_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Given an input question and Cypher response, convert it to a natural"
            " language answer. No pre-amble.",
        ),
        ("human", response_template),
    ]
)

chain = (
    RunnablePassthrough.assign(query=cypher_response)
    | RunnablePassthrough.assign(
        response=lambda x: graph.query(cypher_validation(x["query"])),
    )
    | response_prompt
    | llm
    | StrOutputParser()
)
```

```python
chain.invoke({"question": "Who played in Casino movie?"})
```

```output
'Robert De Niro, James Woods, Joe Pesci, and Sharon Stone played in the movie "Casino".'
```
