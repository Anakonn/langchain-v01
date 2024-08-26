---
translated: true
---

# rag-google-cloud-sensitive-data-protection

このテンプレートは、Google Vertex AI Search (機械学習ベースの検索サービス)とPaLM 2 for Chat (chat-bison)を利用したアプリケーションです。このアプリケーションは、Retrievalチェーンを使用して、ドキュメントに基づいて質問に回答します。

このテンプレートは、Google Sensitive Data Protection (テキスト内の機密データを検出および編集するサービス)とPaLM 2 for Chat (chat-bison)を利用したアプリケーションです。ただし、任意のモデルを使用できます。

Sensitive Data Protectionの使用に関する詳細は、[こちら](https://cloud.google.com/dlp/docs/sensitive-data-protection-overview)をご確認ください。

## 環境設定

このテンプレートを使用する前に、Google Cloudプロジェクトで[DLP API](https://console.cloud.google.com/marketplace/product/google/dlp.googleapis.com)と[Vertex AI API](https://console.cloud.google.com/marketplace/product/google/aiplatform.googleapis.com)を有効にしてください。

Google Cloudに関する一般的な環境トラブルシューティングのステップは、このreadmeの最後をご覧ください。

以下の環境変数を設定してください:

* `GOOGLE_CLOUD_PROJECT_ID` - Google CloudプロジェクトのID
* `MODEL_TYPE` - Vertex AI Searchのモデルタイプ (例: `chat-bison`)

## 使用方法

このパッケージを使用するには、LangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、このパッケージのみをインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-google-cloud-sensitive-data-protection
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add rag-google-cloud-sensitive-data-protection
```

そして、`server.py`ファイルに以下のコードを追加してください:

```python
from rag_google_cloud_sensitive_data_protection.chain import chain as rag_google_cloud_sensitive_data_protection_chain

add_routes(app, rag_google_cloud_sensitive_data_protection_chain, path="/rag-google-cloud-sensitive-data-protection")
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

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground](http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground)でPlaygroundにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-google-cloud-sensitive-data-protection")
```

# Google Cloudのトラブルシューティング

`gcloud auth application-default login`コマンドを使用して、`gcloud`の認証情報を設定できます。

以下のコマンドを使用して、`gcloud`プロジェクトを設定できます:

```bash
gcloud config set project <your project>
gcloud auth application-default set-quota-project <your project>
export GOOGLE_CLOUD_PROJECT_ID=<your project>
```
