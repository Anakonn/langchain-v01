---
translated: true
---

# vertexai-chuck-norris

このテンプレートは、Vertex AI PaLM2を使ってチャック・ノリスについてのジョークを作ります。

## 環境設定

まず、アクティブな請求アカウントを持つGoogle Cloudプロジェクトがあり、[gcloud CLI がインストールされている](https://cloud.google.com/sdk/docs/install)ことを確認してください。

[アプリケーションデフォルトの認証情報](https://cloud.google.com/docs/authentication/provide-credentials-adc)を設定します:

```shell
gcloud auth application-default login
```

使用するデフォルトのGoogle Cloudプロジェクトを設定するには、このコマンドを実行し、使用したいプロジェクトの[プロジェクトID](https://support.google.com/googleapi/answer/7014113?hl=en)を設定します:

```shell
gcloud config set project [PROJECT-ID]
```

[Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com)をプロジェクトで有効にします:

```shell
gcloud services enable aiplatform.googleapis.com
```

## 使用方法

このパッケージを使用するには、まずLangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package pirate-speak
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add vertexai-chuck-norris
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from vertexai_chuck_norris.chain import chain as vertexai_chuck_norris_chain

add_routes(app, vertexai_chuck_norris_chain, path="/vertexai-chuck-norris")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[ここ](https://smith.langchain.com/)でLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、次のようにして直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
[http://127.0.0.1:8000/vertexai-chuck-norris/playground](http://127.0.0.1:8000/vertexai-chuck-norris/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、次のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/vertexai-chuck-norris")
```
