---
translated: true
---

# HugeGraph

>[HugeGraph](https://hugegraph.apache.org/)は、`Apache TinkerPop3`フレームワークと`Gremlin`クエリ言語に対応した、便利で効率的で柔軟なグラフデータベースです。
>
>[Gremlin](https://en.wikipedia.org/wiki/Gremlin_(query_language))は、`Apache Software Foundation`の`Apache TinkerPop`によって開発されたグラフトラバーサル言語とバーチャルマシンです。

このノートブックでは、[HugeGraph](https://hugegraph.apache.org/cn/)データベースに自然言語インターフェイスを提供するLLMの使用方法を示します。

## 設定

HugeGraphのインスタンスを実行する必要があります。
次のスクリプトを実行してローカルのDockerコンテナを実行できます:

```bash
docker run \
    --name=graph \
    -itd \
    -p 8080:8080 \
    hugegraph/hugegraph
```

アプリケーションでHugeGraphに接続するには、Pythonのsdkをインストールする必要があります:

```bash
pip3 install hugegraph-python
```

Dockerコンテナを使用している場合は、データベースの起動に数秒かかるので、その後にスキーマを作成し、データベースにグラフデータを書き込む必要があります。

```python
from hugegraph.connection import PyHugeGraph

client = PyHugeGraph("localhost", "8080", user="admin", pwd="admin", graph="hugegraph")
```

まず、簡単な映画データベースのスキーマを作成します:

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

次にデータを挿入します。

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

## `HugeGraphQAChain`の作成

`HugeGraph`と`HugeGraphQAChain`を作成できます。`HugeGraph`を作成するには、データベースオブジェクトを`HugeGraph`コンストラクタに渡すだけです。

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

## グラフスキーマ情報の更新

データベースのスキーマが変更された場合は、Gremlinステートメントを生成するために必要なスキーマ情報を更新できます。

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

## グラフのクエリ

グラフのGremlinQAチェーンを使用して、グラフに質問することができます。

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
