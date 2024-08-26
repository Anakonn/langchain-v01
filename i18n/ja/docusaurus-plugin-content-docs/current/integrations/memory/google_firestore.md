---
translated: true
---

# Google Firestore (ネイティブモード)

> [Google Cloud Firestore](https://cloud.google.com/firestore)は、需要に応じてスケーリングする、サーバーレスのドキュメント指向データベースです。 `Firestore`の Langchain 統合を活用して、AI 駆動のエクスペリエンスを構築するためのデータベースアプリケーションを拡張できます。

このノートブックでは、`FirestoreChatMessageHistory`クラスを使用して、チャットメッセージ履歴を [Google Cloud Firestore](https://cloud.google.com/firestore) に保存する方法について説明します。

パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-firestore-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/chat_message_history.ipynb)

## 始める前に

このノートブックを実行するには、以下の作業が必要です:

* [Google Cloud プロジェクトの作成](https://developers.google.com/workspace/guides/create-project)
* [Firestore API の有効化](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [Firestore データベースの作成](https://cloud.google.com/firestore/docs/manage-databases)

このノートブックの実行環境でデータベースへのアクセスを確認した後、以下の値を入力し、サンプルスクリプトを実行する前にセルを実行してください。

### 🦜🔗 ライブラリのインストール

統合は独自の `langchain-google-firestore` パッケージに存在するため、インストールする必要があります。

```python
%pip install -upgrade --quiet langchain-google-firestore
```

**Colab のみ**: カーネルを再起動するには、次のセルのコメントを外すか、ボタンを使用してカーネルを再起動してください。 Vertex AI Workbench の場合は、上部のボタンを使用してターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloud プロジェクトの設定

このノートブック内で Google Cloud リソースを活用できるように、Google Cloud プロジェクトを設定してください。

プロジェクト ID がわからない場合は、以下を試してください:

* `gcloud config list` を実行する。
* `gcloud projects list` を実行する。
* サポートページ: [プロジェクト ID の特定](https://support.google.com/googleapi/answer/7014113)を参照する。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 認証

このノートブックにログインしている IAM ユーザーとして Google Cloud に認証し、Google Cloud プロジェクトにアクセスします。

- Colab でこのノートブックを実行する場合は、以下のセルを使用して続行してください。
- Vertex AI Workbench を使用する場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順を確認してください。

```python
from google.colab import auth

auth.authenticate_user()
```

## 基本的な使用方法

### FirestoreChatMessageHistory

`FirestoreChatMessageHistory`クラスを初期化するには、3つのものを提供する必要があります:

1. `session_id` - セッションを特定する一意の識別子文字列。
1. `collection`: Firestore コレクションへの単一の `/`区切りのパス。

```python
from langchain_google_firestore import FirestoreChatMessageHistory

chat_history = FirestoreChatMessageHistory(
    session_id="user-session-id", collection="HistoryMessages"
)

chat_history.add_user_message("Hi!")
chat_history.add_ai_message("How can I help you?")
```

```python
chat_history.messages
```

#### クリーンアップ

特定のセッションの履歴が不要になり、データベースとメモリから削除できる場合は、次のように行うことができます。

**注意:** 一度削除されると、Firestore に保存されているデータは完全に失われます。

```python
chat_history.clear()
```

### カスタムクライアント

クライアントは、利用可能な環境変数を使用してデフォルトで作成されます。 [カスタムクライアント](https://cloud.google.com/python/docs/reference/firestore/latest/client)をコンストラクタに渡すこともできます。

```python
from google.auth import compute_engine
from google.cloud import firestore

client = firestore.Client(
    project="project-custom",
    database="non-default-database",
    credentials=compute_engine.Credentials(),
)

history = FirestoreChatMessageHistory(
    session_id="session-id", collection="History", client=client
)

history.add_user_message("New message")

history.messages

history.clear()
```
