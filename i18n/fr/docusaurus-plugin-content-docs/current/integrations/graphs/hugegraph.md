---
translated: true
---

# HugeGraph

>[HugeGraph](https://hugegraph.apache.org/) est une base de données de graphes pratique, efficace et adaptable compatible avec
>le cadre `Apache TinkerPop3` et le langage de requête `Gremlin`.
>
>[Gremlin](https://en.wikipedia.org/wiki/Gremlin_(query_language)) est un langage de parcours de graphe et une machine virtuelle développés par `Apache TinkerPop` de la `Apache Software Foundation`.

Ce notebook montre comment utiliser les LLM pour fournir une interface en langage naturel à la base de données [HugeGraph](https://hugegraph.apache.org/cn/).

## Configuration

Vous devrez avoir une instance HugeGraph en cours d'exécution.
Vous pouvez exécuter un conteneur docker local en exécutant le script suivant :

```bash
docker run \
    --name=graph \
    -itd \
    -p 8080:8080 \
    hugegraph/hugegraph
```

Si nous voulons connecter HugeGraph dans l'application, nous devons installer le SDK python :

```bash
pip3 install hugegraph-python
```

Si vous utilisez le conteneur docker, vous devez attendre quelques secondes pour que la base de données démarre, puis nous devons créer un schéma et écrire des données de graphe pour la base de données.

```python
from hugegraph.connection import PyHugeGraph

client = PyHugeGraph("localhost", "8080", user="admin", pwd="admin", graph="hugegraph")
```

Tout d'abord, nous créons le schéma pour une simple base de données de films :

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

Ensuite, nous pouvons insérer quelques données.

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

## Création de `HugeGraphQAChain`

Nous pouvons maintenant créer `HugeGraph` et `HugeGraphQAChain`. Pour créer `HugeGraph`, nous devons simplement passer l'objet de base de données au constructeur `HugeGraph`.

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

## Rafraîchir les informations du schéma du graphe

Si le schéma de la base de données change, vous pouvez rafraîchir les informations de schéma nécessaires pour générer les instructions Gremlin.

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

## Interroger le graphe

Nous pouvons maintenant utiliser la chaîne de QA du graphe Gremlin pour poser des questions sur le graphe

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
