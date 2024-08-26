---
translated: true
---

# rag-elasticsearch

このテンプレートは[Elasticsearch](https://python.langchain.com/docs/integrations/vectorstores/elasticsearch)を使用してRAGを実行します。

文章変換器`MiniLM-L6-v2`を使用して段落と質問の埋め込みを行っています。

## 環境設定

OpenAIモデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定してください。

Elasticsearchインスタンスに接続するには、以下の環境変数を使用してください:

```bash
export ELASTIC_CLOUD_ID = <ClOUD_ID>
export ELASTIC_USERNAME = <ClOUD_USERNAME>
export ELASTIC_PASSWORD = <ClOUD_PASSWORD>
```

ローカル開発でDockerを使用する場合は、以下のようにします:

```bash
export ES_URL="http://localhost:9200"
```

そして、Dockerでのみ、Elasticsearchインスタンスを実行します:

```bash
docker run -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "xpack.security.http.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.9.0
```

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-elasticsearch
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add rag-elasticsearch
```

そして、`server.py`ファイルに以下のコードを追加してください:

```python
from rag_elasticsearch import chain as rag_elasticsearch_chain

add_routes(app, rag_elasticsearch_chain, path="/rag-elasticsearch")
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

このディレクトリ内にいる場合は、以下のようにしてLangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000)でローカルサーバーが起動します。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-elasticsearch/playground](http://127.0.0.1:8000/rag-elasticsearch/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-elasticsearch")
```

架空の職場文書をロードするには、このリポジトリのルートから以下のコマンドを実行してください:

```bash
python ingest.py
```

ただし、[ここ](https://python.langchain.com/docs/integrations/document_loaders)から多数のドキュメントローダーを選択できます。
