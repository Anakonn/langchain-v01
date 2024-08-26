---
translated: true
---

# sql-pgvector

このテンプレートを使うと、ユーザーは `pgvector` を使って PostgreSQL と意味検索 / RAG を組み合わせることができます。

[RAG empowered SQL cookbook](https://github.com/langchain-ai/langchain/blob/master/cookbook/retrieval_in_sql.ipynb) に示されているように、[PGVector](https://github.com/pgvector/pgvector) 拡張機能を使用しています。

## 環境設定

`ChatOpenAI` を LLM として使用している場合は、環境変数 `OPENAI_API_KEY` が設定されていることを確認してください。 `chain.py` 内で LLM とエンベディングモデルを変更することができます。

また、このテンプレートで使用する以下の環境変数を設定することができます (デフォルト値は括弧内に示されています)。

- `POSTGRES_USER` (postgres)
- `POSTGRES_PASSWORD` (test)
- `POSTGRES_DB` (vectordb)
- `POSTGRES_HOST` (localhost)
- `POSTGRES_PORT` (5432)

PostgreSQL インスタンスがない場合は、Docker でローカルに実行することができます:

```bash
docker run \
  --name some-postgres \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=vectordb \
  -p 5432:5432 \
  postgres:16
```

後で再起動するには、上記の `--name` を使用します:

```bash
docker start some-postgres
```

### PostgreSQL データベースのセットアップ

`pgvector` 拡張機能を有効にするだけでなく、SQL クエリ内で意味検索を実行するためにはいくつかの設定が必要です。

PostgreSQL データベース上で RAG を実行するには、検索対象となる列のエンベディングを生成する必要があります。

この手順は [RAG empowered SQL cookbook](https://github.com/langchain-ai/langchain/blob/master/cookbook/retrieval_in_sql.ipynb) で説明されていますが、全体的なアプローチは以下のとおりです:
1. 列の一意の値を取得する
2. それらの値のエンベディングを生成する
3. エンベディングを別の列やテーブルに保存する

## 使用方法

このパッケージを使用するには、LangChain CLI がインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、このパッケージのみをインストールするには以下のように実行します:

```shell
langchain app new my-app --package sql-pgvector
```

既存のプロジェクトに追加する場合は、以下のように実行します:

```shell
langchain app add sql-pgvector
```

そして、`server.py` ファイルに以下のコードを追加します:

```python
from sql_pgvector import chain as sql_pgvector_chain

add_routes(app, sql_pgvector_chain, path="/sql-pgvector")
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

このディレクトリ内にいる場合は、以下のコマンドで LangServe インスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPI アプリが起動し、ローカルの [http://localhost:8000](http://localhost:8000) でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) でテンプレートを確認できます。
[http://127.0.0.1:8000/sql-pgvector/playground](http://127.0.0.1:8000/sql-pgvector/playground) でプレイグラウンドにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-pgvector")
```
