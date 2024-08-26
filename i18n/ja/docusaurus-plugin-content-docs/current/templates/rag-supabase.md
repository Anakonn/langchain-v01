---
translated: true
---

# rag_supabase

このテンプレートは Supabase を使用して RAG を実行します。

[Supabase](https://supabase.com/docs) は、オープンソースの Firebase の代替品です。[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL) の上に構築されており、[pgvector](https://github.com/pgvector/pgvector) を使用してテーブル内の埋め込みを保存する、無料でオープンソースのリレーショナルデータベース管理システム (RDBMS) です。

## 環境設定

OpenAI モデルにアクセスするには、`OPENAI_API_KEY` 環境変数を設定する必要があります。

`OPENAI_API_KEY` を取得するには、OpenAI アカウントの [API keys](https://platform.openai.com/account/api-keys) に移動し、新しいシークレットキーを作成します。

`SUPABASE_URL` と `SUPABASE_SERVICE_KEY` を見つけるには、Supabase プロジェクトの [API settings](https://supabase.com/dashboard/project/_/settings/api) に移動します。

- `SUPABASE_URL` はプロジェクト URL に対応します
- `SUPABASE_SERVICE_KEY` は `service_role` API キーに対応します

```shell
export SUPABASE_URL=
export SUPABASE_SERVICE_KEY=
export OPENAI_API_KEY=
```

## Supabase データベースのセットアップ

まだ Supabase データベースをセットアップしていない場合は、以下の手順に従ってください。

1. https://database.new にアクセスして Supabase データベースをプロビジョニングします。
2. スタジオで [SQL editor](https://supabase.com/dashboard/project/_/sql/new) に移動し、次のスクリプトを実行して `pgvector` を有効化し、データベースをベクトルストアとして設定します:

   ```sql
   -- pgvector 拡張を有効化して埋め込みベクトルを扱えるようにする
   create extension if not exists vector;

   -- 文書を保存するテーブルを作成する
   create table
     documents (
       id uuid primary key,
       content text, -- Document.pageContent に対応
       metadata jsonb, -- Document.metadata に対応
       embedding vector (1536) -- OpenAI 埋め込みには 1536 が適切、必要に応じて変更する
     );

   -- 文書を検索する関数を作成する
   create function match_documents (
     query_embedding vector (1536),
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

[`SupabaseVectorStore`](https://python.langchain.com/docs/integrations/vectorstores/supabase) と [`OpenAIEmbeddings`](https://python.langchain.com/docs/integrations/text_embedding/openai) を使用するため、それらの API キーをロードする必要があります。

## 使用方法

まず、LangChain CLI をインストールします:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package rag-supabase
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add rag-supabase
```

そして、`server.py` ファイルに次のコードを追加します:

```python
from rag_supabase.chain import chain as rag_supabase_chain

add_routes(app, rag_supabase_chain, path="/rag-supabase")
```

(オプション) LangSmith を設定しましょう。
LangSmith は、LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。
LangSmith に登録するには[こちら](https://smith.langchain.com/)から行えます。
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

すべてのテンプレートは [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) で確認できます。
プレイグラウンドは [http://127.0.0.1:8000/rag-supabase/playground](http://127.0.0.1:8000/rag-supabase/playground) からアクセスできます。

コードからテンプレートにアクセスするには、次のように実行します:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-supabase")
```

TODO: Supabase データベースのセットアップの詳細を追加する
