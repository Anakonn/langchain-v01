---
translated: true
---

# cassandra-synonym-caching

このテンプレートは、Apache Cassandra®またはAstra DBを介したCQLによるLLMキャッシングの使用法を示す簡単なチェーンテンプレートを提供します。

## 環境設定

環境を設定するには、以下が必要です:

- [Astra](https://astra.datastax.com) Vector Database (無料のティアでも可!)。 **[Database Administrator token](https://awesome-astra.github.io/docs/pages/astra/create-token/#c-procedure)** が必要で、特に `AstraCS:...` で始まる文字列。
- [Database ID](https://awesome-astra.github.io/docs/pages/astra/faq/#where-should-i-find-a-database-identifier) も準備しておく必要があります。
- **OpenAI API Key**。 (詳細は[こちら](https://cassio.org/start_here/#llm-access)を参照してください。このデモはデフォルトでOpenAIをサポートしていますが、コードを変更すれば他のものも使えます。)

_注意:_ 通常のCassandraクラスターを使用することもできます。その場合は、`.env.template`に示されている `USE_CASSANDRA_CLUSTER` エントリと、接続に必要な環境変数を提供する必要があります。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package cassandra-synonym-caching
```

既存のプロジェクトに追加する場合は、以下のように実行します:

```shell
langchain app add cassandra-synonym-caching
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from cassandra_synonym_caching import chain as cassandra_synonym_caching_chain

add_routes(app, cassandra_synonym_caching_chain, path="/cassandra-synonym-caching")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[こちら](https://smith.langchain.com/)からサインアップできます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のようにして直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/cassandra-synonym-caching/playground](http://127.0.0.1:8000/cassandra-synonym-caching/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/cassandra-synonym-caching")
```

## 参考

スタンドアロンのLangServeテンプレートリポジトリ: [こちら](https://github.com/hemidactylus/langserve_cassandra_synonym_caching)。
