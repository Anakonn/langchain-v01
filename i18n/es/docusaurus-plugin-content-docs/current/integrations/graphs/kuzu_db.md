---
translated: true
---

# Kuzu

>[Kùzu](https://kuzudb.com) es un sistema de gestión de bases de datos de gráficos de propiedades en proceso.
>
>Este cuaderno muestra cómo usar LLM para proporcionar una interfaz de lenguaje natural a la base de datos [Kùzu](https://kuzudb.com) con el lenguaje de consulta de gráficos `Cypher`.
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) es un lenguaje de consulta de gráficos declarativo que permite una consulta de datos expresiva y eficiente en un gráfico de propiedades.

## Configuración

Instalar el paquete de python:

```bash
pip install kuzu
```

Crear una base de datos en la máquina local y conectarse a ella:

```python
import kuzu

db = kuzu.Database("test_db")
conn = kuzu.Connection(db)
```

Primero, creamos el esquema para una base de datos de películas sencilla:

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

Luego podemos insertar algunos datos.

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

## Creando `KuzuQAChain`

Ahora podemos crear el `KuzuGraph` y `KuzuQAChain`. Para crear el `KuzuGraph` simplemente necesitamos pasar el objeto de base de datos al constructor de `KuzuGraph`.

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

## Actualizar la información del esquema del gráfico

Si el esquema de la base de datos cambia, puede actualizar la información del esquema necesaria para generar las declaraciones de Cypher.

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

## Consultar el gráfico

Ahora podemos usar el `KuzuQAChain` para hacer preguntas sobre el gráfico

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
