---
translated: true
---

# Google AlloyDB for PostgreSQL

> [AlloyDB](https://cloud.google.com/alloydb)は、高パフォーマンス、シームレスな統合、そして驚くべきスケーラビリティを提供する完全に管理されたリレーショナルデータベースサービスです。AlloyDBは100%PostgreSQLと互換性があります。AlloyDBのLangchainインテグレーションを活用して、AI駆動のエクスペリエンスを構築するためにデータベースアプリケーションを拡張できます。

このノートブックでは、ベクトル埋め込みを保存するために `AlloyDBVectorStore` クラスを使用して `AlloyDB for PostgreSQL` を使用する方法について説明します。

パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-alloydb-pg-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-alloydb-pg-python/blob/main/docs/vector_store.ipynb)

## 始める前に

このノートブックを実行するには、以下を行う必要があります:

 * [Google Cloud Projectを作成する](https://developers.google.com/workspace/guides/create-project)
 * [AlloyDB APIを有効化する](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)
 * [AlloyDBクラスターとインスタンスを作成する。](https://cloud.google.com/alloydb/docs/cluster-create)
 * [AlloyDBデータベースを作成する。](https://cloud.google.com/alloydb/docs/quickstart/create-and-connect)
 * [データベースにユーザーを追加する。](https://cloud.google.com/alloydb/docs/database-users/about)

### 🦜🔗 ライブラリのインストール

`langchain-google-alloydb-pg`インテグレーションライブラリと`langchain-google-vertexai`埋め込みサービスライブラリをインストールします。

```python
%pip install --upgrade --quiet  langchain-google-alloydb-pg langchain-google-vertexai
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

* Colabを使ってこのノートブックを実行する場合は、以下のセルを使用して続行してください。
* Vertex AI Workbenchを使う場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順を確認してください。

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ Google Cloudプロジェクトの設定

このノートブック内でGoogle Cloudリソースを活用できるように、Google Cloudプロジェクトを設定します。

プロジェクトIDがわからない場合は、以下を試してください:

* `gcloud config list`を実行する。
* `gcloud projects list`を実行する。
* サポートページ: [プロジェクトIDの特定](https://support.google.com/googleapi/answer/7014113)を参照する。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

## 基本的な使用方法

### AlloyDBデータベースの値を設定する

[AlloyDBインスタンスページ](https://console.cloud.google.com/alloydb/clusters)からデータベースの値を見つけてください。

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
CLUSTER = "my-cluster"  # @param {type: "string"}
INSTANCE = "my-primary"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### AlloyDBEngineコネクションプール

AlloyDBをベクトルストアとして確立するための要件の1つは、`AlloyDBEngine`オブジェクトです。`AlloyDBEngine`は、業界のベストプラクティスに従って、アプリケーションから正常な接続を可能にするためのデータベース接続プールを構成します。

`AlloyDBEngine.from_instance()`を使って`AlloyDBEngine`を作成するには、5つのものを提供する必要があります:

1. `project_id`: AlloyDBインスタンスが存在するGoogle CloudプロジェクトのプロジェクトID。
1. `region`: AlloyDBインスタンスが存在するリージョン。
1. `cluster`: AlloyDBクラスターの名前。
1. `instance`: AlloyDBインスタンスの名前。
1. `database`: AlloyDBインスタンス上の接続するデータベースの名前。

デフォルトでは、[IAMデータベース認証](https://cloud.google.com/alloydb/docs/connect-iam)がデータベース認証の方法として使用されます。このライブラリは、環境から取得された[アプリケーションデフォルトの資格情報(ADC)](https://cloud.google.com/docs/authentication/application-default-credentials)に属するIAMプリンシパルを使用します。

オプションで、ユーザー名とパスワードを使用する[組み込みデータベース認証](https://cloud.google.com/alloydb/docs/database-users/about)も使用できます。`AlloyDBEngine.from_instance()`に`user`と`password`の引数を提供するだけです:

* `user`: 組み込みデータベース認証とログインに使用するデータベースユーザー
* `password`: 組み込みデータベース認証とログインに使用するデータベースパスワード。

**注意:** このチュートリアルは非同期インターフェイスを示しています。すべての非同期メソッドには対応する同期メソッドがあります。

```python
from langchain_google_alloydb_pg import AlloyDBEngine

engine = await AlloyDBEngine.afrom_instance(
    project_id=PROJECT_ID,
    region=REGION,
    cluster=CLUSTER,
    instance=INSTANCE,
    database=DATABASE,
)
```

### テーブルの初期化

`AlloyDBVectorStore`クラスにはデータベーステーブルが必要です。`AlloyDBEngine`エンジンには、適切なスキーマを持つテーブルを作成するのに役立つ`init_vectorstore_table()`ヘルパーメソッドがあります。

```python
await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
)
```

### 埋め込みクラスインスタンスの作成

[LangChain埋め込みモデル](/docs/integrations/text_embedding/)を任意に使用できます。
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

### デフォルトのAlloyDBVectorStoreの初期化

```python
from langchain_google_alloydb_pg import AlloyDBVectorStore

store = await AlloyDBVectorStore.create(
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
from langchain_google_alloydb_pg.indexes import IVFFlatIndex

index = IVFFlatIndex()
await store.aapply_vector_index(index)
```

### 再インデックス

```python
await store.areindex()  # Re-index using default index name
```

### インデックスの削除

```python
await store.adrop_vector_index()  # Delete index using default name
```

## カスタムベクトルストアの作成

ベクトルストアは、類似性検索にリレーショナルデータを活用できます。

カスタムメタデータ列を持つテーブルを作成します。

```python
from langchain_google_alloydb_pg import Column

# Set table name
TABLE_NAME = "vectorstore_custom"

await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # VertexAI model: textembedding-gecko@latest
    metadata_columns=[Column("len", "INTEGER")],
)


# Initialize AlloyDBVectorStore
custom_store = await AlloyDBVectorStore.create(
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

### メタデータフィルターを使ってドキュメントを検索する

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
