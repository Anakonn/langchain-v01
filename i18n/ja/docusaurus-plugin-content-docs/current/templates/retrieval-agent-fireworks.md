---
translated: true
---

# retrieval-agent-fireworks

このパッケージは、FireworksAIでホストされているオープンソースモデルを使用して、エージェントアーキテクチャを使用して検索を行います。デフォルトでは、これはArxivの検索を行います。

`Mixtral8x7b-instruct-v0.1`を使用します。これは、この課題に特化して微調整されていないものの、関数呼び出しで合理的な結果を生み出すことが示されています: https://huggingface.co/blog/open-source-llms-as-agents

## 環境設定

OSS モデルを実行するための様々な優れた方法があります。FireworksAIを使用して簡単に実行できます。詳細は[こちら](https://python.langchain.com/docs/integrations/providers/fireworks)をご覧ください。

Fireworksにアクセスするには、`FIREWORKS_API_KEY`環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package retrieval-agent-fireworks
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add retrieval-agent-fireworks
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from retrieval_agent_fireworks import chain as retrieval_agent_fireworks_chain

add_routes(app, retrieval_agent_fireworks_chain, path="/retrieval-agent-fireworks")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[こちら](https://smith.langchain.com/)からLangSmithに登録できます。
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

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/retrieval-agent-fireworks/playground](http://127.0.0.1:8000/retrieval-agent-fireworks/playground)からPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、次のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/retrieval-agent-fireworks")
```
