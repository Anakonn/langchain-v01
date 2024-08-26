---
translated: true
---

# HugeGraph

>[HugeGraph](https://hugegraph.apache.org/) es una base de datos de gráficos conveniente, eficiente y adaptable compatible con
>el marco `Apache TinkerPop3` y el lenguaje de consulta `Gremlin`.
>
>[Gremlin](https://en.wikipedia.org/wiki/Gremlin_(query_language)) es un lenguaje de recorrido de gráficos y una máquina virtual desarrollada por `Apache TinkerPop` de la `Fundación Apache`.

Este cuaderno muestra cómo usar LLM para proporcionar una interfaz de lenguaje natural a la base de datos [HugeGraph](https://hugegraph.apache.org/cn/).

## Configuración

Deberá tener una instancia de HugeGraph en ejecución.
Puede ejecutar un contenedor de docker local ejecutando el siguiente script:

```bash
docker run \
    --name=graph \
    -itd \
    -p 8080:8080 \
    hugegraph/hugegraph
```

Si queremos conectar HugeGraph en la aplicación, necesitamos instalar el sdk de python:

```bash
pip3 install hugegraph-python
```

Si está usando el contenedor de docker, necesita esperar un par de segundos para que la base de datos se inicie, y luego necesitamos crear el esquema y escribir los datos del gráfico para la base de datos.

```python
from hugegraph.connection import PyHugeGraph

client = PyHugeGraph("localhost", "8080", user="admin", pwd="admin", graph="hugegraph")
```

Primero, creamos el esquema para una base de datos de películas sencilla:

```python
"""schema"""
schema = client.schema()
schema.propertyKey("name").asText().ifNotExist().create()
schema.propertyKey("birthDate").asText().ifNotExist().create()
schema.vertexLabel("Person").properties(
    "name", "birthDate"
).usePrimaryKeyId().primaryKeys("name").ifNotExist().create()
schema.vertexLabel("Movie").properties("name").usePrimaryKeyId().primaryKeys(
    "name"
).ifNotExist().create()
schema.edgeLabel("ActedIn").sourceLabel("Person").targetLabel(
    "Movie"
).ifNotExist().create()
```

```output
'create EdgeLabel success, Detail: "b\'{"id":1,"name":"ActedIn","source_label":"Person","target_label":"Movie","frequency":"SINGLE","sort_keys":[],"nullable_keys":[],"index_labels":[],"properties":[],"status":"CREATED","ttl":0,"enable_label_index":true,"user_data":{"~create_time":"2023-07-04 10:48:47.908"}}\'"'
```

Luego podemos insertar algunos datos.

```python
"""graph"""
g = client.graph()
g.addVertex("Person", {"name": "Al Pacino", "birthDate": "1940-04-25"})
g.addVertex("Person", {"name": "Robert De Niro", "birthDate": "1943-08-17"})
g.addVertex("Movie", {"name": "The Godfather"})
g.addVertex("Movie", {"name": "The Godfather Part II"})
g.addVertex("Movie", {"name": "The Godfather Coda The Death of Michael Corleone"})

g.addEdge("ActedIn", "1:Al Pacino", "2:The Godfather", {})
g.addEdge("ActedIn", "1:Al Pacino", "2:The Godfather Part II", {})
g.addEdge(
    "ActedIn", "1:Al Pacino", "2:The Godfather Coda The Death of Michael Corleone", {}
)
g.addEdge("ActedIn", "1:Robert De Niro", "2:The Godfather Part II", {})
```

```output
1:Robert De Niro--ActedIn-->2:The Godfather Part II
```

## Creando `HugeGraphQAChain`

Ahora podemos crear `HugeGraph` y `HugeGraphQAChain`. Para crear `HugeGraph` simplemente necesitamos pasar el objeto de base de datos al constructor de `HugeGraph`.

```python
from langchain.chains import HugeGraphQAChain
from langchain_community.graphs import HugeGraph
from langchain_openai import ChatOpenAI
```

```python
graph = HugeGraph(
    username="admin",
    password="admin",
    address="localhost",
    port=8080,
    graph="hugegraph",
)
```

## Actualizar la información del esquema del gráfico

Si el esquema de la base de datos cambia, puede actualizar la información del esquema necesaria para generar las declaraciones de Gremlin.

```python
# graph.refresh_schema()
```

```python
print(graph.get_schema)
```

```output
Node properties: [name: Person, primary_keys: ['name'], properties: ['name', 'birthDate'], name: Movie, primary_keys: ['name'], properties: ['name']]
Edge properties: [name: ActedIn, properties: []]
Relationships: ['Person--ActedIn-->Movie']
```

## Consultando el gráfico

Ahora podemos usar la cadena de consultas de gráficos Gremlin para hacer preguntas sobre el gráfico

```python
chain = HugeGraphQAChain.from_llm(ChatOpenAI(temperature=0), graph=graph, verbose=True)
```

```python
chain.run("Who played in The Godfather?")
```

```output


[1m> Entering new  chain...[0m
Generated gremlin:
[32;1m[1;3mg.V().has('Movie', 'name', 'The Godfather').in('ActedIn').valueMap(true)[0m
Full Context:
[32;1m[1;3m[{'id': '1:Al Pacino', 'label': 'Person', 'name': ['Al Pacino'], 'birthDate': ['1940-04-25']}][0m

[1m> Finished chain.[0m
```

```output
'Al Pacino played in The Godfather.'
```
