---
translated: true
---

# rag-opensearch

このテンプレートは[OpenSearch](https://python.langchain.com/docs/integrations/vectorstores/opensearch)を使用してRAGを実行します。

## 環境設定

以下の環境変数を設定してください。

- `OPENAI_API_KEY` - OpenAI Embeddingsとモデルにアクセスするために使用します。

オプションで、デフォルト以外のOpenSearchの設定も行ってください:

- `OPENSEARCH_URL` - ホストされているOpenSearchインスタンスのURL
- `OPENSEARCH_USERNAME` - OpenSearchインスタンスのユーザー名
- `OPENSEARCH_PASSWORD` - OpenSearchインスタンスのパスワード
- `OPENSEARCH_INDEX_NAME` - インデックス名

デフォルトのOpenSeachインスタンスをDockerで実行するには、以下のコマンドを使用できます。

```shell
docker run -p 9200:9200 -p 9600:9600 -e "discovery.type=single-node" --name opensearch-node -d opensearchproject/opensearch:latest
```

注意: `langchain-test`という名前のダミーインデックスにダミーのドキュメントを読み込むには、パッケージ内で`python dummy_index_setup.py`を実行してください。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、このパッケージのみをインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-opensearch
```

既存のプロジェクトにこのパッケージを追加する場合は、以下のように実行できます:

```shell
langchain app add rag-opensearch
```

そして、`server.py`ファイルに以下のコードを追加してください:

```python
from rag_opensearch import chain as rag_opensearch_chain

add_routes(app, rag_opensearch_chain, path="/rag-opensearch")
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

このディレクトリ内にいる場合は、以下のコマンドでLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-opensearch/playground](http://127.0.0.1:8000/rag-opensearch/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-opensearch")
```
