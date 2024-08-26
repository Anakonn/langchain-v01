---
translated: true
---

# Langchain - Robocorp Action Server

このテンプレートでは、[Robocorp Action Server](https://github.com/robocorp/robocorp)で提供されるアクションをAgentのツールとして使用できます。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package robocorp-action-server
```

既存のプロジェクトに追加する場合は、次のように実行するだけです:

```shell
langchain app add robocorp-action-server
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from robocorp_action_server import agent_executor as action_server_chain

add_routes(app, action_server_chain, path="/robocorp-action-server")
```

### Action Serverの実行

Action Serverを実行するには、Robocorp Action Serverがインストールされている必要があります。

```bash
pip install -U robocorp-action-server
```

その後、次のように Action Serverを実行できます:

```bash
action-server new
cd ./your-project-name
action-server start
```

### LangSmithの設定 (オプション)

LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[ここ](https://smith.langchain.com/)からLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

### LangServeインスタンスの起動

このディレクトリ内にいる場合は、次のように直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/robocorp-action-server/playground](http://127.0.0.1:8000/robocorp-action-server/playground)からPlaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/robocorp-action-server")
```
