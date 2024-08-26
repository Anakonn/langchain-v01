---
translated: true
---

# Azure Cosmos DB pour Apache Gremlin

>[Azure Cosmos DB pour Apache Gremlin](https://learn.microsoft.com/en-us/azure/cosmos-db/gremlin/introduction) est un service de base de données de graphes qui peut être utilisé pour stocker des graphes massifs avec des milliards de sommets et d'arêtes. Vous pouvez interroger les graphes avec une latence de l'ordre de la milliseconde et faire évoluer facilement la structure du graphe.
>
>[Gremlin](https://en.wikipedia.org/wiki/Gremlin_(query_language)) est un langage de parcours de graphes et une machine virtuelle développés par `Apache TinkerPop` de la `Fondation Apache`.

Ce notebook montre comment utiliser des LLM pour fournir une interface en langage naturel à une base de données de graphes que vous pouvez interroger avec le langage de requête `Gremlin`.

## Configuration

Installer une bibliothèque :

```python
!pip3 install gremlinpython
```

Vous aurez besoin d'une instance de base de données de graphes Azure CosmosDB. Une option est de créer une [instance de base de données de graphes CosmosDB gratuite dans Azure](https://learn.microsoft.com/en-us/azure/cosmos-db/free-tier).

Lorsque vous créez votre compte Cosmos DB et votre graphe, utilisez `/type` comme clé de partition.

```python
cosmosdb_name = "mycosmosdb"
cosmosdb_db_id = "graphtesting"
cosmosdb_db_graph_id = "mygraph"
cosmosdb_access_Key = "longstring=="
```

```python
import nest_asyncio
from langchain.chains.graph_qa.gremlin import GremlinQAChain
from langchain.schema import Document
from langchain_community.graphs import GremlinGraph
from langchain_community.graphs.graph_document import GraphDocument, Node, Relationship
from langchain_openai import AzureChatOpenAI
```

```python
graph = GremlinGraph(
    url=f"=wss://{cosmosdb_name}.gremlin.cosmos.azure.com:443/",
    username=f"/dbs/{cosmosdb_db_id}/colls/{cosmosdb_db_graph_id}",
    password=cosmosdb_access_Key,
)
```

## Remplissage de la base de données

En supposant que votre base de données est vide, vous pouvez la remplir à l'aide des GraphDocuments

Pour Gremlin, ajoutez toujours une propriété appelée 'label' pour chaque nœud.
Si aucun libellé n'est défini, Node.type est utilisé comme libellé.
Pour Cosmos, l'utilisation d'identifiants naturels a du sens, car ils sont visibles dans l'explorateur de graphes.

```python
source_doc = Document(
    page_content="Matrix is a movie where Keanu Reeves, Laurence Fishburne and Carrie-Anne Moss acted."
)
movie = Node(id="The Matrix", properties={"label": "movie", "title": "The Matrix"})
actor1 = Node(id="Keanu Reeves", properties={"label": "actor", "name": "Keanu Reeves"})
actor2 = Node(
    id="Laurence Fishburne", properties={"label": "actor", "name": "Laurence Fishburne"}
)
actor3 = Node(
    id="Carrie-Anne Moss", properties={"label": "actor", "name": "Carrie-Anne Moss"}
)
rel1 = Relationship(
    id=5, type="ActedIn", source=actor1, target=movie, properties={"label": "ActedIn"}
)
rel2 = Relationship(
    id=6, type="ActedIn", source=actor2, target=movie, properties={"label": "ActedIn"}
)
rel3 = Relationship(
    id=7, type="ActedIn", source=actor3, target=movie, properties={"label": "ActedIn"}
)
rel4 = Relationship(
    id=8,
    type="Starring",
    source=movie,
    target=actor1,
    properties={"label": "Strarring"},
)
rel5 = Relationship(
    id=9,
    type="Starring",
    source=movie,
    target=actor2,
    properties={"label": "Strarring"},
)
rel6 = Relationship(
    id=10,
    type="Straring",
    source=movie,
    target=actor3,
    properties={"label": "Strarring"},
)
graph_doc = GraphDocument(
    nodes=[movie, actor1, actor2, actor3],
    relationships=[rel1, rel2, rel3, rel4, rel5, rel6],
    source=source_doc,
)
```

```python
# The underlying python-gremlin has a problem when running in notebook
# The following line is a workaround to fix the problem
nest_asyncio.apply()

# Add the document to the CosmosDB graph.
graph.add_graph_documents([graph_doc])
```

## Actualiser les informations sur le schéma du graphe

Si le schéma de la base de données change (après des mises à jour), vous pouvez actualiser les informations sur le schéma.

```python
graph.refresh_schema()
```

```python
print(graph.schema)
```

## Interroger le graphe

Nous pouvons maintenant utiliser la chaîne de questions-réponses Gremlin pour poser des questions sur le graphe

```python
chain = GremlinQAChain.from_llm(
    AzureChatOpenAI(
        temperature=0,
        azure_deployment="gpt-4-turbo",
    ),
    graph=graph,
    verbose=True,
)
```

```python
chain.invoke("Who played in The Matrix?")
```

```python
chain.run("How many people played in The Matrix?")
```
