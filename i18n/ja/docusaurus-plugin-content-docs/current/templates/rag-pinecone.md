---
translated: true
---

# rag-pinecone

このテンプレートは、Pinecone と OpenAI を使用して RAG を実行します。

## 環境設定

このテンプレートは Pinecone をベクトルストアとして使用し、`PINECONE_API_KEY`、`PINECONE_ENVIRONMENT`、`PINECONE_INDEX` が設定されている必要があります。

OpenAI モデルにアクセスするには、`OPENAI_API_KEY` 環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、まず LangChain CLI がインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-pinecone
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add rag-pinecone
```

そして、`server.py` ファイルに以下のコードを追加します:

```python
from rag_pinecone import chain as rag_pinecone_chain

add_routes(app, rag_pinecone_chain, path="/rag-pinecone")
```

(オプション) LangSmith を設定しましょう。
LangSmith は、LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。
[こちら](https://smith.langchain.com/)から LangSmith に登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のように直接 LangServe インスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPI アプリが起動し、ローカルの [http://localhost:8000](http://localhost:8000) でサーバーが実行されます。

すべてのテンプレートは [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) で確認できます。
[http://127.0.0.1:8000/rag-pinecone/playground](http://127.0.0.1:8000/rag-pinecone/playground) でプレイグラウンドにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-pinecone")
```
