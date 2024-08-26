---
translated: true
---

# rag-astradb

このテンプレートは、Astra DB (`AstraDB` ベクトアストア クラス) を使用して RAG を実行します。

## 環境設定

[Astra DB](https://astra.datastax.com) データベースが必要です。無料のティアでも構いません。

- データベースの **API エンドポイント** (例: `https://0123...-us-east1.apps.astra.datastax.com`) が必要です。
- **トークン** (`AstraCS:...`) も必要です。

また、**OpenAI API キー**も必要です。_デフォルトでは OpenAI のみをサポートしていますが、コードを変更すれば対応できます。_

接続パラメータとシークレットは環境変数で提供してください。変数名については `.env.template` を参照してください。

## 使用方法

このパッケージを使用するには、まず LangChain CLI をインストールする必要があります:

```shell
pip install -U "langchain-cli[serve]"
```

新しい LangChain プロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package rag-astradb
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add rag-astradb
```

そして、`server.py` ファイルに次のコードを追加してください:

```python
from astradb_entomology_rag import chain as astradb_entomology_rag_chain

add_routes(app, astradb_entomology_rag_chain, path="/rag-astradb")
```

(オプション) LangSmith を設定しましょう。
LangSmith は LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。
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
[http://127.0.0.1:8000/rag-astradb/playground](http://127.0.0.1:8000/rag-astradb/playground) でプレイグラウンドにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-astradb")
```

## 参考

LangServe チェーンを含む単独のリポジトリ: [here](https://github.com/hemidactylus/langserve_astradb_entomology_rag)。
