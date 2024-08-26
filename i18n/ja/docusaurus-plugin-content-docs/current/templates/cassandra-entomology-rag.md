---
translated: true
---

# cassandra-entomology-rag

このテンプレートは、Apache Cassandra®またはAstra DBを通じてCQL(`Cassandra`ベクトルストアクラス)を使ってRAGを実行します。

## 環境設定

セットアップには以下が必要です:
- [Astra](https://astra.datastax.com) ベクトルデータベース。[データベース管理者トークン](https://awesome-astra.github.io/docs/pages/astra/create-token/#c-procedure)、具体的には`AstraCS:...`で始まる文字列が必要です。
- [データベースID](https://awesome-astra.github.io/docs/pages/astra/faq/#where-should-i-find-a-database-identifier)。
- **OpenAI APIキー**。(詳細は[こちら](https://cassio.org/start_here/#llm-access)))

通常のCassandraクラスターも使用できます。その場合は、`.env.template`に示されている`USE_CASSANDRA_CLUSTER`エントリと、クラスターに接続するための環境変数を提供する必要があります。

接続パラメーターとシークレットは環境変数で提供する必要があります。必要な変数については`.env.template`を参照してください。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package cassandra-entomology-rag
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add cassandra-entomology-rag
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from cassandra_entomology_rag import chain as cassandra_entomology_rag_chain

add_routes(app, cassandra_entomology_rag_chain, path="/cassandra-entomology-rag")
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

このディレクトリ内にいる場合は、以下のようにLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドは[http://127.0.0.1:8000/cassandra-entomology-rag/playground](http://127.0.0.1:8000/cassandra-entomology-rag/playground)からアクセスできます。

コードからテンプレートにアクセスするには以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/cassandra-entomology-rag")
```

## 参考

LangServeチェーンを含む単独のリポジトリ: [こちら](https://github.com/hemidactylus/langserve_cassandra_entomology_rag)。
