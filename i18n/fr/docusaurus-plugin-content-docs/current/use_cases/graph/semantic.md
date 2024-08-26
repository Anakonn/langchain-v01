---
sidebar_position: 1
translated: true
---

# Couche sémantique sur une base de données de graphes

Vous pouvez utiliser des requêtes de base de données pour récupérer des informations à partir d'une base de données de graphes comme Neo4j.
Une option consiste à utiliser des LLM pour générer des instructions Cypher.
Bien que cette option offre une excellente flexibilité, la solution pourrait être fragile et ne pas générer de manière cohérente des instructions Cypher précises.
Au lieu de générer des instructions Cypher, nous pouvons mettre en œuvre des modèles Cypher en tant qu'outils dans une couche sémantique avec laquelle un agent LLM peut interagir.

![graph_semantic.png](../../../../../../static/img/graph_semantic.png)

## Configuration

Tout d'abord, obtenez les packages requis et définissez les variables d'environnement :

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai neo4j
```

```output
Note: you may need to restart the kernel to use updated packages.
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

L'exemple ci-dessous créera une connexion avec une base de données Neo4j et y chargera des données d'exemple sur les films et leurs acteurs.

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

## Outils personnalisés avec des modèles Cypher

Une couche sémantique se compose de divers outils exposés à un LLM qu'il peut utiliser pour interagir avec un graphe de connaissances.
Ils peuvent être de complexité variable. Vous pouvez considérer chaque outil dans une couche sémantique comme une fonction.

La fonction que nous allons mettre en œuvre est de récupérer des informations sur les films ou leur distribution.

```python
from typing import Optional, Type

from langchain.callbacks.manager import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)

# Import things that are needed generically
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import BaseTool

description_query = """
MATCH (m:Movie|Person)
WHERE m.title CONTAINS $candidate OR m.name CONTAINS $candidate
MATCH (m)-[r:ACTED_IN|HAS_GENRE]-(t)
WITH m, type(r) as type, collect(coalesce(t.name, t.title)) as names
WITH m, type+": "+reduce(s="", n IN names | s + n + ", ") as types
WITH m, collect(types) as contexts
WITH m, "type:" + labels(m)[0] + "\ntitle: "+ coalesce(m.title, m.name)
       + "\nyear: "+coalesce(m.released,"") +"\n" +
       reduce(s="", c in contexts | s + substring(c, 0, size(c)-2) +"\n") as context
RETURN context LIMIT 1
"""


def get_information(entity: str) -> str:
    try:
        data = graph.query(description_query, params={"candidate": entity})
        return data[0]["context"]
    except IndexError:
        return "No information was found"
```

Vous pouvez observer que nous avons défini l'instruction Cypher utilisée pour récupérer les informations.
Par conséquent, nous pouvons éviter de générer des instructions Cypher et utiliser l'agent LLM pour ne remplir que les paramètres d'entrée.
Pour fournir des informations supplémentaires à un agent LLM sur le moment où utiliser l'outil et ses paramètres d'entrée, nous enveloppons la fonction en tant qu'outil.

```python
from typing import Optional, Type

from langchain.callbacks.manager import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)

# Import things that are needed generically
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import BaseTool


class InformationInput(BaseModel):
    entity: str = Field(description="movie or a person mentioned in the question")


class InformationTool(BaseTool):
    name = "Information"
    description = (
        "useful for when you need to answer questions about various actors or movies"
    )
    args_schema: Type[BaseModel] = InformationInput

    def _run(
        self,
        entity: str,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Use the tool."""
        return get_information(entity)

    async def _arun(
        self,
        entity: str,
        run_manager: Optional[AsyncCallbackManagerForToolRun] = None,
    ) -> str:
        """Use the tool asynchronously."""
        return get_information(entity)
```

## Agent OpenAI

Le langage d'expression LangChain facilite grandement la définition d'un agent pour interagir avec une base de données de graphes via la couche sémantique.

```python
from typing import List, Tuple

from langchain.agents import AgentExecutor
from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.utils.function_calling import convert_to_openai_function
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
tools = [InformationTool()]

llm_with_tools = llm.bind(functions=[convert_to_openai_function(t) for t in tools])

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant that finds information about movies "
            " and recommends them. If tools require follow up questions, "
            "make sure to ask the user for clarification. Make sure to include any "
            "available options that need to be clarified in the follow up questions "
            "Do only the things the user specifically requested. ",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)


def _format_chat_history(chat_history: List[Tuple[str, str]]):
    buffer = []
    for human, ai in chat_history:
        buffer.append(HumanMessage(content=human))
        buffer.append(AIMessage(content=ai))
    return buffer


agent = (
    {
        "input": lambda x: x["input"],
        "chat_history": lambda x: _format_chat_history(x["chat_history"])
        if x.get("chat_history")
        else [],
        "agent_scratchpad": lambda x: format_to_openai_function_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm_with_tools
    | OpenAIFunctionsAgentOutputParser()
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.invoke({"input": "Who played in Casino?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `Information` with `{'entity': 'Casino'}`


[0m[36;1m[1;3mtype:Movie
title: Casino
year: 1995-11-22
ACTED_IN: Joe Pesci, Robert De Niro, Sharon Stone, James Woods
[0m[32;1m[1;3mThe movie "Casino" starred Joe Pesci, Robert De Niro, Sharon Stone, and James Woods.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Who played in Casino?',
 'output': 'The movie "Casino" starred Joe Pesci, Robert De Niro, Sharon Stone, and James Woods.'}
```
