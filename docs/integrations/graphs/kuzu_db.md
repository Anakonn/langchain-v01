---
canonical: https://python.langchain.com/v0.1/docs/integrations/graphs/kuzu_db
translated: false
---

# Kuzu

>[Kùzu](https://kuzudb.com) is an in-process property graph database management system.
>
>This notebook shows how to use LLMs to provide a natural language interface to [Kùzu](https://kuzudb.com) database with `Cypher` graph query language.
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) is a declarative graph query language that allows for expressive and efficient data querying in a property graph.

## Setting up

Install the python package:

```bash
pip install kuzu
```

Create a database on the local machine and connect to it:

```python
import kuzu

db = kuzu.Database("test_db")
conn = kuzu.Connection(db)
```

First, we create the schema for a simple movie database:

```python
conn.execute("CREATE NODE TABLE Movie (name STRING, PRIMARY KEY(name))")
conn.execute(
    "CREATE NODE TABLE Person (name STRING, birthDate STRING, PRIMARY KEY(name))"
)
conn.execute("CREATE REL TABLE ActedIn (FROM Person TO Movie)")
```

```output
<kuzu.query_result.QueryResult at 0x1066ff410>
```

Then we can insert some data.

```python
conn.execute("CREATE (:Person {name: 'Al Pacino', birthDate: '1940-04-25'})")
conn.execute("CREATE (:Person {name: 'Robert De Niro', birthDate: '1943-08-17'})")
conn.execute("CREATE (:Movie {name: 'The Godfather'})")
conn.execute("CREATE (:Movie {name: 'The Godfather: Part II'})")
conn.execute(
    "CREATE (:Movie {name: 'The Godfather Coda: The Death of Michael Corleone'})"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather: Part II' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather Coda: The Death of Michael Corleone' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Robert De Niro' AND m.name = 'The Godfather: Part II' CREATE (p)-[:ActedIn]->(m)"
)
```

```output
<kuzu.query_result.QueryResult at 0x107016210>
```

## Creating `KuzuQAChain`

We can now create the `KuzuGraph` and `KuzuQAChain`. To create the `KuzuGraph` we simply need to pass the database object to the `KuzuGraph` constructor.

```python
from langchain.chains import KuzuQAChain
from langchain_community.graphs import KuzuGraph
from langchain_openai import ChatOpenAI
```

```python
graph = KuzuGraph(db)
```

```python
chain = KuzuQAChain.from_llm(ChatOpenAI(temperature=0), graph=graph, verbose=True)
```

## Refresh graph schema information

If the schema of database changes, you can refresh the schema information needed to generate Cypher statements.

```python
# graph.refresh_schema()
```

```python
print(graph.get_schema)
```

```output
Node properties: [{'properties': [('name', 'STRING')], 'label': 'Movie'}, {'properties': [('name', 'STRING'), ('birthDate', 'STRING')], 'label': 'Person'}]
Relationships properties: [{'properties': [], 'label': 'ActedIn'}]
Relationships: ['(:Person)-[:ActedIn]->(:Movie)']
```

## Querying the graph

We can now use the `KuzuQAChain` to ask question of the graph

```python
chain.run("Who played in The Godfather: Part II?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[:ActedIn]->(m:Movie {name: 'The Godfather: Part II'}) RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Al Pacino'}, {'p.name': 'Robert De Niro'}][0m

[1m> Finished chain.[0m
```

```output
'Al Pacino and Robert De Niro both played in The Godfather: Part II.'
```

```python
chain.run("Robert De Niro played in which movies?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person {name: 'Robert De Niro'})-[:ActedIn]->(m:Movie)
RETURN m.name[0m
Full Context:
[32;1m[1;3m[{'m.name': 'The Godfather: Part II'}][0m

[1m> Finished chain.[0m
```

```output
'Robert De Niro played in The Godfather: Part II.'
```

```python
chain.run("Robert De Niro is born in which year?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person {name: 'Robert De Niro'})-[:ActedIn]->(m:Movie)
RETURN p.birthDate[0m
Full Context:
[32;1m[1;3m[{'p.birthDate': '1943-08-17'}][0m

[1m> Finished chain.[0m
```

```output
'Robert De Niro was born on August 17, 1943.'
```

```python
chain.run("Who is the oldest actor who played in The Godfather: Part II?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[:ActedIn]->(m:Movie{name:'The Godfather: Part II'})
WITH p, m, p.birthDate AS birthDate
ORDER BY birthDate ASC
LIMIT 1
RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Al Pacino'}][0m

[1m> Finished chain.[0m
```

```output
'The oldest actor who played in The Godfather: Part II is Al Pacino.'
```