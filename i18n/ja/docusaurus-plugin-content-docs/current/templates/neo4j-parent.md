---
translated: true
---

# neo4j-parent

このテンプレートを使うと、文書を小さな塊に分割し、元の文書または大きな文書の情報を取得することで、正確な埋め込みとコンテキストの保持のバランスを取ることができます。

Neo4jのベクトルインデックスを使って、このパッケージはベクトル類似性検索を使ってチャイルドノードをクエリし、適切な `retrieval_query` パラメーターを定義することで対応する親のテキストを取得します。

## 環境設定

以下の環境変数を定義する必要があります。

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## データの入力

サンプルデータを入力したい場合は、`python ingest.py` を実行できます。
このスクリプトは、`dune.txt` ファイルからテキストの各セクションを処理し、Neo4jグラフデータベースに格納します。
まず、テキストを大きな塊("親")に分割し、さらにそれらを重複を持つ小さな塊("子")に細分化します。これにより、コンテキストを維持できます。
これらの塊をデータベースに格納した後、OpenAIの埋め込みを使ってチャイルドノードの埋め込みを計算し、グラフに格納します。
さらに、これらの埋め込みを効率的にクエリするためのベクトルインデックス `retrieval` が作成されます。

## 使用方法

このパッケージを使うには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package neo4j-parent
```

既存のプロジェクトに追加する場合は、以下を実行します:

```shell
langchain app add neo4j-parent
```

そして、`server.py` ファイルに以下のコードを追加します:

```python
from neo4j_parent import chain as neo4j_parent_chain

add_routes(app, neo4j_parent_chain, path="/neo4j-parent")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[こちら](https://smith.langchain.com/)からLangSmithに登録できます。
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

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドは[http://127.0.0.1:8000/neo4j-parent/playground](http://127.0.0.1:8000/neo4j-parent/playground)でアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-parent")
```
