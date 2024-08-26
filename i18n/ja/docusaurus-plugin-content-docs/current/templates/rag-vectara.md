---
translated: true
---

# rag-vectara

このテンプレートは vectara を使用して RAG を実行します。

## 環境設定

OpenAI モデルにアクセスするには、`OPENAI_API_KEY` 環境変数を設定してください。

また、以下の環境変数も設定する必要があります:
* `VECTARA_CUSTOMER_ID`
* `VECTARA_CORPUS_ID`
* `VECTARA_API_KEY`

## 使用方法

このパッケージを使用するには、まず LangChain CLI をインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-vectara
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add rag-vectara
```

そして、`server.py` ファイルに以下のコードを追加してください:

```python
from rag_vectara import chain as rag_vectara_chain

add_routes(app, rag_vectara_chain, path="/rag-vectara")
```

(オプション) LangSmith を設定しましょう。
LangSmith は LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。
LangSmith に登録するには[こちら](https://smith.langchain.com/)から行えます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "vectara-demo"
```

このディレクトリ内にいる場合は、以下のように直接 LangServe インスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPI アプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドは[http://127.0.0.1:8000/rag-vectara/playground](http://127.0.0.1:8000/rag-vectara/playground)でアクセスできます。

コードからテンプレートにアクセスするには、以下のように実行します:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-vectara")
```
