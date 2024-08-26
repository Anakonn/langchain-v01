---
translated: true
---

# Weaviateでのハイブリッド検索

このテンプレートでは、Weaviateのハイブリッド検索機能の使用方法を示します。ハイブリッド検索は、複数の検索アルゴリズムを組み合わせて、検索結果の正確性と関連性を向上させます。

Weaviateは、検索クエリーとドキュメントの意味とコンテキストを表すために、疎なベクトルと密なベクトルの両方を使用します。結果は、`bm25`とベクトル検索のランキングの組み合わせを使用して、上位の結果を返します。

##  設定

`chain.py`で環境変数を設定することで、ホストされているWeaviateベクトルストアに接続できます:

* `WEAVIATE_ENVIRONMENT`
* `WEAVIATE_API_KEY`

また、OpenAIモデルを使用するには、`OPENAI_API_KEY`も設定する必要があります。

## はじめに

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package hybrid-search-weaviate
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add hybrid-search-weaviate
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from hybrid_search_weaviate import chain as hybrid_search_weaviate_chain

add_routes(app, hybrid_search_weaviate_chain, path="/hybrid-search-weaviate")
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

このディレクトリ内にいる場合は、次のように直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000)でローカルサーバーが起動します。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/hybrid-search-weaviate/playground](http://127.0.0.1:8000/hybrid-search-weaviate/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、次のように実行します:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/hybrid-search-weaviate")
```
