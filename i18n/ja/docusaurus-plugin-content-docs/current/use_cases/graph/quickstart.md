---
sidebar_position: 0
translated: true
---

# クイックスタート

このガイドでは、グラフデータベース上でQ&Aチェーンを作成する基本的な方法について説明します。これらのシステムを使うと、グラフデータベースのデータについて質問し、自然言語で回答を得ることができます。

## ⚠️ セキュリティに関する注意 ⚠️

グラフデータベースのQ&Aシステムを構築するには、モデル生成のグラフクエリを実行する必要があります。これには固有のリスクがあります。データベース接続権限は常にチェーン/エージェントのニーズに合わせて可能な限り狭い範囲に制限してください。これにより、モデルドリブンシステムを構築するリスクを軽減することができます。一般的なセキュリティのベストプラクティスについては、[こちら](/docs/security)を参照してください。

## アーキテクチャ

一般的なグラフチェーンのステップは以下の通りです:

1. **質問をグラフデータベースクエリに変換**: モデルがユーザーの入力をグラフデータベースクエリ(Cypherなど)に変換します。
2. **グラフデータベースクエリの実行**: グラフデータベースクエリを実行します。
3. **質問に回答**: クエリ結果を使ってユーザーの入力に回答します。

![sql_usecase.png](../../../../../../static/img/graph_usecase.png)

## セットアップ

まず、必要なパッケージをインストールし、環境変数を設定します。
この例では、Neo4jグラフデータベースを使用します。

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai neo4j
```

このガイドではデフォルトでOpenAIモデルを使用します。

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

次に、Neo4jの資格情報を定義する必要があります。
[これらのインストール手順](https://neo4j.com/docs/operations-manual/current/installation/)に従ってNeo4jデータベースをセットアップしてください。

```python
os.environ["NEO4J_URI"] = "bolt://localhost:7687"
os.environ["NEO4J_USERNAME"] = "neo4j"
os.environ["NEO4J_PASSWORD"] = "password"
```

以下の例では、Neo4jデータベースに接続し、映画とその出演者に関する例データを入力します。

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

## グラフスキーマ

LLMがCypherステートメントを生成できるようにするには、グラフスキーマに関する情報が必要です。グラフオブジェクトをインスタンス化すると、グラフスキーマに関する情報が取得されます。後でグラフに変更を加えた場合は、`refresh_schema`メソッドを実行してスキーマ情報を更新できます。

```python
graph.refresh_schema()
print(graph.schema)
```

```output
Node properties are the following:
Movie {imdbRating: FLOAT, id: STRING, released: DATE, title: STRING},Person {name: STRING},Genre {name: STRING},Chunk {id: STRING, question: STRING, query: STRING, text: STRING, embedding: LIST}
Relationship properties are the following:

The relationships are the following:
(:Movie)-[:IN_GENRE]->(:Genre),(:Person)-[:DIRECTED]->(:Movie),(:Person)-[:ACTED_IN]->(:Movie)
```

よし、クエリできるグラフデータベースができました。さっそくLLMと連携してみましょう。

## チェーン

質問を受け取り、それをCypherクエリに変換し、クエリを実行して、その結果を使って元の質問に回答するシンプルなチェーンを使ってみましょう。

![graph_chain.webp](../../../../../../static/img/graph_chain.webp)

LangChainには、この作業フローに合わせて設計されたNeo4j用の組み込みチェーンがあります: [GraphCypherQAChain](/docs/integrations/graphs/neo4j_cypher)

```python
from langchain.chains import GraphCypherQAChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = GraphCypherQAChain.from_llm(graph=graph, llm=llm, verbose=True)
response = chain.invoke({"query": "What was the cast of the Casino?"})
response
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (:Movie {title: "Casino"})<-[:ACTED_IN]-(actor:Person)
RETURN actor.name[0m
Full Context:
[32;1m[1;3m[{'actor.name': 'Joe Pesci'}, {'actor.name': 'Robert De Niro'}, {'actor.name': 'Sharon Stone'}, {'actor.name': 'James Woods'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'What was the cast of the Casino?',
 'result': 'The cast of Casino included Joe Pesci, Robert De Niro, Sharon Stone, and James Woods.'}
```

# 関係性の方向性の検証

LLMは生成したCypherステートメントの関係性の方向性を扱うのが難しい場合があります。グラフスキーマが事前に定義されているため、`validate_cypher`パラメーターを使って生成されたCypherステートメントの関係性の方向性を検証し、必要に応じて修正することができます。

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph, llm=llm, verbose=True, validate_cypher=True
)
response = chain.invoke({"query": "What was the cast of the Casino?"})
response
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (:Movie {title: "Casino"})<-[:ACTED_IN]-(actor:Person)
RETURN actor.name[0m
Full Context:
[32;1m[1;3m[{'actor.name': 'Joe Pesci'}, {'actor.name': 'Robert De Niro'}, {'actor.name': 'Sharon Stone'}, {'actor.name': 'James Woods'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'What was the cast of the Casino?',
 'result': 'The cast of Casino included Joe Pesci, Robert De Niro, Sharon Stone, and James Woods.'}
```

### 次のステップ

より複雑なクエリ生成には、few-shotプロンプトの作成やクエリチェックのステップの追加が必要になる可能性があります。このような高度な手法については、以下のドキュメントを参照してください:

* [プロンプティング戦略](/docs/use_cases/graph/prompting): 高度なプロンプトエンジニアリングの手法
* [値のマッピング](/docs/use_cases/graph/mapping): 質問から値をデータベースにマッピングする手法
* [セマンティックレイヤー](/docs/use_cases/graph/semantic): セマンティックレイヤーの実装手法
* [グラフの構築](/docs/use_cases/graph/constructing): ナレッジグラフの構築手法
