---
translated: true
---

# solo-performance-prompting-agent

このテンプレートは、複数のパーソナを使ってマルチターンの自己コラボレーションを行うことで、単一のLLMを認知シナジストに変換するエージェントを作成します。
認知シナジストとは、個々の強みと知識を組み合わせて、複雑なタスクの問題解決能力と全体的なパフォーマンスを向上させる、知的エージェントのことです。タスクの入力に基づいて動的にさまざまなパーソナを識別およびシミュレーションすることで、SPPはLLMの認知シナジーの可能性を引き出します。

このテンプレートでは `DuckDuckGo` 検索APIを使用します。

## 環境設定

このテンプレートでは、デフォルトで `OpenAI` を使用します。
環境変数に `OPENAI_API_KEY` が設定されていることを確認してください。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package solo-performance-prompting-agent
```

既存のプロジェクトに追加する場合は、次のように実行するだけです:

```shell
langchain app add solo-performance-prompting-agent
```

そして、`server.py` ファイルに次のコードを追加します:

```python
from solo_performance_prompting_agent.agent import agent_executor as solo_performance_prompting_agent_chain

add_routes(app, solo_performance_prompting_agent_chain, path="/solo-performance-prompting-agent")
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

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレート一覧を確認できます。
[http://127.0.0.1:8000/solo-performance-prompting-agent/playground](http://127.0.0.1:8000/solo-performance-prompting-agent/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、次のように実行します:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/solo-performance-prompting-agent")
```
