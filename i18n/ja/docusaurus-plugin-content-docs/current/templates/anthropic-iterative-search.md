---
translated: true
---

# anthropic-iterative-search

このテンプレートは、Wikipediaを検索して質問への答えを見つける機能を持つ仮想リサーチアシスタントを作成します。

これは[このノートブック](https://github.com/anthropics/anthropic-cookbook/blob/main/long_context/wikipedia-search-cookbook.ipynb)に大きな影響を受けています。

## 環境設定

Anthropicモデルにアクセスするには、`ANTHROPIC_API_KEY`環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package anthropic-iterative-search
```

既存のプロジェクトに追加する場合は、次のように実行するだけです:

```shell
langchain app add anthropic-iterative-search
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from anthropic_iterative_search import chain as anthropic_iterative_search_chain

add_routes(app, anthropic_iterative_search_chain, path="/anthropic-iterative-search")
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

このディレクトリ内にいる場合は、次のようにLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/anthropic-iterative-search/playground](http://127.0.0.1:8000/anthropic-iterative-search/playground)でPlaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/anthropic-iterative-search")
```
