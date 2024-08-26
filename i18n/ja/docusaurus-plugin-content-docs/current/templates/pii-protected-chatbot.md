---
translated: true
---

# pii-protected-chatbot

このテンプレートは、受信したPIIを検出し、LLMに渡さないチャットボットを作成します。

## 環境設定

以下の環境変数を設定する必要があります:

`OPENAI_API_KEY`環境変数を設定して、OpenAIモデルにアクセスします。

## 使用方法

このパッケージを使用するには、まずLangChain CLIがインストールされている必要があります:

```shell
pip install -U "langchain-cli[serve]"
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package pii-protected-chatbot
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add pii-protected-chatbot
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from pii_protected_chatbot.chain import chain as pii_protected_chatbot

add_routes(app, pii_protected_chatbot, path="/openai-functions-agent")
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

このディレクトリ内にいる場合は、以下のようにLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/pii_protected_chatbot/playground](http://127.0.0.1:8000/pii_protected_chatbot/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/pii_protected_chatbot")
```
