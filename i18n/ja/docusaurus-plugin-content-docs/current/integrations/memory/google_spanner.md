---
translated: true
---

# Google Spanner

> [Google Cloud Spanner](https://cloud.google.com/spanner)は、無制限のスケーラビリティと、セカンダリインデックス、強力な一貫性、スキーマ、SQLなどの関係的セマンティクスを組み合わせた、99.999%の可用性を提供する、簡単な1つのソリューションです。

このノートブックでは、`SpannerChatMessageHistory`クラスを使ってチャットメッセージ履歴をSpannerに保存する方法を説明します。
パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-spanner-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-spanner-python/blob/main/samples/chat_message_history.ipynb)

## 始める前に

このノートブックを実行するには、以下の作業が必要です:

 * [Google Cloudプロジェクトの作成](https://developers.google.com/workspace/guides/create-project)
 * [Cloud Spanner APIの有効化](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)
 * [Spannerインスタンスの作成](https://cloud.google.com/spanner/docs/create-manage-instances)
 * [Spannerデータベースの作成](https://cloud.google.com/spanner/docs/create-manage-databases)

### 🦜🔗 ライブラリのインストール

統合は独自の`langchain-google-spanner`パッケージにあるため、インストールする必要があります。

```python
%pip install --upgrade --quiet langchain-google-spanner
```

**Colab only:** カーネルを再起動するには、以下のセルのコメントを外すか、ボタンを使ってカーネルを再起動してください。Vertex AI Workbenchの場合は、上部のボタンを使ってターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloudプロジェクトにアクセスします。

* Colabを使ってこのノートブックを実行する場合は、以下のセルを使ってください。
* Vertex AI Workbenchを使う場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順を確認してください。

```python
from google.colab import auth

auth.authenticate_user()
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

### 💡 API の有効化

`langchain-google-spanner`パッケージでは、Google Cloudプロジェクトで[Spanner APIを有効化](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)する必要があります。

```python
# enable Spanner API
!gcloud services enable spanner.googleapis.com
```

## 基本的な使い方

### Spannerデータベースの値を設定する

[Spanner Instancesページ](https://console.cloud.google.com/spanner)からデータベースの値を見つけてください。

```python
# @title Set Your Values Here { display-mode: "form" }
INSTANCE = "my-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### テーブルの初期化

`SpannerChatMessageHistory`クラスでは、チャットメッセージ履歴を保存するために、特定のスキーマを持つデータベーステーブルが必要です。

`init_chat_history_table()`ヘルパーメソッドを使って、適切なスキーマを持つテーブルを作成できます。

```python
from langchain_google_spanner import (
    SpannerChatMessageHistory,
)

SpannerChatMessageHistory.init_chat_history_table(table_name=TABLE_NAME)
```

### SpannerChatMessageHistory

`SpannerChatMessageHistory`クラスを初期化するには、以下の3つの情報を提供する必要があります:

1. `instance_id` - Spannerインスタンスの名前
1. `database_id` - Spannerデータベースの名前
1. `session_id` - セッションを特定する一意の識別子文字列
1. `table_name` - データベース内のチャットメッセージ履歴を保存するテーブルの名前

```python
message_history = SpannerChatMessageHistory(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    session_id="user-session-id",
)

message_history.add_user_message("hi!")
message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

## カスタムクライアント

デフォルトで作成されるクライアントはデフォルトクライアントです。非デフォルトのクライアントを使用するには、[カスタムクライアント](https://cloud.google.com/spanner/docs/samples/spanner-create-client-with-query-options#spanner_create_client_with_query_options-python)をコンストラクタに渡すことができます。

```python
from google.cloud import spanner

custom_client_message_history = SpannerChatMessageHistory(
    instance_id="my-instance",
    database_id="my-database",
    client=spanner.Client(...),
)
```

## クリーンアップ

特定のセッションの履歴が不要になり、削除できる場合は、以下の方法で行えます。
注意: 一度削除されたデータは、Cloud Spannerに保存されなくなり、完全に失われます。

```python
message_history = SpannerChatMessageHistory(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    session_id="user-session-id",
)

message_history.clear()
```
