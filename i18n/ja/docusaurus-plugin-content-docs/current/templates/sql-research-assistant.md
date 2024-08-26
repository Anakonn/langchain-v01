---
translated: true
---

# sql-research-assistant

このパッケージは SQL データベースに対する研究を行います。

## 使用方法

このパッケージは複数のモデルに依存しており、以下の依存関係があります:

- OpenAI: `OPENAI_API_KEY` 環境変数を設定する必要があります
- Ollama: [Ollama をインストールして実行する](https://python.langchain.com/docs/integrations/chat/ollama)
- llama2 (Ollama 上): `ollama pull llama2` を実行する (そうしないと Ollama から 404 エラーが発生します)

このパッケージを使用するには、まず LangChain CLI をインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、このパッケージをインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package sql-research-assistant
```

既存のプロジェクトにこのパッケージを追加する場合は、以下のように実行できます:

```shell
langchain app add sql-research-assistant
```

そして、`server.py` ファイルに以下のコードを追加します:

```python
from sql_research_assistant import chain as sql_research_assistant_chain

add_routes(app, sql_research_assistant_chain, path="/sql-research-assistant")
```

(オプション) LangSmith を設定しましょう。
LangSmith は LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。
[ここ](https://smith.langchain.com/)から LangSmith に登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のように直接 LangServe インスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPI アプリが起動し、ローカルの [http://localhost:8000](http://localhost:8000) でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) で全てのテンプレートを確認できます。
[http://127.0.0.1:8000/sql-research-assistant/playground](http://127.0.0.1:8000/sql-research-assistant/playground) でプレイグラウンドにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-research-assistant")
```
