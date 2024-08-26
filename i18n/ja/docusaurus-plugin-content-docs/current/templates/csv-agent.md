---
translated: true
---

# csv-agent

このテンプレートは、テキストデータとの対話(質問回答)のために、ツール(Python REPL)とメモリ(ベクトルストア)を備えた[csvエージェント](https://python.langchain.com/docs/integrations/toolkits/csv)を使用しています。

## 環境設定

OpenAIモデルにアクセスするために、`OPENAI_API_KEY`環境変数を設定してください。

環境を設定するには、ベクトルストアへの取り込みを処理する`ingest.py`スクリプトを実行する必要があります。

## 使用方法

このパッケージを使用するには、まずLangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package csv-agent
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add csv-agent
```

そして、`server.py`ファイルに次のコードを追加してください:

```python
from csv_agent.agent import agent_executor as csv_agent_chain

add_routes(app, csv_agent_chain, path="/csv-agent")
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

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
[http://127.0.0.1:8000/csv-agent/playground](http://127.0.0.1:8000/csv-agent/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、次のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/csv-agent")
```
