---
translated: true
---

# cohere-librarian

このテンプレートは、Cohereをライブラリアンに変換します。

ベクトルデータベースとCohere埋め込み、チャットボットのプロンプトと図書館に関する情報、最後にRAGチャットボットがインターネットにアクセスできるなど、さまざまなことを処理できるルーターの使用を示しています。

本の推奨のより完全なデモを行うには、books_with_blurbs.csvを次のデータセットからより大きなサンプルに置き換えることをお勧めします: https://www.kaggle.com/datasets/jdobrow/57000-books-with-metadata-and-blurbs/ 。

## 環境設定

Cohere モデルにアクセスするには、`COHERE_API_KEY` 環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package cohere-librarian
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add cohere-librarian
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from cohere_librarian.chain import chain as cohere_librarian_chain

add_routes(app, cohere_librarian_chain, path="/cohere-librarian")
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

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://localhost:8000/docs](http://localhost:8000/docs)でテンプレートをすべて確認できます。
[http://localhost:8000/cohere-librarian/playground](http://localhost:8000/cohere-librarian/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、次のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/cohere-librarian")
```
