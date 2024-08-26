---
translated: true
---

# openai-functions-tool-retrieval-agent

このテンプレートで紹介されている新しいアイデアは、検索を使ってエージェントクエリに使用するツールのセットを選択するというアイデアです。これは、選択できるツールが非常に多数ある場合に役立ちます。プロンプトにすべてのツールの説明を含めることはできません(コンテキストの長さの問題があるため)ので、代わりに実行時に動的にN個のツールを選択して検討することができます。

このテンプレートでは、やや人為的な例を作成します。1つの正当なツール(検索)と99個の無意味な偽のツールがあります。その後、ユーザー入力を取り、クエリに関連するツールを検索するステップをプロンプトテンプレートに追加します。

このテンプレートは[このエージェントハウツー](https://python.langchain.com/docs/modules/agents/how_to/custom_agent_with_tool_retrieval)に基づいています。

## 環境設定

以下の環境変数を設定する必要があります:

`OPENAI_API_KEY`環境変数を設定して、OpenAIモデルにアクセスします。

`TAVILY_API_KEY`環境変数を設定して、Tavilyにアクセスします。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package openai-functions-tool-retrieval-agent
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add openai-functions-tool-retrieval-agent
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from openai_functions_tool_retrieval_agent import agent_executor as openai_functions_tool_retrieval_agent_chain

add_routes(app, openai_functions_tool_retrieval_agent_chain, path="/openai-functions-tool-retrieval-agent")
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

このディレクトリ内にいる場合は、次のようにして直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/openai-functions-tool-retrieval-agent/playground](http://127.0.0.1:8000/openai-functions-tool-retrieval-agent/playground)からPlaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/openai-functions-tool-retrieval-agent")
```
