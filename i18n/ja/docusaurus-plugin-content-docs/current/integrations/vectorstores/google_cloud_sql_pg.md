---
translated: true
---

# Google Cloud SQL for PostgreSQL

> [Cloud SQL](https://cloud.google.com/sql) は、高パフォーマンス、シームレスな統合、および優れたスケーラビリティを提供する完全に管理されたリレーショナルデータベースサービスです。PostgreSQL、PostgreSQL、およびSQL Serverデータベースエンジンを提供しています。Cloud SQLのLangchainインテグレーションを活用して、AI駆動のエクスペリエンスを構築するためにデータベースアプリケーションを拡張できます。

このノートブックでは、`PostgresVectorStore`クラスを使用してベクトル埋め込みをCloud SQLに保存する方法について説明します。

パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-cloud-sql-pg-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-pg-python/blob/main/docs/vector_store.ipynb)

## 始める前に

このノートブックを実行するには、以下の作業が必要です:

 * [Google Cloudプロジェクトの作成](https://developers.google.com/workspace/guides/create-project)
 * [Cloud SQL Admin APIの有効化](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com)
 * [Cloud SQLインスタンスの作成](https://cloud.google.com/sql/docs/postgres/connect-instance-auth-proxy#create-instance)
 * [Cloud SQLデータベースの作成](https://cloud.google.com/sql/docs/postgres/create-manage-databases)
 * [データベースにユーザーを追加](https://cloud.google.com/sql/docs/postgres/create-manage-users)

### 🦜🔗 ライブラリのインストール

`langchain-google-cloud-sql-pg`インテグレーションライブラリと`langchain-google-vertexai`埋め込みサービスライブラリをインストールします。

```python
%pip install --upgrade --quiet  langchain-google-cloud-sql-pg langchain-google-vertexai
```

**Colab only:** 次のセルのコメントを外すか、ボタンを使用してカーネルを再起動します。Vertex AI Workbenchの場合は、上部のボタンを使用してターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloudプロジェクトにアクセスできるようにします。

* Colabを使ってこのノートブックを実行する場合は、以下のセルを使用して続行してください。
* Vertex AI Workbenchを使う場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順を確認してください。

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ Google Cloudプロジェクトの設定

このノートブック内でGoogle Cloudリソースを活用できるように、Google Cloudプロジェクトを設定します。

プロジェクトIDがわからない場合は、以下を試してください:

* `gcloud config list`を実行する
* `gcloud projects list`を実行する
* [プロジェクトIDの特定](https://support.google.com/googleapi/answer/7014113)のサポートページを参照する

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

## 基本的な使用方法

### Cloud SQLデータベースの値を設定

[Cloud SQL Instancesページ](https://console.cloud.google.com/sql?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687)からデータベースの値を見つけます。

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-pg-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### PostgresEngineコネクションプール

Cloud SQLをベクトルストアとして確立するための要件の1つは、`PostgresEngine`オブジェクトです。`PostgresEngine`は、Cloud SQLデータベースへの接続プールを構成し、アプリケーションからの成功した接続と業界のベストプラクティスを可能にします。

`PostgresEngine.from_instance()`を使って`PostgresEngine`を作成するには、4つのものを提供する必要があります:

1.   `project_id` : Cloud SQLインスタンスが存在するGoogle CloudプロジェクトのプロジェクトID。
1. `region` : Cloud SQLインスタンスが存在するリージョン。
1. `instance` : Cloud SQLインスタンスの名前。
1. `database` : Cloud SQLインスタンス上の接続するデータベースの名前。

デフォルトでは、[IAMデータベース認証](https://cloud.google.com/sql/docs/postgres/iam-authentication#iam-db-auth)がデータベース認証の方法として使用されます。このライブラリは、環境から取得された[アプリケーションデフォルトの資格情報(ADC)](https://cloud.google.com/docs/authentication/application-default-credentials)に属するIAMプリンシパルを使用します。

IAMデータベース認証の詳細については、以下をご覧ください:

* [IAMデータベース認証用のインスタンスの構成](https://cloud.google.com/sql/docs/postgres/create-edit-iam-instances)
* [IAMデータベース認証を使用したユーザーの管理](https://cloud.google.com/sql/docs/postgres/add-manage-iam-users)

オプションで、ユーザー名とパスワードを使用する[組み込みデータベース認証](https://cloud.google.com/sql/docs/postgres/built-in-authentication)も使用できます。`PostgresEngine.from_instance()`に`user`と`password`の引数を提供するだけです:

* `user` : 組み込みデータベース認証とログインに使用するデータベースユーザー
* `password` : 組み込みデータベース認証とログインに使用するデータベースパスワード

"**注意**: このチュートリアルは非同期インターフェイスを示しています。すべての非同期メソッドには対応する同期メソッドがあります。"

```python
from langchain_google_cloud_sql_pg import PostgresEngine

engine = await PostgresEngine.afrom_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### テーブルの初期化

`PostgresVectorStore`クラスにはデータベーステーブルが必要です。`PostgresEngine`エンジンには、適切なスキーマを持つテーブルを作成するのに役立つ`init_vectorstore_table()`ヘルパーメソッドがあります。

```python
from langchain_google_cloud_sql_pg import PostgresEngine

await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
)
```

### 埋め込みクラスインスタンスの作成

[LangChain埋め込みモデル](/docs/integrations/text_embedding/)を使用できます。
`VertexAIEmbeddings`を使用するには、Vertex AI APIを有効にする必要があるかもしれません。本番環境では、埋め込みモデルのバージョンを設定することをお勧めします。[テキスト埋め込みモデル](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings)の詳細をご覧ください。

```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```

```python
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### デフォルトのPostgresVectorStoreの初期化

```python
from langchain_google_cloud_sql_pg import PostgresVectorStore

store = await PostgresVectorStore.create(  # Use .create() to initialize an async vector store
    engine=engine,
    table_name=TABLE_NAME,
    embedding_service=embedding,
)
```

### テキストの追加

```python
import uuid

all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]

await store.aadd_texts(all_texts, metadatas=metadatas, ids=ids)
```

### テキストの削除

```python
await store.adelete([ids[1]])
```

### ドキュメントの検索

```python
query = "I'd like a fruit."
docs = await store.asimilarity_search(query)
print(docs)
```

### ベクトルによるドキュメントの検索

```python
query_vector = embedding.embed_query(query)
docs = await store.asimilarity_search_by_vector(query_vector, k=2)
print(docs)
```

## インデックスの追加

ベクトル検索クエリのスピードアップには、ベクトルインデックスを適用します。[ベクトルインデックス](https://cloud.google.com/blog/products/databases/faster-similarity-search-performance-with-pgvector-indexes)の詳細をご覧ください。

```python
from langchain_google_cloud_sql_pg.indexes import IVFFlatIndex

index = IVFFlatIndex()
await store.aapply_vector_index(index)
```

### 再インデックス

```python
await store.areindex()  # Re-index using default index name
```

### インデックスの削除

```python
await store.aadrop_vector_index()  # Delete index using default name
```

## カスタムベクトルストアの作成

ベクトルストアは、類似性検索にリレーショナルデータを活用できます。

カスタムメタデータ列を持つテーブルを作成します。

```python
from langchain_google_cloud_sql_pg import Column

# Set table name
TABLE_NAME = "vectorstore_custom"

await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # VertexAI model: textembedding-gecko@latest
    metadata_columns=[Column("len", "INTEGER")],
)


# Initialize PostgresVectorStore
custom_store = await PostgresVectorStore.create(
    engine=engine,
    table_name=TABLE_NAME,
    embedding_service=embedding,
    metadata_columns=["len"],
    # Connect to a existing VectorStore by customizing the table schema:
    # id_column="uuid",
    # content_column="documents",
    # embedding_column="vectors",
)
```

### メタデータフィルターを使ってドキュメントを検索

```python
import uuid

# Add texts to the Vector Store
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]
await store.aadd_texts(all_texts, metadatas=metadatas, ids=ids)

# Use filter on search
docs = await custom_store.asimilarity_search_by_vector(query_vector, filter="len >= 6")

print(docs)
```
