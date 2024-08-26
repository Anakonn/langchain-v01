---
translated: true
---

# Diffbot

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/graph/diffbot_graphtransformer.ipynb)

>[Diffbot](https://docs.diffbot.com/docs/getting-started-with-diffbot) は、ウェブデータを簡単に統合および調査できるプロダクトのスイートです。
>
>[Diffbot Knowledge Graph](https://docs.diffbot.com/docs/getting-started-with-diffbot-knowledge-graph) は、公開ウェブの自動更新グラフデータベースです。

## ユースケース

テキストデータには、さまざまな分析、レコメンデーションエンジン、知識管理アプリケーションに使用される豊富な関係性と洞察が含まれています。

`Diffbot's NLP API` を使うと、構造化されていないテキストデータから、エンティティ、関係性、意味的な意味を抽出できます。

`Diffbot's NLP API` と `Neo4j` (グラフデータベース) を組み合わせることで、テキストから抽出した情報に基づいて、強力で動的なグラフ構造を作成できます。これらのグラフ構造は完全に問い合わせ可能で、さまざまなアプリケーションに統合できます。

この組み合わせにより、以下のようなユースケースが可能になります:

* テキスト文書、ウェブサイト、ソーシャルメディアフィードからナレッジグラフを構築する。
* データ内の意味的関係に基づいてレコメンデーションを生成する。
* エンティティ間の関係を理解する高度な検索機能を構築する。
* データ内の隠れた関係を探索できるアナリティクスダッシュボードを構築する。

## 概要

LangChain は、グラフデータベースとやり取りするためのツールを提供しています:

1. グラフトランスフォーマーとストアの統合を使用して、テキストからナレッジグラフを構築する
2. クエリ作成と実行のチェーンを使用してグラフデータベースを問い合わせる
3. ロバストで柔軟な問い合わせのためのエージェントを使用してグラフデータベースと対話する

## 設定

まず、必要なパッケージをインストールし、環境変数を設定します:

```python
%pip install --upgrade --quiet  langchain langchain-experimental langchain-openai neo4j wikipedia
```

### Diffbot NLP サービス

`Diffbot's NLP` サービスは、構造化されていないテキストデータからエンティティ、関係性、意味的コンテキストを抽出するためのツールです。
抽出された情報を使用して、ナレッジグラフを構築できます。
このサービスを使用するには、[Diffbot](https://www.diffbot.com/products/natural-language/) から API キーを取得する必要があります。

```python
from langchain_experimental.graph_transformers.diffbot import DiffbotGraphTransformer

diffbot_api_key = "DIFFBOT_API_KEY"
diffbot_nlp = DiffbotGraphTransformer(diffbot_api_key=diffbot_api_key)
```

このコードは "Warren Buffett" に関するウィキペディア記事を取得し、`DiffbotGraphTransformer` を使ってエンティティと関係性を抽出します。
`DiffbotGraphTransformer` は構造化されたデータ `GraphDocument` を出力し、これを使ってグラフデータベースを入力できます。
Diffbot の [API リクエストの文字数制限](https://docs.diffbot.com/reference/introduction-to-natural-language-api) のため、テキストのチャンク化は避けられます。

```python
from langchain_community.document_loaders import WikipediaLoader

query = "Warren Buffett"
raw_documents = WikipediaLoader(query=query).load()
graph_documents = diffbot_nlp.convert_to_graph_documents(raw_documents)
```

## ナレッジグラフへのデータ読み込み

稼働中の Neo4j インスタンスが必要です。オプションの1つは、[Aura クラウドサービスの無料 Neo4j データベースインスタンス](https://neo4j.com/cloud/platform/aura-graph-database/)を作成することです。また、[Neo4j Desktop アプリケーション](https://neo4j.com/download/)を使ってローカルで実行したり、Dockerコンテナを実行したりすることもできます。以下のスクリプトを実行してローカルのDockerコンテナを実行できます:

```bash
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -e NEO4J_AUTH=neo4j/pleaseletmein \
    -e NEO4J_PLUGINS=\[\"apoc\"\]  \
    neo4j:latest
```

Dockerコンテナを使用する場合は、データベースの起動に数秒かかるので待つ必要があります。

```python
from langchain_community.graphs import Neo4jGraph

url = "bolt://localhost:7687"
username = "neo4j"
password = "pleaseletmein"

graph = Neo4jGraph(url=url, username=username, password=password)
```

`GraphDocuments` は `add_graph_documents` メソッドを使ってナレッジグラフに読み込めます。

```python
graph.add_graph_documents(graph_documents)
```

## グラフスキーマ情報の更新

データベースのスキーマが変更された場合は、Cypher ステートメントを生成するために必要なスキーマ情報を更新できます。

```python
graph.refresh_schema()
```

## グラフの問い合わせ

グラフに対する質問には、グラフ Cypher QA チェーンを使用できます。最高の体験を得るには、**gpt-4** を使ってCypherクエリを構築することをお勧めします。

```python
from langchain.chains import GraphCypherQAChain
from langchain_openai import ChatOpenAI

chain = GraphCypherQAChain.from_llm(
    cypher_llm=ChatOpenAI(temperature=0, model_name="gpt-4"),
    qa_llm=ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
)
```

```python
chain.run("Which university did Warren Buffett attend?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person {name: "Warren Buffett"})-[:EDUCATED_AT]->(o:Organization)
RETURN o.name[0m
Full Context:
[32;1m[1;3m[{'o.name': 'New York Institute of Finance'}, {'o.name': 'Alice Deal Junior High School'}, {'o.name': 'Woodrow Wilson High School'}, {'o.name': 'University of Nebraska'}][0m

[1m> Finished chain.[0m
```

```output
'Warren Buffett attended the University of Nebraska.'
```

```python
chain.run("Who is or was working at Berkshire Hathaway?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[r:EMPLOYEE_OR_MEMBER_OF]->(o:Organization) WHERE o.name = 'Berkshire Hathaway' RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Charlie Munger'}, {'p.name': 'Oliver Chace'}, {'p.name': 'Howard Buffett'}, {'p.name': 'Howard'}, {'p.name': 'Susan Buffett'}, {'p.name': 'Warren Buffett'}][0m

[1m> Finished chain.[0m
```

```output
'Charlie Munger, Oliver Chace, Howard Buffett, Susan Buffett, and Warren Buffett are or were working at Berkshire Hathaway.'
```
