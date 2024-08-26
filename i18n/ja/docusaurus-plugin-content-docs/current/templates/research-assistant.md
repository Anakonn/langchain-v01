---
translated: true
---

# 研究アシスタント

このテンプレートは、[GPT Researcher](https://github.com/assafelovic/gpt-researcher)のバージョンを実装しており、研究エージェントの出発点として使用できます。

## 環境設定

デフォルトのテンプレートは ChatOpenAI と DuckDuckGo に依存しているため、以下の環境変数が必要です:

- `OPENAI_API_KEY`

Tavily LLM最適化検索エンジンを使用するには、以下が必要です:

- `TAVILY_API_KEY`

## 使用方法

このパッケージを使用するには、まずLangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package research-assistant
```

既存のプロジェクトに追加する場合は、以下を実行するだけです:

```shell
langchain app add research-assistant
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from research_assistant import chain as research_assistant_chain

add_routes(app, research_assistant_chain, path="/research-assistant")
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

このディレクトリ内にいる場合は、以下のようにLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/research-assistant/playground](http://127.0.0.1:8000/research-assistant/playground)でPlaygroundにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/research-assistant")
```
