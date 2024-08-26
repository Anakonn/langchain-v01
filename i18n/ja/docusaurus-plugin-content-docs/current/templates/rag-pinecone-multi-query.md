---
translated: true
---

# rag-pinecone-multi-query

このテンプレートは、Pinecone と OpenAI を使用して RAG を実行し、マルチクエリリトリーバーを使用します。

ユーザーの入力クエリに基づいて、LLM が異なる視点からの複数のクエリを生成します。

各クエリについて、関連するドキュメントのセットを取得し、回答合成のためにすべてのクエリにわたる一意の結合を取ります。

## 環境設定

このテンプレートは Pinecone をベクトルストアとして使用し、`PINECONE_API_KEY`、`PINECONE_ENVIRONMENT`、`PINECONE_INDEX` を設定する必要があります。

OpenAI モデルにアクセスするには、`OPENAI_API_KEY` 環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、まず LangChain CLI をインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、このパッケージをインストールするには、次のように実行します:

```shell
langchain app new my-app --package rag-pinecone-multi-query
```

既存のプロジェクトにこのパッケージを追加するには、次のように実行します:

```shell
langchain app add rag-pinecone-multi-query
```

そして、`server.py` ファイルに次のコードを追加します:

```python
from rag_pinecone_multi_query import chain as rag_pinecone_multi_query_chain

add_routes(app, rag_pinecone_multi_query_chain, path="/rag-pinecone-multi-query")
```

(オプション) 次に、LangSmith を設定しましょう。LangSmith は、LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。[ここ](https://smith.langchain.com/)から LangSmith に登録できます。アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、次のように直接 LangServe インスタンスを起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000) でローカルサーバーが起動します。

すべてのテンプレートは [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) で確認できます。
[http://127.0.0.1:8000/rag-pinecone-multi-query/playground](http://127.0.0.1:8000/rag-pinecone-multi-query/playground) でプレイグラウンドにアクセスできます。

コードからテンプレートにアクセスするには、次のように使用します:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-pinecone-multi-query")
```
