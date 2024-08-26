---
translated: true
---

# neo4j_cypher

このテンプレートを使うと、OpenAI LLMを使って自然言語でNeo4jグラフデータベースと対話できます。

自然言語の質問をCypherクエリ(Neo4jデータベースからデータを取得するために使用)に変換し、クエリを実行し、クエリの結果に基づいて自然言語の応答を提供します。

[](https://medium.com/neo4j/langchain-cypher-search-tips-tricks-f7c9e9abca4d)

## 環境設定

以下の環境変数を定義してください:

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## Neo4jデータベースのセットアップ

Neo4jデータベースを設定する方法はいくつかあります。

### Neo4j Aura

Neo4j AuraDBは完全に管理されたクラウドグラフデータベースサービスです。
[Neo4j Aura](https://neo4j.com/cloud/platform/aura-graph-database?utm_source=langchain&utm_content=langserve)で無料のインスタンスを作成してください。
無料のデータベースインスタンスを開始すると、データベースにアクセスするための資格情報が提供されます。

## データの入力

サンプルのムービーデータでデータベースを入力したい場合は、`python ingest.py`を実行できます。
このスクリプトはデータベースにサンプルのムービーデータを入力します。

## 使用方法

このパッケージを使用するには、まずLangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package neo4j-cypher
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add neo4j-cypher
```

そして、`server.py`ファイルに次のコードを追加してください:

```python
from neo4j_cypher import chain as neo4j_cypher_chain

add_routes(app, neo4j_cypher_chain, path="/neo4j-cypher")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[ここ](https://smith.langchain.com/)でLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、次のようにしてLangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、
[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/neo4j_cypher/playground](http://127.0.0.1:8000/neo4j_cypher/playground)でPlaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-cypher")
```
