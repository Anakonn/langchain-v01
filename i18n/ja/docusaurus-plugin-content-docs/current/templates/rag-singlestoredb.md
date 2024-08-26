---
translated: true
---

# rag-singlestoredb

このテンプレートは、SingleStoreDBとOpenAIを使用してRAGを実行します。

## 環境設定

このテンプレートはSingleStoreDBをベクトルストアとして使用し、`SINGLESTOREDB_URL`が設定されている必要があります。これは`admin:password@svc-xxx.svc.singlestore.com:port/db_name`の形式にする必要があります。

OpenAIモデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、まずLangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package rag-singlestoredb
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add rag-singlestoredb
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from rag_singlestoredb import chain as rag_singlestoredb_chain

add_routes(app, rag_singlestoredb_chain, path="/rag-singlestoredb")
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

このディレクトリ内にいる場合は、次のように直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-singlestoredb/playground](http://127.0.0.1:8000/rag-singlestoredb/playground)でplaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-singlestoredb")
```
