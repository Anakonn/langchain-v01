---
translated: true
---

# Google Firestore in Datastore Mode

> [Firestore in Datastore Mode](https://cloud.google.com/datastore) は、自動スケーリング、高パフォーマンス、アプリケーション開発の容易さのために構築されたNoSQLドキュメントデータベースです。DatastoreのLangchain統合を活用して、AIを搭載したエクスペリエンスを構築するためにデータベースアプリケーションを拡張します。

このノートブックでは、[Firestore in Datastore Mode](https://cloud.google.com/datastore) を使用して、`DatastoreLoader`および`DatastoreSaver`を使用して[Langchainドキュメントを保存、ロード、および削除](/docs/modules/data_connection/document_loaders/)する方法を説明します。

パッケージの詳細は[GitHub](https://github.com/googleapis/langchain-google-datastore-python/)で確認できます。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-datastore-python/blob/main/docs/document_loader.ipynb)

## 始める前に

このノートブックを実行するには、以下の手順を行う必要があります：

* [Google Cloud Projectを作成する](https://developers.google.com/workspace/guides/create-project)
* [Datastore APIを有効にする](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com)
* [Firestore in Datastore Modeデータベースを作成する](https://cloud.google.com/datastore/docs/manage-databases)

このノートブックのランタイム環境でデータベースへのアクセスが確認された後、以下の値を入力し、例のスクリプトを実行する前にセルを実行します。

### 🦜🔗 ライブラリのインストール

統合は独自の`langchain-google-datastore`パッケージに存在するため、これをインストールする必要があります。

```python
%pip install -upgrade --quiet langchain-google-datastore
```

**Colabのみ**：カーネルを再起動するには、以下のセルのコメントを外すか、ボタンを使用してカーネルを再起動します。Vertex AI Workbenchの場合は、上部のボタンを使用してターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloud Projectの設定

このノートブック内でGoogle Cloudリソースを活用できるように、Google Cloudプロジェクトを設定します。

プロジェクトIDがわからない場合は、次の方法を試してください：

* `gcloud config list`を実行します。
* `gcloud projects list`を実行します。
* サポートページを参照： [プロジェクトIDを見つける](https://support.google.com/googleapi/answer/7014113)。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloud Projectにアクセスします。

- このノートブックを実行するためにColabを使用している場合は、以下のセルを使用して続行します。
- Vertex AI Workbenchを使用している場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)の設定手順を確認してください。

```python
from google.colab import auth

auth.authenticate_user()
```

## 基本的な使い方

### ドキュメントを保存する

`DatastoreSaver.upsert_documents(<documents>)`を使用してLangchainドキュメントを保存します。デフォルトでは、ドキュメントのメタデータの`key`からエンティティキーを抽出しようとします。

```python
from langchain_core.documents import Document
from langchain_google_datastore import DatastoreSaver

saver = DatastoreSaver()

data = [Document(page_content="Hello, World!")]
saver.upsert_documents(data)
```

#### キーなしでドキュメントを保存する

`kind`が指定されている場合、ドキュメントは自動生成されたIDで保存されます。

```python
saver = DatastoreSaver("MyKind")

saver.upsert_documents(data)
```

### Kindを介してドキュメントをロードする

`DatastoreLoader.load()`または`DatastoreLoader.lazy_load()`を使用してLangchainドキュメントをロードします。`lazy_load`は、イテレーション中にデータベースをクエリするジェネレータを返します。`DatastoreLoader`クラスを初期化するには、以下を提供する必要があります：
1. `source` - ドキュメントをロードするソース。これはQueryのインスタンスまたは読み取るDatastoreのkindの名前であることができます。

```python
from langchain_google_datastore import DatastoreLoader

loader = DatastoreLoader("MyKind")
data = loader.load()
```

### クエリを介してドキュメントをロードする

kindからドキュメントをロードする以外にも、クエリからドキュメントをロードすることも選択できます。例えば：

```python
from google.cloud import datastore

client = datastore.Client(database="non-default-db", namespace="custom_namespace")
query_load = client.query(kind="MyKind")
query_load.add_filter("region", "=", "west_coast")

loader_document = DatastoreLoader(query_load)

data = loader_document.load()
```

### ドキュメントを削除する

`DatastoreSaver.delete_documents(<documents>)`を使用してDatastoreからLangchainドキュメントのリストを削除します。

```python
saver = DatastoreSaver()

saver.delete_documents(data)

keys_to_delete = [
    ["Kind1", "identifier"],
    ["Kind2", 123],
    ["Kind3", "identifier", "NestedKind", 456],
]
# The Documents will be ignored and only the document ids will be used.
saver.delete_documents(data, keys_to_delete)
```

## 高度な使い方

### カスタマイズされたドキュメントページコンテンツとメタデータでドキュメントをロードする

`page_content_properties`および`metadata_properties`の引数は、LangChain Documentの`page_content`および`metadata`に書き込むエンティティプロパティを指定します。

```python
loader = DatastoreLoader(
    source="MyKind",
    page_content_fields=["data_field"],
    metadata_fields=["metadata_field"],
)

data = loader.load()
```

### ページコンテンツ形式のカスタマイズ

`page_content`が1つのフィールドのみを含む場合、その情報はフィールド値のみになります。それ以外の場合、`page_content`はJSON形式になります。

### 接続と認証のカスタマイズ

```python
from google.auth import compute_engine
from google.cloud.firestore import Client

client = Client(database="non-default-db", creds=compute_engine.Credentials())
loader = DatastoreLoader(
    source="foo",
    client=client,
)
```
