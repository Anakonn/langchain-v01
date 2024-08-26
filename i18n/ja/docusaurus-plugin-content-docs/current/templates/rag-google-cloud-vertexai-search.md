---
translated: true
---

# rag-google-cloud-vertexai-search

このテンプレートは、機械学習駆動の検索サービスであるGoogle Vertex AI Searchと、PaLM 2 for Chat (chat-bison)を利用したアプリケーションです。このアプリケーションは、リトリーバルチェーンを使用して、ドキュメントに基づいて質問に答えます。

Vertex AI Searchを使ったRAGアプリケーションの構築に関する詳細は、[こちら](https://cloud.google.com/generative-ai-app-builder/docs/enterprise-search-introduction)をご確認ください。

## 環境設定

このテンプレートを使用する前に、Vertex AI Searchの認証が済んでいることを確認してください。認証ガイドは[こちら](https://cloud.google.com/generative-ai-app-builder/docs/authentication)をご覧ください。

また、以下も必要です:

- 検索アプリケーションの作成 [こちら](https://cloud.google.com/generative-ai-app-builder/docs/create-engine-es)
- データストアの作成 [こちら](https://cloud.google.com/generative-ai-app-builder/docs/create-data-store-es)

このテンプレートをテストするのに適したデータセットは、Alphabet Earnings Reportsです。[こちら](https://abc.xyz/investor/)から入手できます。データは`gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs`にも用意されています。

以下の環境変数を設定してください:

* `GOOGLE_CLOUD_PROJECT_ID` - Google CloudプロジェクトのID
* `DATA_STORE_ID` - Vertex AI SearchのデータストアのID(36文字の英数字)
* `MODEL_TYPE` - Vertex AI Searchのモデルタイプ

## 使用方法

このパッケージを使用するには、LangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、このパッケージのみをインストールするには、以下のように実行します:

```shell
langchain app new my-app --package rag-google-cloud-vertexai-search
```

既存のプロジェクトに追加する場合は、以下のように実行します:

```shell
langchain app add rag-google-cloud-vertexai-search
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from rag_google_cloud_vertexai_search.chain import chain as rag_google_cloud_vertexai_search_chain

add_routes(app, rag_google_cloud_vertexai_search_chain, path="/rag-google-cloud-vertexai-search")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[こちら](https://smith.langchain.com/)からLangSmithに登録できます。
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

これにより、[http://localhost:8000](http://localhost:8000)でローカルサーバーが起動します。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートを確認できます。
[http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground](http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-google-cloud-vertexai-search")
```
