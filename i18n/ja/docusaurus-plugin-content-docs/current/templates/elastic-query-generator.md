---
translated: true
---

# elastic-query-generator

このテンプレートを使うと、LLMsを使ってElasticsearchアナリティクスデータベースを自然言語で操作できます。

Elasticsearchのドメイン固有言語(DSL) APIを使ってサーチクエリを構築します(フィルターと集計)。

## 環境設定

OpenAIモデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定してください。

### Elasticsearchのインストール

Elasticsearchを実行する方法はいくつかありますが、おすすめの方法の1つはElastic Cloudを使うことです。

[Elastic Cloud](https://cloud.elastic.co/registration?utm_source=langchain&utm_content=langserve)で無料トライアルアカウントを作成してください。

デプロイメントができたら、接続文字列を更新してください。

パスワードと接続(Elasticsearchのurl)はデプロイメントコンソールで確認できます。

Elasticsearchクライアントには、インデックスの一覧表示、マッピングの説明、検索クエリの実行の権限が必要です。

### データの入力

サンプルデータを入力したい場合は、`python ingest.py`を実行できます。

これにより、`customers`インデックスが作成されます。このパッケージでは、クエリを生成するインデックスを`["customers"]`と指定しています。これはElasticsearchインデックスの設定に依存します。

## 使い方

このパッケージを使うには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、このパッケージのみをインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package elastic-query-generator
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add elastic-query-generator
```

そして、`server.py`ファイルに以下のコードを追加してください:

```python
from elastic_query_generator.chain import chain as elastic_query_generator_chain

add_routes(app, elastic_query_generator_chain, path="/elastic-query-generator")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[ここ](https://smith.langchain.com/)からLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のコマンドでLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートの一覧が表示されます。
[http://127.0.0.1:8000/elastic-query-generator/playground](http://127.0.0.1:8000/elastic-query-generator/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/elastic-query-generator")
```
