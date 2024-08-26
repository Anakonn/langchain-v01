---
translated: true
---

# Supabase (Postgres)

>[Supabase](https://supabase.com/docs)は、オープンソースの`Firebase`の代替品です。
>`Supabase`は`PostgreSQL`の上に構築されており、強力な`SQL`クエリ機能を提供し、既存のツールやフレームワークとの簡単なインターフェースを可能にします。

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL)、通称`Postgres`は、拡張性と`SQL`準拠に重点を置いた、無料でオープンソースのリレーショナルデータベース管理システム(RDBMS)です。

>[Supabase](https://supabase.com/docs/guides/ai)は、Postgresおよびpgvectorを使用してAIアプリケーションを開発するためのオープンソースツールキットを提供しています。Supabaseクライアントライブラリを使用して、ベクトル埋め込みを大規模に保存、インデックス化、クエリすることができます。

このノートブックでは、`Supabase`ベクトルストアをラップした`SelfQueryRetriever`をデモンストレーションします。

具体的には以下を行います:
1. Supabaseデータベースの作成
2. `pgvector`拡張機能の有効化
3. `documents`テーブルと`match_documents`関数の作成。これらは`SupabaseVectorStore`で使用されます。
4. サンプルドキュメントをベクトルストア(データベーステーブル)にロードする
5. 自己クエリ検索リトリーバーを構築してテストする

## Supabaseデータベースのセットアップ

1. https://database.new にアクセスして、Supabaseデータベースをプロビジョニングします。
2. スタジオの[SQLエディター](https://supabase.com/dashboard/project/_/sql/new)に移動し、以下のスクリプトを実行して`pgvector`を有効化し、ベクトルストアとしてデータベースを設定します:
    ```sql
    -- pgvectorの拡張機能を有効化してエンベディングベクトルを扱う
    create extension if not exists vector;

    -- ドキュメントを保存するテーブルを作成
    create table
      documents (
        id uuid primary key,
        content text, -- Document.pageContentに対応
        metadata jsonb, -- Document.metadataに対応
        embedding vector (1536) -- OpenAI埋め込みの場合は1536、必要に応じて変更
      );

    -- ドキュメントを検索する関数を作成
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

## Supabaseベクトルストアの作成

次に、Supabaseベクトルストアを作成し、いくつかのデータを入力しましょう。映画のサマリーを含むデモ用のドキュメントセットを用意しました。

最新バージョンの`langchain`と`openai`サポートをインストールしてください:

```python
%pip install --upgrade --quiet  langchain langchain-openai tiktoken
```

自己クエリ検索リトリーバーを使用するには、`lark`をインストールする必要があります:

```python
%pip install --upgrade --quiet  lark
```

また、`supabase`パッケージも必要です:

```python
%pip install --upgrade --quiet  supabase
```

`SupabaseVectorStore`と`OpenAIEmbeddings`を使用するため、APIキーをロードする必要があります。

- `SUPABASE_URL`と`SUPABASE_SERVICE_KEY`を見つけるには、Supabaseプロジェクトの[API設定](https://supabase.com/dashboard/project/_/settings/api)に移動します。
  - `SUPABASE_URL`はプロジェクトURLに対応します
  - `SUPABASE_SERVICE_KEY`は`service_role`APIキーに対応します

- `OPENAI_API_KEY`を取得するには、OpenAIアカウントの[APIキー](https://platform.openai.com/account/api-keys)ページにアクセスし、新しいシークレットキーを作成します。

```python
import getpass
import os

os.environ["SUPABASE_URL"] = getpass.getpass("Supabase URL:")
os.environ["SUPABASE_SERVICE_KEY"] = getpass.getpass("Supabase Service Key:")
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

_オプション:_ SupabaseとOpenAIのAPIキーを`.env`ファイルに保存している場合は、[`dotenv`](https://github.com/theskumar/python-dotenv)でロードできます。

```python
%pip install --upgrade --quiet  python-dotenv
```

```python
from dotenv import load_dotenv

load_dotenv()
```

まずはSupabaseクライアントを作成し、OpenAI埋め込みクラスをインスタンス化しましょう。

```python
import os

from langchain_community.vectorstores import SupabaseVectorStore
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from supabase.client import Client, create_client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

embeddings = OpenAIEmbeddings()
```

次にドキュメントを作成します。

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "science fiction"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "year": 1979,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
            "rating": 9.9,
        },
    ),
]

vectorstore = SupabaseVectorStore.from_documents(
    docs,
    embeddings,
    client=supabase,
    table_name="documents",
    query_name="match_documents",
)
```

## 自己クエリ検索リトリーバーの作成

リトリーバーをインスタンス化するには、ドキュメントのメタデータフィールドと、ドキュメントの内容の簡単な説明を事前に提供する必要があります。

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string or list[string]",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="director",
        description="The name of the movie director",
        type="string",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## テストしてみる

さて、実際にリトリーバーを使ってみましょう!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women?")
```

```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction')]) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before (or on) 2005 that's all about toys, and preferably is animated"
)
```

```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LTE: 'lte'>, attribute='year', value=2005), Comparison(comparator=<Comparator.LIKE: 'like'>, attribute='genre', value='animated')]) limit=None
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

## フィルターkの設定

自己クエリ検索リトリーバーを使って、取得するドキュメントの数`k`を指定することもできます。

`enable_limit=True`をコンストラクタに渡すことで、これを行うことができます。

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

```python
# This example only specifies a relevant query
retriever.invoke("what are two movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```
