---
translated: true
---

# neo4j-vector-memory

このテンプレートを使うと、LLMをNeo4jのベクトルストアを使ったベクトルベースの検索システムと統合できます。
さらに、Neo4jデータベースのグラフ機能を使って、特定のユーザーセッションの対話履歴を保存および取得することができます。
対話履歴をグラフとして保存することで、シームレスな会話フローが可能になるだけでなく、ユーザー行動やテキストチャンクの取得をグラフ分析で調べることもできます。

## 環境設定

以下の環境変数を定義する必要があります。

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## データの入力

`dune.txt`ファイルからテキストの一部を取り込み、Neo4jグラフデータベースに保存するには、`python ingest.py`を実行できます。
また、これらの埋め込みを効率的に検索するためのベクトルインデックス`dune`も作成されます。

## 使用方法

このパッケージを使うには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、このパッケージのみをインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package neo4j-vector-memory
```

既存のプロジェクトに追加する場合は、以下のように実行します:

```shell
langchain app add neo4j-vector-memory
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from neo4j_vector_memory import chain as neo4j_vector_memory_chain

add_routes(app, neo4j_vector_memory_chain, path="/neo4j-vector-memory")
```

(オプション) LangSmithを設定しましょう。
LangSmithを使うと、LangChainアプリケーションのトレース、モニタリング、デバッグができます。
[ここ](https://smith.langchain.com/)からLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のコマンドでLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000)でローカルサーバーが起動します。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートを確認できます。
[http://127.0.0.1:8000/neo4j-vector-memory/playground](http://127.0.0.1:8000/neo4j-parent/playground)でPlaygroundにアクセスできます。

コードからテンプレートを使うには以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-vector-memory")
```
