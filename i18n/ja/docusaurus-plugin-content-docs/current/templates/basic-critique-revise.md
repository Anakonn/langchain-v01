---
translated: true
---

# 基本的な批評と改訂

スキーマ候補を繰り返し生成し、エラーに基づいて改訂します。

## 環境設定

このテンプレートでは OpenAI の関数呼び出しを使用するため、`OPENAI_API_KEY` 環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、まず LangChain CLI をインストールする必要があります:

```shell
pip install -U "langchain-cli[serve]"
```

新しい LangChain プロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package basic-critique-revise
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add basic-critique-revise
```

そして、`server.py` ファイルに次のコードを追加します:

```python
from basic_critique_revise import chain as basic_critique_revise_chain

add_routes(app, basic_critique_revise_chain, path="/basic-critique-revise")
```

(オプション) LangSmith を設定しましょう。
LangSmith は LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。
[こちら](https://smith.langchain.com/)から LangSmith に登録できます。
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

これにより、FastAPI アプリが起動し、ローカルの [http://localhost:8000](http://localhost:8000) でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) で全てのテンプレートを確認できます。
[http://127.0.0.1:8000/basic-critique-revise/playground](http://127.0.0.1:8000/basic-critique-revise/playground) でプレイグラウンドにアクセスできます。

コードからテンプレートにアクセスするには、次のように実行します:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/basic-critique-revise")
```
