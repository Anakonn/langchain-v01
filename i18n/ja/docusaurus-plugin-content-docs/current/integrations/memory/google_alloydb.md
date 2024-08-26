---
translated: true
---

# Google AlloyDB for PostgreSQL

> [Google Cloud AlloyDB for PostgreSQL](https://cloud.google.com/alloydb)は、最も要求の高い企業ワークロードのための完全に管理された`PostgreSQL`互換データベースサービスです。`AlloyDB`は、`Google Cloud`と`PostgreSQL`の長所を組み合わせ、優れたパフォーマンス、スケーラビリティ、可用性を提供します。`AlloyDB` Langchainインテグレーションを活用して、データベースアプリケーションを拡張し、AIパワードの体験を構築できます。

このノートブックでは、`Google Cloud AlloyDB for PostgreSQL`を使ってチャットメッセージ履歴を保存する方法について説明します。

パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-alloydb-pg-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-alloydb-pg-python/blob/main/docs/chat_message_history.ipynb)

## 始める前に

このノートブックを実行するには、以下の作業が必要です:

 * [Google Cloudプロジェクトの作成](https://developers.google.com/workspace/guides/create-project)
 * [AlloyDB APIの有効化](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)
 * [AlloyDBインスタンスの作成](https://cloud.google.com/alloydb/docs/instance-primary-create)
 * [AlloyDBデータベースの作成](https://cloud.google.com/alloydb/docs/database-create)
 * [データベースにIAMデータベースユーザーを追加](https://cloud.google.com/alloydb/docs/manage-iam-authn) (オプション)

### 🦜🔗 ライブラリのインストール

このインテグレーションは`langchain-google-alloydb-pg`パッケージに含まれているため、インストールする必要があります。

```python
%pip install --upgrade --quiet langchain-google-alloydb-pg langchain-google-vertexai
```

**Colab限定:** カーネルを再起動するには、次のセルのコメントを外すか、ボタンを使ってカーネルを再起動してください。Vertex AI Workbenchの場合は、上部のボタンを使ってターミナルを再起動できます。

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

* `gcloud config list`を実行する。
* `gcloud projects list`を実行する。
* サポートページ[プロジェクトIDの特定](https://support.google.com/googleapi/answer/7014113)を参照する。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 APIの有効化

`langchain-google-alloydb-pg`パッケージでは、Google Cloudプロジェクトで[AlloyDB Admin APIを有効化](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)する必要があります。

```python
# enable AlloyDB API
!gcloud services enable alloydb.googleapis.com
```

## 基本的な使用方法

### AlloyDBデータベースの値を設定する

[AlloyDBクラスターページ](https://console.cloud.google.com/alloydb?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687)からデータベースの値を見つけてください。

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
CLUSTER = "my-alloydb-cluster"  # @param {type: "string"}
INSTANCE = "my-alloydb-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### AlloyDBEngineコネクションプール

AlloyDBをChatMessageHistoryメモリストアとして確立するための要件の1つは、`AlloyDBEngine`オブジェクトです。`AlloyDBEngine`は、業界のベストプラクティスに従って、アプリケーションから正常な接続を可能にするためのAlloyDBデータベースへのコネクションプールを構成します。

`AlloyDBEngine.from_instance()`を使って`AlloyDBEngine`を作成するには、5つのものを提供する必要があります:

1. `project_id`: AlloyDBインスタンスが存在するGoogle CloudプロジェクトのプロジェクトID。
1. `region`: AlloyDBインスタンスが存在するリージョン。
1. `cluster`: AlloyDBクラスターの名前。
1. `instance`: AlloyDBインスタンスの名前。
1. `database`: AlloyDBインスタンス上の接続するデータベースの名前。

デフォルトでは、[IAMデータベース認証](https://cloud.google.com/alloydb/docs/manage-iam-authn)がデータベース認証の方法として使用されます。このライブラリは、環境から取得した[Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials)に属するIAMプリンシパルを使用します。

オプションで、ユーザー名とパスワードを使用する[組み込みデータベース認証](https://cloud.google.com/alloydb/docs/database-users/about)も使用できます。`AlloyDBEngine.from_instance()`に`user`と`password`の引数を提供するだけです:

* `user`: 組み込みデータベース認証とログインに使用するデータベースユーザー
* `password`: 組み込みデータベース認証とログインに使用するデータベースパスワード

```python
from langchain_google_alloydb_pg import AlloyDBEngine

engine = AlloyDBEngine.from_instance(
    project_id=PROJECT_ID,
    region=REGION,
    cluster=CLUSTER,
    instance=INSTANCE,
    database=DATABASE,
)
```

### テーブルの初期化

`AlloyDBChatMessageHistory`クラスでは、チャットメッセージ履歴を保存するために、特定のスキーマを持つデータベーステーブルが必要です。

`AlloyDBEngine`エンジンには、適切なスキーマを持つテーブルを作成するのに使える`init_chat_history_table()`ヘルパーメソッドがあります。

```python
engine.init_chat_history_table(table_name=TABLE_NAME)
```

### AlloyDBChatMessageHistory

`AlloyDBChatMessageHistory`クラスを初期化するには、3つのものを提供する必要があります:

1. `engine` - `AlloyDBEngine`エンジンのインスタンス。
1. `session_id` - セッションを特定する一意の識別子文字列。
1. `table_name`: チャットメッセージ履歴を保存するAlloyDBデータベース内のテーブル名。

```python
from langchain_google_alloydb_pg import AlloyDBChatMessageHistory

history = AlloyDBChatMessageHistory.create_sync(
    engine, session_id="test_session", table_name=TABLE_NAME
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

#### クリーンアップ

特定のセッションの履歴が不要になり、削除できる場合は、以下のように行うことができます。

**注意:** 一度削除されたデータは、AlloyDBに保存されなくなり、永久に失われます。

```python
history.clear()
```

## 🔗 チェーニング

このメッセージ履歴クラスを[LCEL Runnables](/docs/expression_language/how_to/message_history)と簡単に組み合わせることができます。

これを行うには、[Google の Vertex AI チャットモデル](/docs/integrations/chat/google_vertex_ai_palm)を使用します。これには、Google Cloud プロジェクトで[Vertex AI API を有効にする](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com)必要があります。

```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_google_vertexai import ChatVertexAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatVertexAI(project=PROJECT_ID)
```

```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: AlloyDBChatMessageHistory.create_sync(
        engine,
        session_id=session_id,
        table_name=TABLE_NAME,
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

```python
# This is where we configure the session id
config = {"configurable": {"session_id": "test_session"}}
```

```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```
