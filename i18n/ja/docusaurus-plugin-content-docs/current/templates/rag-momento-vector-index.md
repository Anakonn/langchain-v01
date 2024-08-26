---
translated: true
---

# rag-momento-ベクトルインデックス

このテンプレートは、Momento Vector Index (MVI) と OpenAI を使用して RAG を実行します。

> MVI: データ用の最も生産的で使いやすい、サーバーレスのベクトルインデックスです。MVI を使い始めるには、アカウントに登録するだけです。インフラの処理、サーバーの管理、スケーリングの心配をする必要はありません。MVI はニーズに合わせて自動的にスケールするサービスです。Momento Cache でプロンプトをキャッシュしてセッションストアとして、Momento Topics でイベントをアプリケーションにブロードキャストするなど、他の Momento サービスと組み合わせることができます。

MVI を使い始めるには、[Momento Console](https://console.gomomento.com/) にアクセスしてください。

## 環境設定

このテンプレートは Momento Vector Index をベクトルストアとして使用し、`MOMENTO_API_KEY` と `MOMENTO_INDEX_NAME` を設定する必要があります。

API キーを取得するには、[コンソール](https://console.gomomento.com/)に移動してください。

OpenAI モデルにアクセスするには、`OPENAI_API_KEY` 環境変数を設定してください。

## 使用方法

このパッケージを使用するには、LangChain CLI がインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package rag-momento-vector-index
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add rag-momento-vector-index
```

そして、`server.py` ファイルに次のコードを追加してください:

```python
from rag_momento_vector_index import chain as rag_momento_vector_index_chain

add_routes(app, rag_momento_vector_index_chain, path="/rag-momento-vector-index")
```

(オプション) LangSmith を設定しましょう。
LangSmith は LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。
LangSmith に登録するには[こちら](https://smith.langchain.com/)から。
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

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-momento-vector-index/playground](http://127.0.0.1:8000/rag-momento-vector-index/playground)でプレイグラウンドにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-momento-vector-index")
```

## データのインデックス化

サンプルモジュールを使ってデータをインデックス化できます。それは `rag_momento_vector_index/ingest.py` にあります。`chain.py` にコメントアウトされた行があるのでそれを使ってください。
