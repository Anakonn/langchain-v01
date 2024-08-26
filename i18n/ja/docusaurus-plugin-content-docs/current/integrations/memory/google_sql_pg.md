---
translated: true
---

# Google SQL for PostgreSQL

> [Google Cloud SQL](https://cloud.google.com/sql)は、高パフォーマンス、シームレスな統合、および優れたスケーラビリティを提供する完全に管理されたリレーショナルデータベースサービスです。 `MySQL`、`PostgreSQL`、`SQL Server`のデータベースエンジンを提供しています。 Cloud SQLのLangchainインテグレーションを活用して、AIパワードのエクスペリエンスを構築するためにデータベースアプリケーションを拡張できます。

このノートブックでは、`PostgresChatMessageHistory`クラスを使用してチャットメッセージ履歴を保存するために、`Google Cloud SQL for PostgreSQL`を使用する方法について説明します。

パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-cloud-sql-pg-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-pg-python/blob/main/docs/chat_message_history.ipynb)

## 始める前に

このノートブックを実行するには、以下の作業が必要です:

 * [Google Cloudプロジェクトの作成](https://developers.google.com/workspace/guides/create-project)
 * [Cloud SQL Admin APIの有効化](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
 * [PostgreSQL用のCloud SQLインスタンスの作成](https://cloud.google.com/sql/docs/postgres/create-instance)
 * [Cloud SQLデータベースの作成](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
 * [データベースにIAMデータベースユーザーを追加](https://cloud.google.com/sql/docs/postgres/add-manage-iam-users#creating-a-database-user) (オプション)

### 🦜🔗 ライブラリのインストール

このインテグレーションは独自の`langchain-google-cloud-sql-pg`パッケージにあるため、インストールする必要があります。

```python
%pip install --upgrade --quiet langchain-google-cloud-sql-pg langchain-google-vertexai
```

**Colab only:** カーネルを再起動するには、以下のセルのコメントを外すか、ボタンを使ってカーネルを再起動してください。 Vertex AI Workbenchの場合は、上部のボタンを使ってターミナルを再起動できます。

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 認証

このノートブックにログインしているIAMユーザーとしてGoogle Cloudに認証し、Google Cloudプロジェクトにアクセスできるようにします。

* Colabを使ってこのノートブックを実行する場合は、以下のセルを使い続けてください。
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
* サポートページ[プロジェクトIDの特定](https://support.google.com/googleapi/answer/7014113)を参照する。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 API の有効化

`langchain-google-cloud-sql-pg`パッケージを使うには、Google Cloudプロジェクトで[Cloud SQL Admin APIを有効化](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com)する必要があります。

```python
# enable Cloud SQL Admin API
!gcloud services enable sqladmin.googleapis.com
```

## 基本的な使用方法

### Cloud SQLデータベースの値を設定する

[Cloud SQL Instancesページ](https://console.cloud.google.com/sql?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687)からデータベースの値を見つけてください。

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-postgresql-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### PostgresEngineコネクションプール

Cloud SQLをChatMessageHistoryメモリストアとして確立するための要件の1つは、`PostgresEngine`オブジェクトです。 `PostgresEngine`は、Cloud SQLデータベースへの接続プールを構成し、アプリケーションからの成功した接続と業界のベストプラクティスを可能にします。

`PostgresEngine.from_instance()`を使って`PostgresEngine`を作成するには、4つのものを提供する必要があります:

1.   `project_id` : Cloud SQLインスタンスが存在するGoogle CloudプロジェクトのプロジェクトID。
1. `region` : Cloud SQLインスタンスが存在するリージョン。
1. `instance` : Cloud SQLインスタンスの名前。
1. `database` : Cloud SQLインスタンス上の接続するデータベースの名前。

デフォルトでは、[IAMデータベース認証](https://cloud.google.com/sql/docs/postgres/iam-authentication#iam-db-auth)がデータベース認証の方法として使用されます。このライブラリは、環境から取得した[アプリケーションデフォルトの資格情報(ADC)](https://cloud.google.com/docs/authentication/application-default-credentials)に属するIAMプリンシパルを使用します。

IAMデータベース認証の詳細については、以下を参照してください:

* [IAMデータベース認証用のインスタンスの構成](https://cloud.google.com/sql/docs/postgres/create-edit-iam-instances)
* [IAMデータベース認証を使用したユーザーの管理](https://cloud.google.com/sql/docs/postgres/add-manage-iam-users)

オプションで、ユーザー名とパスワードを使用する[組み込みデータベース認証](https://cloud.google.com/sql/docs/postgres/built-in-authentication)も使用できます。 `PostgresEngine.from_instance()`に`user`と`password`の引数を提供するだけです:

* `user` : 組み込みデータベース認証とログインに使用するデータベースユーザー
* `password` : 組み込みデータベース認証とログインに使用するデータベースパスワード。

```python
from langchain_google_cloud_sql_pg import PostgresEngine

engine = PostgresEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### テーブルの初期化

`PostgresChatMessageHistory`クラスには、チャットメッセージ履歴を保存するための特定のスキーマを持つデータベーステーブルが必要です。

`PostgresEngine`エンジンには、適切なスキーマを持つテーブルを作成するのに使える`init_chat_history_table()`ヘルパーメソッドがあります。

```python
engine.init_chat_history_table(table_name=TABLE_NAME)
```

### PostgresChatMessageHistory

`PostgresChatMessageHistory`クラスを初期化するには、3つのものを提供する必要があります:

1. `engine` - `PostgresEngine`エンジンのインスタンス。
1. `session_id` - セッションの一意の識別子文字列。
1. `table_name` : Cloud SQLデータベース内のチャットメッセージ履歴を保存するテーブルの名前。

```python
from langchain_google_cloud_sql_pg import PostgresChatMessageHistory

history = PostgresChatMessageHistory.create_sync(
    engine, session_id="test_session", table_name=TABLE_NAME
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

#### クリーンアップ

特定のセッションの履歴が不要になり、削除できる場合は、次のように行うことができます。

**注意:** 一度削除されると、データはCloud SQLに保存されなくなり、永久に失われます。

```python
history.clear()
```

## 🔗 チェーニング

[LCEL Runnables](/docs/expression_language/how_to/message_history)と一緒にこのメッセージ履歴クラスを簡単に組み合わせることができます。

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
    lambda session_id: PostgresChatMessageHistory.create_sync(
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

```output
AIMessage(content=' Hello Bob, how can I help you today?')
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content=' Your name is Bob.')
```
