---
translated: true
---

# retrieval-agent

このパッケージは、エージェントアーキテクチャを使用して Azure OpenAI を使用して検索を行います。
デフォルトでは、これは Arxiv 上の検索を行います。

## 環境設定

Azure OpenAI を使用しているため、次の環境変数を設定する必要があります:

```shell
export AZURE_OPENAI_ENDPOINT=...
export AZURE_OPENAI_API_VERSION=...
export AZURE_OPENAI_API_KEY=...
```

## 使用方法

このパッケージを使用するには、まず LangChain CLI をインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package retrieval-agent
```

既存のプロジェクトに追加する場合は、次のように実行するだけです:

```shell
langchain app add retrieval-agent
```

そして、`server.py` ファイルに次のコードを追加します:

```python
from retrieval_agent import chain as retrieval_agent_chain

add_routes(app, retrieval_agent_chain, path="/retrieval-agent")
```

(オプション) LangSmith を設定しましょう。
LangSmith は、LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。
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

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
[http://127.0.0.1:8000/retrieval-agent/playground](http://127.0.0.1:8000/retrieval-agent/playground)からplaygroundにアクセスできます。

コードからテンプレートにアクセスするには、次のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/retrieval-agent")
```
