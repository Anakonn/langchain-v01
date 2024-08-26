---
sidebar_position: 1
translated: true
---

# Mappage des valeurs à la base de données

Dans ce guide, nous allons examiner les stratégies permettant d'améliorer la génération de requêtes de base de données de graphes en mappant les valeurs des entrées utilisateur à la base de données.
Lors de l'utilisation des chaînes de graphes intégrées, le LLM connaît le schéma du graphe, mais n'a aucune information sur les valeurs des propriétés stockées dans la base de données.
Par conséquent, nous pouvons introduire une nouvelle étape dans le système de QA de base de données de graphes pour mapper précisément les valeurs.

## Configuration

Tout d'abord, obtenez les packages requis et définissez les variables d'environnement :

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai neo4j
```

Nous utilisons par défaut les modèles OpenAI dans ce guide, mais vous pouvez les remplacer par le fournisseur de modèle de votre choix.

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

Ensuite, nous devons définir les identifiants Neo4j.
Suivez [ces étapes d'installation](https://neo4j.com/docs/operations-manual/current/installation/) pour configurer une base de données Neo4j.

```python
os.environ["NEO4J_URI"] = "bolt://localhost:7687"
os.environ["NEO4J_USERNAME"] = "neo4j"
os.environ["NEO4J_PASSWORD"] = "password"
```

L'exemple ci-dessous créera une connexion avec une base de données Neo4j et la remplira avec des données d'exemple sur les films et leurs acteurs.

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

## Détection des entités dans l'entrée utilisateur

Nous devons extraire les types d'entités/valeurs que nous voulons mapper à une base de données de graphes. Dans cet exemple, nous traitons d'un graphe de films, donc nous pouvons mapper les films et les personnes à la base de données.

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

Nous pouvons tester la chaîne d'extraction d'entités.

```python
entities = entity_chain.invoke({"question": "Who played in Casino movie?"})
entities
```

```output
Entities(names=['Casino'])
```

Nous utiliserons une clause `CONTAINS` simple pour faire correspondre les entités à la base de données. Dans la pratique, vous voudrez peut-être utiliser une recherche floue ou un index de texte intégral pour permettre de petites fautes d'orthographe.

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

## Chaîne de génération de Cypher personnalisée

Nous devons définir une invite Cypher personnalisée qui prend les informations de mappage d'entités ainsi que le schéma et la question de l'utilisateur pour construire une instruction Cypher.
Nous utiliserons le langage d'expression LangChain pour y parvenir.

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

## Génération de réponses basées sur les résultats de la base de données

Maintenant que nous avons une chaîne qui génère l'instruction Cypher, nous devons exécuter l'instruction Cypher sur la base de données et renvoyer les résultats de la base de données à un LLM pour générer la réponse finale.
Encore une fois, nous utiliserons LCEL.

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
