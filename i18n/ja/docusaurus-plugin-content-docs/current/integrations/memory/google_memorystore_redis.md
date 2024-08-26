---
translated: true
---

# Google Memorystore for Redis

> [Google Cloud Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview)は、Redis インメモリデータストアを活用した完全管理型サービスで、サブミリ秒のデータアクセスを提供するアプリケーションキャッシュを構築できます。Memorystore for Redisの Langchain統合を活用して、データベースアプリケーションを拡張し、AIパワードの体験を構築できます。

このノートブックでは、[Google Cloud Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview)を使ってチャットメッセージ履歴を保存する `MemorystoreChatMessageHistory` クラスの使用方法を説明します。

パッケージの詳細は[GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/chat_message_history.ipynb)

## 始める前に

このノートブックを実行するには、以下の作業が必要です:

* [Google Cloudプロジェクトの作成](https://developers.google.com/workspace/guides/create-project)
* [Memorystore for Redis APIの有効化](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [Memorystore for Redisインスタンスの作成](https://cloud.google.com/memorystore/docs/redis/create-instance-console)。バージョンが5.0以上であることを確認してください。

このノートブックの実行環境でデータベースへのアクセスを確認した後、以下の値を入力して、サンプルスクリプトを実行する前にセルを実行してください。

```python
# @markdown Please specify an endpoint associated with the instance or demo purpose.
ENDPOINT = "redis://127.0.0.1:6379"  # @param {type:"string"}
```

### 🦜🔗 ライブラリのインストール

統合は `langchain-google-memorystore-redis` パッケージ内にあるため、インストールする必要があります。

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis
```

**Colab のみ:** 以下のセルのコメントを外すか、ボタンを使ってカーネルを再起動してください。Vertex AI Workbenchの場合は、上部のボタンを使ってターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloudプロジェクトの設定

このノートブック内でGoogle Cloudリソースを活用できるよう、Google Cloudプロジェクトを設定します。

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

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloudプロジェクトにアクセスします。

* Colabでこのノートブックを実行する場合は、以下のセルを使ってください。
* Vertex AI Workbenchを使う場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順を確認してください。

```python
from google.colab import auth

auth.authenticate_user()
```

## 基本的な使用方法

### MemorystoreChatMessageHistory

`MemorystoreMessageHistory`クラスを初期化するには、2つのものを提供する必要があります:

1. `redis_client` - Memorystore Redisのインスタンス
1. `session_id` - 各チャットメッセージ履歴オブジェクトには一意のセッションIDが必要です。セッションIDにすでにメッセージが保存されている場合は、それらを取得できます。

```python
import redis
from langchain_google_memorystore_redis import MemorystoreChatMessageHistory

# Connect to a Memorystore for Redis instance
redis_client = redis.from_url("redis://127.0.0.1:6379")

message_history = MemorystoreChatMessageHistory(redis_client, session_id="session1")
```

```python
message_history.messages
```

#### クリーンアップ

特定のセッションの履歴が不要になり、削除できる場合は、以下のように行えます。

**注意:** 一度削除されたデータは、Memorystore for Redisに保存されなくなり、完全に失われます。

```python
message_history.clear()
```
