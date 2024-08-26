---
translated: true
---

# Google Bigtable

> [Google Cloud Bigtable](https://cloud.google.com/bigtable)は、構造化、半構造化、または非構造化データへの高速アクセスに最適なキーバリューおよび広列ストアです。Bigtableの Langchain統合を活用して、AI駆動のエクスペリエンスを構築するためにデータベースアプリケーションを拡張できます。

このノートブックでは、`BigtableChatMessageHistory`クラスを使用してチャットメッセージ履歴を [Google Cloud Bigtable](https://cloud.google.com/bigtable)に保存する方法について説明します。

パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-bigtable-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-bigtable-python/blob/main/docs/chat_message_history.ipynb)

## 始める前に

このノートブックを実行するには、以下の作業が必要です:

* [Google Cloudプロジェクトの作成](https://developers.google.com/workspace/guides/create-project)
* [Bigtable APIの有効化](https://console.cloud.google.com/flows/enableapi?apiid=bigtable.googleapis.com)
* [Bigtableインスタンスの作成](https://cloud.google.com/bigtable/docs/creating-instance)
* [Bigtableテーブルの作成](https://cloud.google.com/bigtable/docs/managing-tables)
* [Bigtableアクセス資格情報の作成](https://developers.google.com/workspace/guides/create-credentials)

### 🦜🔗 ライブラリのインストール

統合は独自の `langchain-google-bigtable`パッケージにあるため、インストールする必要があります。

```python
%pip install -upgrade --quiet langchain-google-bigtable
```

**Colab のみ**: 次のセルのコメントを外して、カーネルを再起動するか、ボタンを使ってカーネルを再起動してください。Vertex AI Workbenchの場合は、上部のボタンを使ってターミナルを再起動できます。

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

- このノートブックをColabで実行している場合は、以下のセルを使用して続行してください。
- Vertex AI Workbenchを使用している場合は、[こちら](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)のセットアップ手順を確認してください。

```python
from google.colab import auth

auth.authenticate_user()
```

## 基本的な使用方法

### Bigtableスキーマの初期化

BigtableChatMessageHistoryのスキーマには、インスタンスとテーブルが存在し、`langchain`という列ファミリーがある必要があります。

```python
# @markdown Please specify an instance and a table for demo purpose.
INSTANCE_ID = "my_instance"  # @param {type:"string"}
TABLE_ID = "my_table"  # @param {type:"string"}
```

テーブルまたは列ファミリーが存在しない場合は、以下の関数を使用して作成できます:

```python
from google.cloud import bigtable
from langchain_google_bigtable import create_chat_history_table

create_chat_history_table(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)
```

### BigtableChatMessageHistory

`BigtableChatMessageHistory`クラスを初期化するには、3つのものを提供する必要があります:

1. `instance_id` - チャットメッセージ履歴に使用するBigtableインスタンス。
1. `table_id` : チャットメッセージ履歴を保存するBigtableテーブル。
1. `session_id` - セッションの一意の識別子文字列。

```python
from langchain_google_bigtable import BigtableChatMessageHistory

message_history = BigtableChatMessageHistory(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
    session_id="user-session-id",
)

message_history.add_user_message("hi!")
message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

#### クリーンアップ

特定のセッションの履歴が不要になり、削除できる場合は、以下の方法で行うことができます。

**注意:** 一度削除すると、Bigtableに保存されているデータは失われ、復元できなくなります。

```python
message_history.clear()
```

## 高度な使用方法

### カスタムクライアント

デフォルトで作成されるクライアントは、admin=Trueオプションのみを使用するデフォルトのクライアントです。非デフォルトのクライアントを使用するには、[カスタムクライアント](https://cloud.google.com/python/docs/reference/bigtable/latest/client#class-googlecloudbigtableclientclientprojectnone-credentialsnone-readonlyfalse-adminfalse-clientinfonone-clientoptionsnone-adminclientoptionsnone-channelnone)をコンストラクタに渡すことができます。

```python
from google.cloud import bigtable

client = (bigtable.Client(...),)

create_chat_history_table(
    instance_id="my-instance",
    table_id="my-table",
    client=client,
)

custom_client_message_history = BigtableChatMessageHistory(
    instance_id="my-instance",
    table_id="my-table",
    client=client,
)
```
