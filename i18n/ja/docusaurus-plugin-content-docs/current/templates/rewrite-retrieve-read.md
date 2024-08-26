---
translated: true
---

# rewrite_retrieve_read

このテンプレートは、論文 [Query Rewriting for Retrieval-Augmented Large Language Models](https://arxiv.org/pdf/2305.14283.pdf) のクエリ変換 (書き換え) メソッドを実装しています。RAGを最適化するためのものです。

## 環境設定

OpenAIモデルにアクセスするために、`OPENAI_API_KEY`環境変数を設定してください。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package rewrite_retrieve_read
```

既存のプロジェクトに追加する場合は、次のように実行するだけです:

```shell
langchain app add rewrite_retrieve_read
```

そして、`server.py`ファイルに次のコードを追加してください:

```python
from rewrite_retrieve_read.chain import chain as rewrite_retrieve_read_chain

add_routes(app, rewrite_retrieve_read_chain, path="/rewrite-retrieve-read")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援してくれます。
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

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rewrite_retrieve_read/playground](http://127.0.0.1:8000/rewrite_retrieve_read/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、次のように実行します:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rewrite_retrieve_read")
```
