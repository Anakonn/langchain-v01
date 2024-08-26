---
translated: true
---

# rag-vectara-multiquery

このテンプレートは、vectaraを使ってマルチクエリRAGを実行します。

## 環境設定

OpenAIモデルにアクセスするために、`OPENAI_API_KEY`環境変数を設定してください。

また、以下の環境変数も設定する必要があります:
* `VECTARA_CUSTOMER_ID`
* `VECTARA_CORPUS_ID`
* `VECTARA_API_KEY`

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、このパッケージのみをインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-vectara-multiquery
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add rag-vectara-multiquery
```

そして、`server.py`ファイルに以下のコードを追加してください:

```python
from rag_vectara import chain as rag_vectara_chain

add_routes(app, rag_vectara_chain, path="/rag-vectara-multiquery")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[こちら](https://smith.langchain.com/)からLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "vectara-demo"
```

このディレクトリ内にいる場合は、以下のように直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドは[http://127.0.0.1:8000/rag-vectara-multiquery/playground](http://127.0.0.1:8000/rag-vectara-multiquery/playground)でアクセスできます。

コードからテンプレートにアクセスするには、以下のように実行します:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-vectara-multiquery")
```
