---
translated: true
---

# rag_lantern

このテンプレートは Lantern を使用して RAG を実行します。

[Lantern](https://lantern.dev) は [PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL) の上に構築されたオープンソースのベクトルデータベースです。データベース内でベクトル検索とエンベディング生成を可能にします。

## 環境設定

OpenAI モデルにアクセスするために、`OPENAI_API_KEY` 環境変数を設定してください。

`OPENAI_API_KEY` を取得するには、OpenAI アカウントの [API keys](https://platform.openai.com/account/api-keys) に移動し、新しいシークレットキーを作成してください。

`LANTERN_URL` と `LANTERN_SERVICE_KEY` を見つけるには、Lantern プロジェクトの [API settings](https://lantern.dev/dashboard/project/_/settings/api) に移動してください。

- `LANTERN_URL` はプロジェクト URL に対応します
- `LANTERN_SERVICE_KEY` は `service_role` API キーに対応します

```shell
export LANTERN_URL=
export LANTERN_SERVICE_KEY=
export OPENAI_API_KEY=
```

## Lantern データベースのセットアップ

まだ Lantern データベースをセットアップしていない場合は、以下の手順に従ってください。

1. [https://lantern.dev](https://lantern.dev) にアクセスして Lantern データベースを作成してください。
2. お気に入りの SQL クライアントで SQL エディタに移動し、以下のスクリプトを実行してデータベースをベクトルストアとしてセットアップしてください:

   ```sql
   -- ドキュメントを保存するテーブルを作成
   create table
     documents (
       id uuid primary key,
       content text, -- Document.pageContent に対応
       metadata jsonb, -- Document.metadata に対応
       embedding REAL[1536] -- OpenAI エンベディングの場合は 1536、必要に応じて変更
     );

   -- ドキュメントを検索する関数を作成
   create function match_documents (
     query_embedding REAL[1536],
     filter jsonb default '{}'
   ) returns table (
     id uuid,
     content text,
     metadata jsonb,
     similarity float
   ) language plpgsql as $$
   #variable_conflict use_column
   begin
     return query
     select
       id,
       content,
       metadata,
       1 - (documents.embedding <=> query_embedding) as similarity
     from documents
     where metadata @> filter
     order by documents.embedding <=> query_embedding;
   end;
   $$;
   ```

## 環境変数の設定

[`Lantern`](https://python.langchain.com/docs/integrations/vectorstores/lantern) と [`OpenAIEmbeddings`](https://python.langchain.com/docs/integrations/text_embedding/openai) を使用しているため、それらの API キーをロードする必要があります。

## 使用方法

まず、LangChain CLI をインストールします:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-lantern
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add rag-lantern
```

そして、`server.py` ファイルに以下のコードを追加してください:

```python
from rag_lantern.chain import chain as rag_lantern_chain

add_routes(app, rag_lantern_chain, path="/rag-lantern")
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

これにより、[http://localhost:8000](http://localhost:8000) でローカルサーバーが起動します。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-lantern/playground](http://127.0.0.1:8000/rag-lantern/playground) でプレイグラウンドにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-lantern")
```
