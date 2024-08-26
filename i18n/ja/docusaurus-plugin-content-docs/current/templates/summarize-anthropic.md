---
translated: true
---

# 要約-アントロピック

このテンプレートは、アントロピックの `claude-3-sonnet-20240229` を使用して長文書を要約します。

100,000トークンの大きなコンテキストウィンドウを活用することで、100ページを超える文書の要約が可能になります。

要約プロンプトは `chain.py` で確認できます。

## 環境設定

`ANTHROPIC_API_KEY` 環境変数を設定して、アントロピックモデルにアクセスします。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package summarize-anthropic
```

既存のプロジェクトに追加する場合は、次のように実行するだけです:

```shell
langchain app add summarize-anthropic
```

そして、`server.py` ファイルに次のコードを追加します:

```python
from summarize_anthropic import chain as summarize_anthropic_chain

add_routes(app, summarize_anthropic_chain, path="/summarize-anthropic")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
LangSmithの登録は[こちら](https://smith.langchain.com/)から行えます。
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

これにより、FastAPIアプリケーションが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドは[http://127.0.0.1:8000/summarize-anthropic/playground](http://127.0.0.1:8000/summarize-anthropic/playground)でアクセスできます。

コードからテンプレートにアクセスするには、次のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/summarize-anthropic")
```
