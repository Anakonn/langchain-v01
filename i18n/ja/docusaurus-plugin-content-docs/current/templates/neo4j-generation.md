---
translated: true
---

# neo4j-generation

このテンプレートは、LLMベースの知識グラフ抽出と、完全に管理されたクラウドグラフデータベースであるNeo4j AuraDBを組み合わせたものです。

[Neo4j Aura](https://neo4j.com/cloud/platform/aura-graph-database?utm_source=langchain&utm_content=langserve)で無料のインスタンスを作成できます。

無料のデータベースインスタンスを開始すると、データベースにアクセスするための資格情報が提供されます。

このテンプレートは柔軟性があり、ユーザーが抽出プロセスを指定するノードラベルとリレーションシップタイプのリストを指定できます。

このパッケージの機能と機能の詳細については、[このブログ記事](https://blog.langchain.dev/constructing-knowledge-graphs-from-text-using-openai-functions/)を参照してください。

## 環境設定

次の環境変数を設定する必要があります:

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## 使用方法

このパッケージを使用するには、LangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package neo4j-generation
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add neo4j-generation
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from neo4j_generation.chain import chain as neo4j_generation_chain

add_routes(app, neo4j_generation_chain, path="/neo4j-generation")
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

このディレクトリ内にいる場合は、次のようにして直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/neo4j-generation/playground](http://127.0.0.1:8000/neo4j-generation/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、次のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-generation")
```
