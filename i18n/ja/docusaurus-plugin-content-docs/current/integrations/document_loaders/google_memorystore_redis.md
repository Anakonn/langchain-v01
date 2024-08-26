---
translated: true
---

# Google Memorystore for Redis

> [Google Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview)は、Redis インメモリデータストアを活用して完全に管理されたサービスであり、サブミリ秒のデータアクセスを提供するアプリケーションキャッシュを構築することができます。Memorystore for Redisの Langchain統合を活用して、データベースアプリケーションを拡張し、AI駆動のエクスペリエンスを構築することができます。

このノートブックでは、`MemorystoreDocumentLoader`と`MemorystoreDocumentSaver`を使用して、[Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview)に[Langchainドキュメントを保存、読み込み、削除する](/docs/modules/data_connection/document_loaders/)方法について説明します。

パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/document_loader.ipynb)

## 始める前に

このノートブックを実行するには、以下の作業が必要です:

* [Google Cloudプロジェクトを作成する](https://developers.google.com/workspace/guides/create-project)
* [Memorystore for Redis APIを有効化する](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [Memorystore for Redisインスタンスを作成する](https://cloud.google.com/memorystore/docs/redis/create-instance-console)。バージョンが5.0以上であることを確認してください。

このノートブックの実行環境でデータベースへのアクセスを確認した後、以下の値を入力し、サンプルスクリプトを実行する前にセルを実行してください。

```python
# @markdown Please specify an endpoint associated with the instance and a key prefix for demo purpose.
ENDPOINT = "redis://127.0.0.1:6379"  # @param {type:"string"}
KEY_PREFIX = "doc:"  # @param {type:"string"}
```

### 🦜🔗 ライブラリのインストール

このインテグレーションは独自の`langchain-google-memorystore-redis`パッケージに含まれているため、インストールする必要があります。

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis
```

**Colab のみ**: 以下のセルのコメントを外すか、ボタンを使用してカーネルを再起動してください。Vertex AI Workbenchの場合は、上部のボタンを使用してターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloudプロジェクトの設定

このノートブック内でGoogle Cloudリソースを活用できるように、Google Cloudプロジェクトを設定してください。

プロジェクトIDがわからない場合は、以下を試してください:

* `gcloud config list`を実行する。
* `gcloud projects list`を実行する。
* サポートページ[プロジェクトIDの特定](https://support.google.com/googleapi/answer/7014113)を参照する。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloudプロジェクトにアクセスします。

- Colabでこのノートブックを実行する場合は、以下のセルを使用して続行してください。
- Vertex AI Workbenchを使用する場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順を確認してください。

```python
from google.colab import auth

auth.authenticate_user()
```

## 基本的な使用方法

### ドキュメントの保存

`MemorystoreDocumentSaver.add_documents(<documents>)`を使用して、Langchainドキュメントを保存します。`MemorystoreDocumentSaver`クラスを初期化するには、以下の2つを指定する必要があります:

1. `client` - `redis.Redis`クライアントオブジェクト。
1. `key_prefix` - Redisにドキュメントを保存するキーのプレフィックス。

ドキュメントは、指定された`key_prefix`のランダムに生成されたキーに保存されます。または、`add_documents`メソッドで`ids`を指定することで、キーのサフィックスを指定することもできます。

```python
import redis
from langchain_core.documents import Document
from langchain_google_memorystore_redis import MemorystoreDocumentSaver

test_docs = [
    Document(
        page_content="Apple Granny Smith 150 0.99 1",
        metadata={"fruit_id": 1},
    ),
    Document(
        page_content="Banana Cavendish 200 0.59 0",
        metadata={"fruit_id": 2},
    ),
    Document(
        page_content="Orange Navel 80 1.29 1",
        metadata={"fruit_id": 3},
    ),
]
doc_ids = [f"{i}" for i in range(len(test_docs))]

redis_client = redis.from_url(ENDPOINT)
saver = MemorystoreDocumentSaver(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_field="page_content",
)
saver.add_documents(test_docs, ids=doc_ids)
```

### ドキュメントの読み込み

特定のプレフィックスを持つ、Memorystore for Redisインスタンス内のすべてのドキュメントを読み込むローダーを初期化します。

`MemorystoreDocumentLoader.load()`または`MemorystoreDocumentLoader.lazy_load()`を使用してLangchainドキュメントを読み込みます。`lazy_load`は、イテレーション中にのみデータベースにクエリを発行するジェネレーターを返します。`MemorystoreDocumentLoader`クラスを初期化するには、以下の2つを指定する必要があります:

1. `client` - `redis.Redis`クライアントオブジェクト。
1. `key_prefix` - Redisにドキュメントを保存するキーのプレフィックス。

```python
import redis
from langchain_google_memorystore_redis import MemorystoreDocumentLoader

redis_client = redis.from_url(ENDPOINT)
loader = MemorystoreDocumentLoader(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_fields=set(["page_content"]),
)
for doc in loader.lazy_load():
    print("Loaded documents:", doc)
```

### ドキュメントの削除

`MemorystoreDocumentSaver.delete()`を使用して、指定されたプレフィックスを持つすべてのキーをMemorystore for Redisインスタンスから削除します。必要に応じて、キーのサフィックスも指定できます。

```python
docs = loader.load()
print("Documents before delete:", docs)

saver.delete(ids=[0])
print("Documents after delete:", loader.load())

saver.delete()
print("Documents after delete all:", loader.load())
```

## 高度な使用方法

### ドキュメントのページコンテンツとメタデータのカスタマイズ

1つ以上のコンテンツフィールドを指定して読み込み用のローダーを初期化すると、読み込まれたドキュメントの`page_content`には、`content_fields`で指定したフィールドに対応するトップレベルのフィールドを含むJSON エンコーデッド文字列が含まれます。

`metadata_fields`が指定されている場合、読み込まれたドキュメントの`metadata`フィールドには、指定された`metadata_fields`に対応するトップレベルのフィールドのみが含まれます。メタデータフィールドの値がJSON エンコーデッド文字列として保存されている場合は、メタデータフィールドにロードされる前に解読されます。

```python
loader = MemorystoreDocumentLoader(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_fields=set(["content_field_1", "content_field_2"]),
    metadata_fields=set(["title", "author"]),
)
```
