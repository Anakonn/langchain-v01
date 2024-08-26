---
translated: true
---

# ショッピングアシスタント

このテンプレートは、ユーザーが探しているプロダクトを見つけるのを助けるショッピングアシスタントを作成します。

このテンプレートは `Ionic` を使ってプロダクトを検索します。

## 環境設定

このテンプレートは `OpenAI` をデフォルトで使用します。
`OPENAI_API_KEY` が環境に設定されていることを確認してください。

## 使用方法

このパッケージを使用するには、まず LangChain CLI がインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package shopping-assistant
```

既存のプロジェクトに追加する場合は、次のように実行するだけです:

```shell
langchain app add shopping-assistant
```

そして、`server.py` ファイルに次のコードを追加します:

```python
from shopping_assistant.agent import agent_executor as shopping_assistant_chain

add_routes(app, shopping_assistant_chain, path="/shopping-assistant")
```

(オプション) LangSmith を設定しましょう。
LangSmith は LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。
LangSmith に登録するには[こちら](https://smith.langchain.com/)から行えます。
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
[http://127.0.0.1:8000/shopping-assistant/playground](http://127.0.0.1:8000/shopping-assistant/playground)でPlaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/shopping-assistant")
```
