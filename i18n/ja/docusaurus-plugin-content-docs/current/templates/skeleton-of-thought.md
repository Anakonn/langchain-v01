---
translated: true
---

# スケルトン思考

[この](https://sites.google.com/view/sot-llm)論文の "スケルトン思考" を実装しています。

この手法により、まずスケルトンを生成し、その後アウトラインの各ポイントを生成することで、より長い生成が高速に行えるようになります。

## 環境設定

OpenAI モデルにアクセスするために、`OPENAI_API_KEY` 環境変数を設定してください。

`OPENAI_API_KEY` を取得するには、OpenAI アカウントの [API キー](https://platform.openai.com/account/api-keys) ページにアクセスし、新しいシークレットキーを作成してください。

## 使用方法

このパッケージを使用するには、まず LangChain CLI をインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、このパッケージのみをインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package skeleton-of-thought
```

既存のプロジェクトにこのパッケージを追加する場合は、以下のように実行してください:

```shell
langchain app add skeleton-of-thought
```

そして、`server.py` ファイルに以下のコードを追加してください:

```python
from skeleton_of_thought import chain as skeleton_of_thought_chain

add_routes(app, skeleton_of_thought_chain, path="/skeleton-of-thought")
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

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/skeleton-of-thought/playground](http://127.0.0.1:8000/skeleton-of-thought/playground) でプレイグラウンドにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/skeleton-of-thought")
```
