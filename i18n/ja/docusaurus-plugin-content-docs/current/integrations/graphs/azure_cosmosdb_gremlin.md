---
translated: true
---

# Azure Cosmos DB for Apache Gremlin

>[Azure Cosmos DB for Apache Gremlin](https://learn.microsoft.com/en-us/azure/cosmos-db/gremlin/introduction)は、数十億のバーテックスとエッジを持つ巨大なグラフを保存できるグラフデータベースサービスです。ミリ秒単位の待ち時間でグラフをクエリでき、グラフ構造を簡単に進化させることができます。
>
>[Gremlin](https://en.wikipedia.org/wiki/Gremlin_(query_language))は、`Apache Software Foundation`の`Apache TinkerPop`によって開発されたグラフトラバーサル言語とバーチャルマシンです。

このノートブックでは、`Gremlin`クエリ言語を使ってグラフデータベースをクエリできる自然言語インターフェイスを提供するLLMの使用方法を示します。

## 設定

ライブラリをインストールします:

```python
!pip3 install gremlinpython
```

Azure CosmosDB Graphデータベースインスタンスが必要です。オプションの1つは、[Azure上で無料のCosmosDB Graphデータベースインスタンスを作成する](https://learn.microsoft.com/en-us/azure/cosmos-db/free-tier)ことです。

Cosmos DBアカウントとGraphを作成する際は、`/type`をパーティションキーとして使用してください。

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

## データベースへの投入

データベースが空の場合、GraphDocumentsを使ってデータを入力できます。

Gremlinの場合、各ノードに'label'というプロパティを必ず追加してください。
ラベルが設定されていない場合は、Node.typeがラベルとして使用されます。
Cosmosでは自然なIDを使うのが適切です。それらはグラフエクスプローラーで表示されます。

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

## グラフスキーマ情報の更新

データベースのスキーマが変更された場合(更新後)、スキーマ情報を更新できます。

```python
graph.refresh_schema()
```

```python
print(graph.schema)
```

## グラフのクエリ

Gremlin QAチェーンを使ってグラフに質問することができます。

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
