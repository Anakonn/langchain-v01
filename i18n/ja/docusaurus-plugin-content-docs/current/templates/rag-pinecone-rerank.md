---
translated: true
---

# rag-pinecone-rerank

このテンプレートは、Pinecone と OpenAI を使用した RAG と、返された文書の再ランキングに [Cohere を使用](https://txt.cohere.com/rerank/)します。

再ランキングは、指定されたフィルターや基準を使用して、検索された文書をランク付けする方法を提供します。

## 環境設定

このテンプレートは Pinecone をベクトルストアとして使用し、`PINECONE_API_KEY`、`PINECONE_ENVIRONMENT`、`PINECONE_INDEX` を設定する必要があります。

OpenAI モデルにアクセスするには、`OPENAI_API_KEY` 環境変数を設定します。

Cohere ReRank にアクセスするには、`COHERE_API_KEY` 環境変数を設定します。

## 使用方法

このパッケージを使用するには、まず LangChain CLI をインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package rag-pinecone-rerank
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add rag-pinecone-rerank
```

そして、`server.py` ファイルに次のコードを追加します:

```python
from rag_pinecone_rerank import chain as rag_pinecone_rerank_chain

add_routes(app, rag_pinecone_rerank_chain, path="/rag-pinecone-rerank")
```

(オプション) LangSmith を設定しましょう。
LangSmith は、LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。
[ここ](https://smith.langchain.com/)から LangSmith に登録できます。
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

これにより、FastAPI アプリが起動し、ローカルの [http://localhost:8000](http://localhost:8000) でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-pinecone-rerank/playground](http://127.0.0.1:8000/rag-pinecone-rerank/playground) でプレイグラウンドにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-pinecone-rerank")
```
