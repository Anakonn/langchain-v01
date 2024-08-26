---
translated: true
---

# Azure Cosmos DB para Apache Gremlin

>[Azure Cosmos DB para Apache Gremlin](https://learn.microsoft.com/en-us/azure/cosmos-db/gremlin/introduction) es un servicio de base de datos de gráficos que se puede utilizar para almacenar gráficos masivos con miles de millones de vértices y aristas. Puede consultar los gráficos con una latencia de milisegundos y evolucionar fácilmente la estructura del gráfico.

>[Gremlin](https://en.wikipedia.org/wiki/Gremlin_(query_language)) es un lenguaje de recorrido de gráficos y una máquina virtual desarrollada por `Apache TinkerPop` de la `Fundación Apache`.

Este cuaderno muestra cómo usar LLM para proporcionar una interfaz de lenguaje natural a una base de datos de gráficos que se puede consultar con el lenguaje de consulta `Gremlin`.

## Configuración

Instalar una biblioteca:

```python
!pip3 install gremlinpython
```

Necesitará una instancia de base de datos de gráficos de Azure CosmosDB. Una opción es crear una [instancia de base de datos de gráficos de CosmosDB gratuita en Azure](https://learn.microsoft.com/en-us/azure/cosmos-db/free-tier).

Cuando cree su cuenta y gráfico de Cosmos DB, use `/type` como clave de partición.

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

## Sembrar la base de datos

Suponiendo que su base de datos esté vacía, puede poblarla usando los GraphDocuments

Para Gremlin, siempre agregue una propiedad llamada 'label' para cada Nodo.
Si no se establece ninguna etiqueta, se usa Node.type como etiqueta.
Para cosmos, usar identificadores naturales tiene sentido, ya que son visibles en el explorador de gráficos.

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

## Actualizar la información del esquema del gráfico

Si el esquema de la base de datos cambia (después de las actualizaciones), puede actualizar la información del esquema.

```python
graph.refresh_schema()
```

```python
print(graph.schema)
```

## Consultar el gráfico

Ahora podemos usar la cadena de preguntas y respuestas de Gremlin para hacer preguntas sobre el gráfico

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
