---
translated: true
---

# self-query-supabase

このテンプレートにより、Supabaseの自然言語構造化クエリが可能になります。

[Supabase](https://supabase.com/docs)は、[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL)の上に構築された、Firebaseの代替となるオープンソースのサービスです。

[pgvector](https://github.com/pgvector/pgvector)を使用して、テーブル内にエンベディングを保存します。

## 環境設定

OpenAIモデルにアクセスするために、`OPENAI_API_KEY`環境変数を設定してください。

`OPENAI_API_KEY`を取得するには、OpenAIアカウントの[API keys](https://platform.openai.com/account/api-keys)に移動し、新しいシークレットキーを作成してください。

`SUPABASE_URL`と`SUPABASE_SERVICE_KEY`を見つけるには、Supabaseプロジェクトの[API settings](https://supabase.com/dashboard/project/_/settings/api)に移動してください。

- `SUPABASE_URL`はプロジェクトのURLに対応します
- `SUPABASE_SERVICE_KEY`は`service_role`APIキーに対応します

```shell
export SUPABASE_URL=
export SUPABASE_SERVICE_KEY=
export OPENAI_API_KEY=
```

## Supabaseデータベースのセットアップ

まだ設定していない場合は、以下の手順でSupabaseデータベースをセットアップしてください。

1. https://database.new にアクセスして、Supabaseデータベースをプロビジョニングします。
2. スタジオの[SQLエディター](https://supabase.com/dashboard/project/_/sql/new)に移動し、以下のスクリプトを実行して`pgvector`を有効化し、データベースをベクトルストアとして設定します:

   ```sql
   -- pgvectorエクステンションを有効化してエンベディングベクトルを扱えるようにする
   create extension if not exists vector;

   -- ドキュメントを保存するテーブルを作成する
   create table
     documents (
       id uuid primary key,
       content text, -- Document.pageContentに対応
       metadata jsonb, -- Document.metadataに対応
       embedding vector (1536) -- OpenAIエンベディングには1536が適切、必要に応じて変更する
     );

   -- ドキュメントを検索する関数を作成する
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

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、このパッケージをインストールします:

```shell
langchain app new my-app --package self-query-supabase
```

既存のプロジェクトに追加する場合は、以下を実行してください:

```shell
langchain app add self-query-supabase
```

`server.py`ファイルに以下のコードを追加してください:

```python
from self_query_supabase.chain import chain as self_query_supabase_chain

add_routes(app, self_query_supabase_chain, path="/self-query-supabase")
```

(オプション) LangSmithにアクセスできる場合は、LangChainアプリケーションのトレース、モニタリング、デバッグに使用できます。アクセスできない場合はこのセクションをスキップしてください。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のコマンドでLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000)でローカルにFastAPIアプリが起動します。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます
[http://127.0.0.1:8000/self-query-supabase/playground](http://127.0.0.1:8000/self-query-supabase/playground)でPlaygroundにアクセスできます

コードからテンプレートにアクセスするには以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/self-query-supabase")
```

TODO: Supabaseデータベースの設定とパッケージのインストール方法の説明
