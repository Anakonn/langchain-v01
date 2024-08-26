---
translated: true
---

# NebulaGraph

>[NebulaGraph](https://www.nebula-graph.io/)は、ミリ秒のレイテンシーで超大規模グラフに対応できる、オープンソースの分散型、スケーラブルな高速グラフデータベースです。`nGQL`グラフクエリ言語を使用しています。

>[nGQL](https://docs.nebula-graph.io/3.0.0/3.ngql-guide/1.nGQL-overview/1.overview/)は、`NebulaGraph`のための宣言型グラフクエリ言語です。表現力が豊かで効率的なグラフパターンを可能にします。`nGQL`は開発者とオペレーション専門家の両方を対象としたSQL風のクエリ言語です。

このノートブックでは、LLMを使用して`NebulaGraph`データベースに自然言語インターフェイスを提供する方法を示します。

## 設定

次のスクリプトを実行して、Dockerコンテナ内で`NebulaGraph`クラスターを起動できます:

```bash
curl -fsSL nebula-up.siwei.io/install.sh | bash
```

その他のオプションは以下のとおりです:
- [Docker Desktop Extension](https://www.docker.com/blog/distributed-cloud-native-graph-database-nebulagraph-docker-extension/)としてインストールする。[こちら](https://docs.nebula-graph.io/3.5.0/2.quick-start/1.quick-start-workflow/)を参照
- NebulaGraph Cloud Serviceを利用する。[こちら](https://www.nebula-graph.io/cloud)を参照
- パッケージ、ソースコード、Kubernetesからデプロイする。[こちら](https://docs.nebula-graph.io/)を参照

クラスターが起動したら、データベースの`SPACE`と`SCHEMA`を作成できます。

```python
%pip install --upgrade --quiet  ipython-ngql
%load_ext ngql

# connect ngql jupyter extension to nebulagraph
%ngql --address 127.0.0.1 --port 9669 --user root --password nebula
# create a new space
%ngql CREATE SPACE IF NOT EXISTS langchain(partition_num=1, replica_factor=1, vid_type=fixed_string(128));
```

```python
# Wait for a few seconds for the space to be created.
%ngql USE langchain;
```

完全なデータセットのスキーマ作成については、[こちら](https://www.siwei.io/en/nebulagraph-etl-dbt/)を参照してください。

```python
%%ngql
CREATE TAG IF NOT EXISTS movie(name string);
CREATE TAG IF NOT EXISTS person(name string, birthdate string);
CREATE EDGE IF NOT EXISTS acted_in();
CREATE TAG INDEX IF NOT EXISTS person_index ON person(name(128));
CREATE TAG INDEX IF NOT EXISTS movie_index ON movie(name(128));
```

スキーマ作成が完了したら、データを挿入できます。

```python
%%ngql
INSERT VERTEX person(name, birthdate) VALUES "Al Pacino":("Al Pacino", "1940-04-25");
INSERT VERTEX movie(name) VALUES "The Godfather II":("The Godfather II");
INSERT VERTEX movie(name) VALUES "The Godfather Coda: The Death of Michael Corleone":("The Godfather Coda: The Death of Michael Corleone");
INSERT EDGE acted_in() VALUES "Al Pacino"->"The Godfather II":();
INSERT EDGE acted_in() VALUES "Al Pacino"->"The Godfather Coda: The Death of Michael Corleone":();
```

```python
from langchain.chains import NebulaGraphQAChain
from langchain_community.graphs import NebulaGraph
from langchain_openai import ChatOpenAI
```

```python
graph = NebulaGraph(
    space="langchain",
    username="root",
    password="nebula",
    address="127.0.0.1",
    port=9669,
    session_pool_size=30,
)
```

## グラフスキーマ情報の更新

データベースのスキーマが変更された場合は、nGQLステートメントを生成するために必要なスキーマ情報を更新できます。

```python
# graph.refresh_schema()
```

```python
print(graph.get_schema)
```

```output
Node properties: [{'tag': 'movie', 'properties': [('name', 'string')]}, {'tag': 'person', 'properties': [('name', 'string'), ('birthdate', 'string')]}]
Edge properties: [{'edge': 'acted_in', 'properties': []}]
Relationships: ['(:person)-[:acted_in]->(:movie)']
```

## グラフのクエリ

グラフCypherQAチェーンを使用して、グラフに質問することができます。

```python
chain = NebulaGraphQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```

```python
chain.run("Who played in The Godfather II?")
```

```output


[1m> Entering new NebulaGraphQAChain chain...[0m
Generated nGQL:
[32;1m[1;3mMATCH (p:`person`)-[:acted_in]->(m:`movie`) WHERE m.`movie`.`name` == 'The Godfather II'
RETURN p.`person`.`name`[0m
Full Context:
[32;1m[1;3m{'p.person.name': ['Al Pacino']}[0m

[1m> Finished chain.[0m
```

```output
'Al Pacino played in The Godfather II.'
```
