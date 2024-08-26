---
translated: true
---

# sql-llama2

このテンプレートにより、ユーザーは自然言語を使ってSQLデータベースと対話できるようになります。

[Replicate](https://python.langchain.com/docs/integrations/llms/replicate)でホストされているLLamA2-13bを使用していますが、[Fireworks](https://python.langchain.com/docs/integrations/chat/fireworks)を含む、LLaMA2をサポートするAPIであれば適応できます。

このテンプレートには2023年のNBAロスターの例データベースが含まれています。

このデータベースの構築方法については、[こちら](https://github.com/facebookresearch/llama-recipes/blob/main/demo_apps/StructuredLlama.ipynb)をご覧ください。

## 環境設定

`REPLICATE_API_TOKEN`が環境に設定されていることを確認してください。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package sql-llama2
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add sql-llama2
```

そして、`server.py`ファイルに以下のコードを追加してください:

```python
from sql_llama2 import chain as sql_llama2_chain

add_routes(app, sql_llama2_chain, path="/sql-llama2")
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

このディレクトリ内にいる場合は、以下のようにLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリケーションが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/sql-llama2/playground](http://127.0.0.1:8000/sql-llama2/playground)からplaygroundにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-llama2")
```
