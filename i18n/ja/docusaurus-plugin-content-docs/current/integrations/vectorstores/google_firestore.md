---
sidebar_label: Firestore
translated: true
---

# Google Firestore (ネイティブモード)

> [Firestore](https://cloud.google.com/firestore) は、需要に応じてスケーリングするサーバーレスのドキュメント指向データベースです。FirestoreのLangchain統合を活用して、AI駆動の体験を構築するためにデータベースアプリケーションを拡張します。

このノートブックでは、[Firestore](https://cloud.google.com/firestore) を使用してベクトルを保存し、`FirestoreVectorStore`クラスを使用してそれらをクエリする方法について説明します。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/vectorstores.ipynb)

## 始める前に

このノートブックを実行するには、以下のことを行う必要があります：

* [Google Cloud プロジェクトを作成](https://developers.google.com/workspace/guides/create-project)
* [Firestore APIを有効にする](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [Firestore データベースを作成する](https://cloud.google.com/firestore/docs/manage-databases)

このノートブックの実行環境でデータベースへのアクセスが確認された後、以下の値を入力し、サンプルスクリプトを実行する前にセルを実行します。

```python
# @markdown Please specify a source for demo purpose.
COLLECTION_NAME = "test"  # @param {type:"CollectionReference"|"string"}
```

### 🦜🔗 ライブラリのインストール

統合は独自の `langchain-google-firestore` パッケージに存在するため、インストールする必要があります。このノートブックでは、Google Generative AI 埋め込みを使用するために `langchain-google-genai` もインストールします。

```python
%pip install -upgrade --quiet langchain-google-firestore langchain-google-vertexai
```

**Colabのみ**: カーネルを再起動するには、以下のセルのコメントを解除するか、ボタンを使用してカーネルを再起動します。Vertex AI Workbenchでは、上部のボタンを使用してターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloud プロジェクトを設定する

このノートブック内でGoogle Cloudリソースを活用できるように、Google Cloudプロジェクトを設定します。

プロジェクトIDがわからない場合は、以下を試してください：

* `gcloud config list` を実行する。
* `gcloud projects list` を実行する。
* サポートページを見る: [プロジェクトIDを見つける](https://support.google.com/googleapi/answer/7014113)。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "extensions-testing"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloudプロジェクトにアクセスします。

- このノートブックを実行するためにColabを使用している場合は、以下のセルを使用して続行してください。
- Vertex AI Workbenchを使用している場合は、セットアップ手順を[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)で確認してください。

```python
from google.colab import auth

auth.authenticate_user()
```

# 基本的な使い方

### FirestoreVectorStoreの初期化

`FirestoreVectorStore` を使用すると、Firestoreデータベースに新しいベクトルを保存できます。Google Generative AIを含む任意のモデルからの埋め込みを保存するために使用できます。

```python
from langchain_google_firestore import FirestoreVectorStore
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest",
    project=PROJECT_ID,
)

# Sample data
ids = ["apple", "banana", "orange"]
fruits_texts = ['{"name": "apple"}', '{"name": "banana"}', '{"name": "orange"}']

# Create a vector store
vector_store = FirestoreVectorStore(
    collection="fruits",
    embedding=embedding,
)

# Add the fruits to the vector store
vector_store.add_texts(fruits_texts, ids=ids)
```

省略形として、`from_texts` および `from_documents` メソッドを使用して、一度にベクトルを初期化および追加することができます。

```python
vector_store = FirestoreVectorStore.from_texts(
    collection="fruits",
    texts=fruits_texts,
    embedding=embedding,
)
```

```python
from langchain_core.documents import Document

fruits_docs = [Document(page_content=fruit) for fruit in fruits_texts]

vector_store = FirestoreVectorStore.from_documents(
    collection="fruits",
    documents=fruits_docs,
    embedding=embedding,
)
```

### ベクトルの削除

`delete` メソッドを使用してデータベースからベクトルを持つドキュメントを削除できます。削除したいベクトルのドキュメントIDを提供する必要があります。これにより、他のフィールドも含め、データベースからドキュメント全体が削除されます。

```python
vector_store.delete(ids)
```

### ベクトルの更新

ベクトルの更新は、それらを追加するのと似ています。ドキュメントIDと新しいベクトルを提供することにより、`add` メソッドを使用してドキュメントのベクトルを更新できます。

```python
fruit_to_update = ['{"name": "apple","price": 12}']
apple_id = "apple"

vector_store.add_texts(fruit_to_update, ids=[apple_id])
```

## 類似性検索

`FirestoreVectorStore` を使用して、保存されているベクトルに対して類似性検索を実行できます。これは、類似したドキュメントやテキストを見つけるのに役立ちます。

```python
vector_store.similarity_search("I like fuji apples", k=3)
```

```python
vector_store.max_marginal_relevance_search("fuji", 5)
```

`filters` パラメータを使用して、検索にプリフィルタを追加できます。これは、特定のフィールドや値でフィルタリングするのに便利です。

```python
from google.cloud.firestore_v1.base_query import FieldFilter

vector_store.max_marginal_relevance_search(
    "fuji", 5, filters=FieldFilter("content", "==", "apple")
)
```

### 接続と認証のカスタマイズ

```python
from google.api_core.client_options import ClientOptions
from google.cloud import firestore
from langchain_google_firestore import FirestoreVectorStore

client_options = ClientOptions()
client = firestore.Client(client_options=client_options)

# Create a vector store
vector_store = FirestoreVectorStore(
    collection="fruits",
    embedding=embedding,
    client=client,
)
```
