---
translated: true
---

# rag-matching-engine

このテンプレートは、Google Cloud Platform の Vertex AI のマッチングエンジンを使用して RAG を実行します。

以前に作成したインデックスを利用して、ユーザーが提供した質問に基づいて関連するドキュメントやコンテキストを取得します。

## 環境設定

コードを実行する前に、インデックスを作成する必要があります。

このインデックスの作成プロセスは[こちら](https://github.com/GoogleCloudPlatform/generative-ai/blob/main/language/use-cases/document-qa/question_answering_documents_langchain_matching_engine.ipynb)にあります。

Vertex の環境変数を設定する必要があります:

```text
PROJECT_ID
ME_REGION
GCS_BUCKET
ME_INDEX_ID
ME_ENDPOINT_ID
```

## 使用方法

このパッケージを使用するには、LangChain CLI をインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package rag-matching-engine
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add rag-matching-engine
```

そして、`server.py` ファイルに次のコードを追加します:

```python
from rag_matching_engine import chain as rag_matching_engine_chain

add_routes(app, rag_matching_engine_chain, path="/rag-matching-engine")
```

(オプション) LangSmith を設定しましょう。
LangSmith は、LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。
LangSmith に登録するには[こちら](https://smith.langchain.com/)から行えます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、次のように直接 LangServe インスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPI アプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドは[http://127.0.0.1:8000/rag-matching-engine/playground](http://127.0.0.1:8000/rag-matching-engine/playground)でアクセスできます。

コードからテンプレートにアクセスするには、次のように実行します:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-matching-engine")
```

テンプレートの詳細な接続方法については、Jupyter ノートブック `rag_matching_engine` を参照してください。
