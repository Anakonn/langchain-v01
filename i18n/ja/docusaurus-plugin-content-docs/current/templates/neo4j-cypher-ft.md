---
translated: true
---

# neo4j-cypher-ft

このテンプレートを使うと、OpenAIのLLMを活用して、自然言語でNeo4jグラフデータベースと対話することができます。

主な機能は、自然言語の質問をCypherクエリ(Neo4jデータベースを照会するために使用される言語)に変換し、これらのクエリを実行し、クエリの結果に基づいて自然言語の回答を提供することです。

このパッケージは、テキスト値をデータベースエントリにマッピングするための高速なフルテキストインデックスを利用することで、正確なCypherステートメントの生成を強化しています。

提供されている例では、フルテキストインデックスを使用して、ユーザーのクエリからの人物名とムービー名をデータベースエントリにマッピングしています。

## 環境設定

以下の環境変数を設定する必要があります:

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

また、サンプルデータでデータベースを埋めたい場合は、`python ingest.py`を実行できます。
このスクリプトは、サンプルのムービーデータをデータベースに入力し、Cypherステートメントの正確な生成に使用される`entity`という名前のフルテキストインデックスを作成します。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package neo4j-cypher-ft
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add neo4j-cypher-ft
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from neo4j_cypher_ft import chain as neo4j_cypher_ft_chain

add_routes(app, neo4j_cypher_ft_chain, path="/neo4j-cypher-ft")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[ここ](https://smith.langchain.com/)からLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、次のように直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000)でローカルサーバーが起動します。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/neo4j-cypher-ft/playground](http://127.0.0.1:8000/neo4j-cypher-ft/playground)からPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、次のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-cypher-ft")
```
