---
translated: true
---

# rag-self-query

このテンプレートは、self-query 検索手法を使用して RAG を実行します。主な考え方は、LLM に非構造化クエリを構造化クエリに変換させることです。詳細については、[ドキュメントをご覧ください](https://python.langchain.com/docs/modules/data_connection/retrievers/self_query)。

## 環境設定

このテンプレートでは、OpenAI モデルと Elasticsearch ベクトルストアを使用しますが、このアプローチは他の LLM/ChatModels と[さまざまなベクトルストア](https://python.langchain.com/docs/integrations/retrievers/self_query/)にも一般化できます。

OpenAI モデルにアクセスするには、`OPENAI_API_KEY` 環境変数を設定する必要があります。

Elasticsearch インスタンスに接続するには、以下の環境変数を使用してください:

```bash
export ELASTIC_CLOUD_ID = <ClOUD_ID>
export ELASTIC_USERNAME = <ClOUD_USERNAME>
export ELASTIC_PASSWORD = <ClOUD_PASSWORD>
```

Docker を使ったローカル開発の場合は、以下を使用してください:

```bash
export ES_URL = "http://localhost:9200"
docker run -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "xpack.security.http.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.9.0
```

## 使用方法

このパッケージを使用するには、まず LangChain CLI をインストールする必要があります:

```shell
pip install -U "langchain-cli[serve]"
```

新しい LangChain プロジェクトを作成し、このパッケージのみをインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-self-query
```

既存のプロジェクトに追加する場合は、以下を実行してください:

```shell
langchain app add rag-self-query
```

そして、`server.py` ファイルに以下のコードを追加してください:

```python
from rag_self_query import chain

add_routes(app, chain, path="/rag-elasticsearch")
```

サンプルデータをベクトルストアに入力するには、ディレクトリのルートから以下を実行してください:

```bash
python ingest.py
```

(オプション) LangSmith を設定しましょう。
LangSmith は、LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。
LangSmith に登録するには[こちら](https://smith.langchain.com/)からサインアップできます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のコマンドで直接 LangServe インスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPI アプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドは[http://127.0.0.1:8000/rag-elasticsearch/playground](http://127.0.0.1:8000/rag-elasticsearch/playground)からアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-self-query")
```
