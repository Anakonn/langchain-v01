---
translated: true
---

# gemini-functions-agent

このテンプレートは、Google Gemini関数呼び出しを使用して意思決定を伝達するエージェントを作成します。

このサンプルでは、Tavilyの検索エンジンを使ってインターネット上の情報を検索できるオプションのエージェントを作成します。

[ここにLangSmithのトレースの例があります](https://smith.langchain.com/public/0ebf1bd6-b048-4019-b4de-25efe8d3d18c/r)

## 環境設定

以下の環境変数を設定する必要があります:

`TAVILY_API_KEY`環境変数を設定してTavilyにアクセスする
`GOOGLE_API_KEY`環境変数を設定してGoogle Gemini APIにアクセスする

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package gemini-functions-agent
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add gemini-functions-agent
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from gemini_functions_agent import agent_executor as gemini_functions_agent_chain

add_routes(app, gemini_functions_agent_chain, path="/openai-functions-agent")
```

(オプション) LangSmithを設定しましょう。
LangSmithを使うと、LangChainアプリケーションのトレース、モニタリング、デバッグができます。
LangSmithの登録は[こちら](https://smith.langchain.com/)から行えます。
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

これにより、FastAPIアプリケーションが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/gemini-functions-agent/playground](http://127.0.0.1:8000/gemini-functions-agent/playground)でPlaygroundにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/gemini-functions-agent")
```
