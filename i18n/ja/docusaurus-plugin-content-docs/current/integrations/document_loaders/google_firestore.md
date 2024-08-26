---
translated: true
---

# Google Firestore (ネイティブモード)

> [Firestore](https://cloud.google.com/firestore) は、どのような需要にも対応するサーバーレスのドキュメント指向データベースです。FirestoreのLangchain統合を活用して、データベースアプリケーションを拡張し、AI対応の体験を構築します。

このノートブックでは、`FirestoreLoader`および`FirestoreSaver`を使用して[Firestore](https://cloud.google.com/firestore)で[langchainドキュメントを保存、読み込み、削除](/docs/modules/data_connection/document_loaders/)する方法について説明します。

パッケージの詳細は[GitHub](https://github.com/googleapis/langchain-google-firestore-python/)で確認できます。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/document_loader.ipynb)

## 始める前に

このノートブックを実行するには、次のことを行う必要があります:

* [Google Cloudプロジェクトを作成](https://developers.google.com/workspace/guides/create-project)
* [Firestore APIを有効化](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [Firestoreデータベースを作成](https://cloud.google.com/firestore/docs/manage-databases)

このノートブックの実行環境でデータベースへのアクセスが確認された後、次の値を入力し、例のスクリプトを実行する前にセルを実行します。

```python
# @markdown Please specify a source for demo purpose.
SOURCE = "test"  # @param {type:"Query"|"CollectionGroup"|"DocumentReference"|"string"}
```

### 🦜🔗 ライブラリのインストール

統合は独自の`langchain-google-firestore`パッケージにあるため、これをインストールする必要があります。

```python
%pip install -upgrade --quiet langchain-google-firestore
```

**Colabのみ**: カーネルを再起動するには、以下のセルのコメントを外すか、ボタンを使用してカーネルを再起動してください。Vertex AI Workbenchの場合は、上部のボタンを使用してターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloudプロジェクトの設定

このノートブック内でGoogle Cloudリソースを活用できるように、Google Cloudプロジェクトを設定します。

プロジェクトIDが分からない場合は、次の操作を試してください:

* `gcloud config list`を実行します。
* `gcloud projects list`を実行します。
* サポートページを参照します: [プロジェクトIDを見つける](https://support.google.com/googleapi/answer/7014113)。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloudプロジェクトにアクセスします。

- このノートブックを実行するためにColabを使用している場合は、以下のセルを使用して続行します。
- Vertex AI Workbenchを使用している場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順を確認してください。

```python
from google.colab import auth

auth.authenticate_user()
```

## 基本的な使い方

### ドキュメントの保存

`FirestoreSaver`はドキュメントをFirestoreに保存できます。デフォルトではメタデータからドキュメント参照を抽出しようとします。

`FirestoreSaver.upsert_documents(<documents>)`を使用してlangchainドキュメントを保存します。

```python
from langchain_core.documents import Document
from langchain_google_firestore import FirestoreSaver

saver = FirestoreSaver()

data = [Document(page_content="Hello, World!")]

saver.upsert_documents(data)
```

#### 参照なしのドキュメントを保存

コレクションが指定されている場合、ドキュメントは自動生成されたIDで保存されます。

```python
saver = FirestoreSaver("Collection")

saver.upsert_documents(data)
```

#### 他の参照を持つドキュメントを保存

```python
doc_ids = ["AnotherCollection/doc_id", "foo/bar"]
saver = FirestoreSaver()

saver.upsert_documents(documents=data, document_ids=doc_ids)
```

### コレクションまたはサブコレクションからの読み込み

`FirestoreLoader.load()`または`Firestore.lazy_load()`を使用してlangchainドキュメントを読み込みます。`lazy_load`は、イテレーション中にのみデータベースをクエリするジェネレータを返します。`FirestoreLoader`クラスを初期化するには、次の項目を提供する必要があります:

1. `source` - クエリ、CollectionGroup、DocumentReferenceのインスタンス、またはFirestoreコレクションへの`\`で区切られた単一のパス。

```python
from langchain_google_firestore import FirestoreLoader

loader_collection = FirestoreLoader("Collection")
loader_subcollection = FirestoreLoader("Collection/doc/SubCollection")


data_collection = loader_collection.load()
data_subcollection = loader_subcollection.load()
```

### 単一ドキュメントの読み込み

```python
from google.cloud import firestore

client = firestore.Client()
doc_ref = client.collection("foo").document("bar")

loader_document = FirestoreLoader(doc_ref)

data = loader_document.load()
```

### CollectionGroupまたはクエリからの読み込み

```python
from google.cloud.firestore import CollectionGroup, FieldFilter, Query

col_ref = client.collection("col_group")
collection_group = CollectionGroup(col_ref)

loader_group = FirestoreLoader(collection_group)

col_ref = client.collection("collection")
query = col_ref.where(filter=FieldFilter("region", "==", "west_coast"))

loader_query = FirestoreLoader(query)
```

### ドキュメントの削除

`FirestoreSaver.delete_documents(<documents>)`を使用して、Firestoreコレクションからlangchainドキュメントのリストを削除します。

ドキュメントIDが提供されている場合、ドキュメントは無視されます。

```python
saver = FirestoreSaver()

saver.delete_documents(data)

# The Documents will be ignored and only the document ids will be used.
saver.delete_documents(data, doc_ids)
```

## 高度な使い方

### ドキュメントページの内容とメタデータをカスタマイズして読み込む

`page_content_fields`および`metadata_fields`の引数は、LangChainドキュメントの`page_content`および`metadata`に書き込むFirestoreドキュメントフィールドを指定します。

```python
loader = FirestoreLoader(
    source="foo/bar/subcol",
    page_content_fields=["data_field"],
    metadata_fields=["metadata_field"],
)

data = loader.load()
```

#### ページ内容のフォーマットをカスタマイズ

`page_content`に1つのフィールドしか含まれていない場合、情報はそのフィールドの値のみになります。それ以外の場合、`page_content`はJSON形式になります。

### 接続と認証のカスタマイズ

```python
from google.auth import compute_engine
from google.cloud.firestore import Client

client = Client(database="non-default-db", creds=compute_engine.Credentials())
loader = FirestoreLoader(
    source="foo",
    client=client,
)
```
