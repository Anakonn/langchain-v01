---
translated: true
---

# Google Cloud SQL for MySQL

> [Cloud SQL](https://cloud.google.com/sql) は、高パフォーマンス、シームレスな統合、および優れたスケーラビリティを提供する完全に管理されたリレーショナルデータベースサービスです。PostgreSQL、MySQL、SQL Serverのデータベースエンジンを提供しています。Cloud SQLのLangChainインテグレーションを活用して、AI駆動のエクスペリエンスを構築するためにデータベースアプリケーションを拡張できます。

このノートブックでは、`MySQLVectorStore`クラスを使用してベクトル埋め込みをCloud SQLに保存する方法について説明します。

パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/docs/vector_store.ipynb)

## 始める前に

このノートブックを実行するには、以下の作業が必要です:

 * [Google Cloudプロジェクトの作成](https://developers.google.com/workspace/guides/create-project)
 * [Cloud SQL Admin APIの有効化](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com)
 * [Cloud SQLインスタンスの作成](https://cloud.google.com/sql/docs/mysql/connect-instance-auth-proxy#create-instance) (バージョンは**8.0.36**以上で、**cloudsql_vector**データベースフラグが"On"に設定されている必要があります)
 * [Cloud SQLデータベースの作成](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
 * [データベースにユーザーの追加](https://cloud.google.com/sql/docs/mysql/create-manage-users)

### 🦜🔗 ライブラリのインストール

`langchain-google-cloud-sql-mysql`インテグレーションライブラリと、埋め込みサービスのライブラリ`langchain-google-vertexai`をインストールします。

```python
%pip install --upgrade --quiet langchain-google-cloud-sql-mysql langchain-google-vertexai
```

**Colab only:** 次のセルのコメントを外すか、ボタンを使用してカーネルを再起動してください。Vertex AI Workbenchの場合は、上部のボタンを使用してターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloudプロジェクトにアクセスできるようにします。

* Colabでこのノートブックを実行する場合は、以下のセルを使用して続行してください。
* Vertex AI Workbenchを使用する場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順を確認してください。

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

### Cloud SQLデータベースの値を設定する

[Cloud SQL Instancesページ](https://console.cloud.google.com/sql?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687)でデータベースの値を確認してください。

**注意:** MySQLベクトルサポートは、バージョン**>= 8.0.36**のMySQLインスタンスでのみ利用可能です。

既存のインスタンスの場合、[自己サービスのメンテナンスアップデート](https://cloud.google.com/sql/docs/mysql/self-service-maintenance)を実行して、メンテナンスバージョンを**MYSQL_8_0_36.R20240401.03_00**以降に更新する必要がある場合があります。更新後、[データベースフラグを構成](https://cloud.google.com/sql/docs/mysql/flags)して、新しい**cloudsql_vector**フラグを"On"に設定します。

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-mysql-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### MySQLEngineコネクションプール

Cloud SQLをベクトルストアとして確立するための要件の1つは、`MySQLEngine`オブジェクトです。`MySQLEngine`は、Cloud SQLデータベースへの接続プールを構成し、アプリケーションからの成功した接続と業界のベストプラクティスを可能にします。

`MySQLEngine.from_instance()`を使用して`MySQLEngine`を作成するには、4つのものを提供する必要があります:

1. `project_id`: Cloud SQLインスタンスが存在するGoogle CloudプロジェクトのプロジェクトID。
1. `region`: Cloud SQLインスタンスが存在するリージョン。
1. `instance`: Cloud SQLインスタンスの名前。
1. `database`: Cloud SQLインスタンス上の接続するデータベースの名前。

デフォルトでは、[IAMデータベース認証](https://cloud.google.com/sql/docs/mysql/iam-authentication#iam-db-auth)がデータベース認証の方法として使用されます。このライブラリは、環境から取得した[アプリケーションデフォルトの資格情報(ADC)](https://cloud.google.com/docs/authentication/application-default-credentials)に属するIAMプリンシパルを使用します。

IAMデータベース認証の詳細については、以下を参照してください:

* [IAMデータベース認証用のインスタンスの構成](https://cloud.google.com/sql/docs/mysql/create-edit-iam-instances)
* [IAMデータベース認証を使用したユーザーの管理](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users)

オプションで、ユーザー名とパスワードを使用する[組み込みデータベース認証](https://cloud.google.com/sql/docs/mysql/built-in-authentication)も使用できます。`MySQLEngine.from_instance()`に`user`と`password`の引数を提供するだけです:

* `user`: 組み込みデータベース認証とログインに使用するデータベースユーザー
* `password`: 組み込みデータベース認証とログインに使用するデータベースパスワード

```python
from langchain_google_cloud_sql_mysql import MySQLEngine

engine = MySQLEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### テーブルの初期化

`MySQLVectorStore`クラスにはデータベーステーブルが必要です。`MySQLEngine`クラスには、適切なスキーマを持つテーブルを作成するのに役立つ`init_vectorstore_table()`ヘルパーメソッドがあります。

```python
engine.init_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
)
```

### 埋め込みクラスインスタンスの作成

[LangChain埋め込みモデル](/docs/integrations/text_embedding/)を使用できます。
`VertexAIEmbeddings`を使用するには、Vertex AI APIを有効にする必要があるかもしれません。

本番環境では、埋め込みモデルのバージョンを固定することをお勧めします。[テキスト埋め込みモデル](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings)の詳細をご覧ください。

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

### MySQLVectorStoreの初期化

`MySQLVectorStore`クラスを初期化するには、3つのものを提供する必要があります:

1. `engine` - `MySQLEngine`エンジンのインスタンス。
1. `embedding_service` - LangChainの埋め込みモデルのインスタンス。
1. `table_name` : ベクトルストアとして使用するCloud SQLデータベース内のテーブル名。

```python
from langchain_google_cloud_sql_mysql import MySQLVectorStore

store = MySQLVectorStore(
    engine=engine,
    embedding_service=embedding,
    table_name=TABLE_NAME,
)
```

### テキストの追加

```python
import uuid

all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]

store.add_texts(all_texts, metadatas=metadatas, ids=ids)
```

### テキストの削除

IDでベクトルストアからベクトルを削除します。

```python
store.delete([ids[1]])
```

### ドキュメントの検索

```python
query = "I'd like a fruit."
docs = store.similarity_search(query)
print(docs[0].page_content)
```

```output
Pineapple
```

### ベクトルによるドキュメントの検索

与えられた埋め込みベクトルに似たドキュメントを検索することも可能です。`similarity_search_by_vector`を使用すると、文字列ではなくベクトルをパラメータとして受け取ります。

```python
query_vector = embedding.embed_query(query)
docs = store.similarity_search_by_vector(query_vector, k=2)
print(docs)
```

```output
[Document(page_content='Pineapple', metadata={'len': 9}), Document(page_content='Banana', metadata={'len': 6})]
```

### インデックスの追加

ベクトル検索クエリを高速化するためにベクトルインデックスを適用します。[MySQLベクトルインデックス](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/src/langchain_google_cloud_sql_mysql/indexes.py)についてもっと学びましょう。

**注意:** IAMデータベース認証(デフォルトの使用法)の場合、特権付きのデータベースユーザーがベクトルインデックスの完全な制御を行うために、IAMデータベースユーザーに以下の権限を付与する必要があります。

```sql
GRANT EXECUTE ON PROCEDURE mysql.create_vector_index TO '<IAM_DB_USER>'@'%';
GRANT EXECUTE ON PROCEDURE mysql.alter_vector_index TO '<IAM_DB_USER>'@'%';
GRANT EXECUTE ON PROCEDURE mysql.drop_vector_index TO '<IAM_DB_USER>'@'%';
GRANT SELECT ON mysql.vector_indexes TO '<IAM_DB_USER>'@'%';
```

```python
from langchain_google_cloud_sql_mysql import VectorIndex

store.apply_vector_index(VectorIndex())
```

### インデックスの削除

```python
store.drop_vector_index()
```

## 高度な使用法

### カスタムメタデータを持つMySQLVectorStoreの作成

ベクトルストアは、関係データを利用してシミラリティ検索をフィルタリングできます。

カスタムメタデータ列を持つテーブルと`MySQLVectorStore`インスタンスを作成します。

```python
from langchain_google_cloud_sql_mysql import Column

# set table name
CUSTOM_TABLE_NAME = "vector_store_custom"

engine.init_vectorstore_table(
    table_name=CUSTOM_TABLE_NAME,
    vector_size=768,  # VertexAI model: textembedding-gecko@latest
    metadata_columns=[Column("len", "INTEGER")],
)


# initialize MySQLVectorStore with custom metadata columns
custom_store = MySQLVectorStore(
    engine=engine,
    embedding_service=embedding,
    table_name=CUSTOM_TABLE_NAME,
    metadata_columns=["len"],
    # connect to an existing VectorStore by customizing the table schema:
    # id_column="uuid",
    # content_column="documents",
    # embedding_column="vectors",
)
```

### メタデータフィルタを使ったドキュメントの検索

作業するドキュメントを絞り込むことが役立つ場合があります。

例えば、`filter`引数を使ってメタデータでドキュメントをフィルタリングできます。

```python
import uuid

# add texts to the vector store
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]
custom_store.add_texts(all_texts, metadatas=metadatas, ids=ids)

# use filter on search
query_vector = embedding.embed_query("I'd like a fruit.")
docs = custom_store.similarity_search_by_vector(query_vector, filter="len >= 6")

print(docs)
```

```output
[Document(page_content='Pineapple', metadata={'len': 9}), Document(page_content='Banana', metadata={'len': 6}), Document(page_content='Apples and oranges', metadata={'len': 18}), Document(page_content='Cars and airplanes', metadata={'len': 18})]
```
