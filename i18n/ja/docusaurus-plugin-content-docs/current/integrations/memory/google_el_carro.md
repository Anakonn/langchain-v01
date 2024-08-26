---
translated: true
---

# Google El Carro Oracle

> [Google Cloud El Carro Oracle](https://github.com/GoogleCloudPlatform/elcarro-oracle-operator)は、`Kubernetes`上で`Oracle`データベースを実行する方法を提供します。これは、ベンダーロックインのない、ポータブルで、オープンソースのコミュニティ主導のコンテナオーケストレーションシステムです。`El Carro`は、包括的で一貫性のある設定とデプロイ、リアルタイムの運用とモニタリングのための強力な宣言型APIを提供します。`El Carro`のLangchainインテグレーションを活用して、`Oracle`データベースの機能を拡張し、AI駆動のエクスペリエンスを構築できます。

このガイドでは、`ElCarroChatMessageHistory`クラスを使ってチャットメッセージ履歴を保存するための`El Carro`Langchainインテグレーションの使用方法について説明します。このインテグレーションは、`Oracle`データベースが実行されている場所に関係なく使用できます。

パッケージの詳細については、[GitHub](https://github.com/googleapis/langchain-google-el-carro-python/)をご覧ください。

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-el-carro-python/blob/main/docs/chat_message_history.ipynb)

## 始める前に

このノートブックを実行するには、以下の作業を行う必要があります:

 * [Getting Started](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/README.md#getting-started)セクションを完了し、El Carroを使ってOracle データベースを実行したい場合。

### 🦜🔗 ライブラリのインストール

このインテグレーションは`langchain-google-el-carro`パッケージ内にあるため、インストールする必要があります。

```python
%pip install --upgrade --quiet langchain-google-el-carro langchain-google-vertexai langchain
```

**Colab のみ:** 次のセルのコメントを外して、カーネルを再起動するか、ボタンを使ってカーネルを再起動してください。Vertex AI Workbenchの場合は、上部のボタンを使ってターミナルを再起動できます。

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
# from google.colab import auth

# auth.authenticate_user()
```

### ☁ Google Cloudプロジェクトの設定

このノートブック内でGoogle Cloudリソースを活用できるように、Google Cloudプロジェクトを設定します。

プロジェクトIDがわからない場合は、以下を試してください:

* `gcloud config list`を実行する。
* `gcloud projects list`を実行する。
* サポートページ: [プロジェクトIDの特定](https://support.google.com/googleapi/answer/7014113)を参照する。

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

## 基本的な使用方法

### Oracle データベース接続の設定

Oracle データベース接続の詳細を以下の変数に入力してください。

```python
# @title Set Your Values Here { display-mode: "form" }
HOST = "127.0.0.1"  # @param {type: "string"}
PORT = 3307  # @param {type: "integer"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
USER = "my-user"  # @param {type: "string"}
PASSWORD = input("Please provide a password to be used for the database user: ")
```

`El Carro`を使用している場合は、`El Carro`Kubernetesインスタンスのステータスにホスト名とポートの値が表示されます。
PDBに作成したユーザーパスワードを使用してください。
例

kubectl get -w instances.oracle.db.anthosapis.com -n db
NAME   DB ENGINE   VERSION   EDITION      ENDPOINT      URL                DB NAMES   BACKUP ID   READYSTATUS   READYREASON        DBREADYSTATUS   DBREADYREASON
mydb   Oracle      18c       Express      mydb-svc.db   34.71.69.25:6021                          False         CreateInProgress

### ElCarroEngine 接続プール

`ElCarroEngine`は、アプリケーションからの成功した接続を可能にし、業界のベストプラクティスに従うように、Oracle データベースへの接続プールを構成します。

```python
from langchain_google_el_carro import ElCarroEngine

elcarro_engine = ElCarroEngine.from_instance(
    db_host=HOST,
    db_port=PORT,
    db_name=DATABASE,
    db_user=USER,
    db_password=PASSWORD,
)
```

### テーブルの初期化

`ElCarroChatMessageHistory`クラスには、チャットメッセージ履歴を保存するための特定のスキーマを持つデータベーステーブルが必要です。

`ElCarroEngine`クラスには、適切なスキーマを持つテーブルを作成するための`init_chat_history_table()`メソッドがあります。

```python
elcarro_engine.init_chat_history_table(table_name=TABLE_NAME)
```

### ElCarroChatMessageHistory

`ElCarroChatMessageHistory`クラスを初期化するには、3つのものを提供する必要があります:

1. `elcarro_engine` - `ElCarroEngine`エンジンのインスタンス。
1. `session_id` - セッションを識別する一意の文字列。
1. `table_name` : チャットメッセージ履歴を保存するOracle データベース内のテーブル名。

```python
from langchain_google_el_carro import ElCarroChatMessageHistory

history = ElCarroChatMessageHistory(
    elcarro_engine=elcarro_engine, session_id="test_session", table_name=TABLE_NAME
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

#### クリーンアップ

特定のセッションの履歴が不要になり、削除できる場合は、次のように行うことができます。

**注意:** 一度削除すると、データはデータベースに保存されなくなり、永久に失われます。

```python
history.clear()
```

## 🔗 チェイニング

このメッセージ履歴クラスを[LCEL Runnables](/docs/expression_language/how_to/message_history)と簡単に組み合わせることができます。

これを行うには、[Google のVertex AI チャットモデル](/docs/integrations/chat/google_vertex_ai_palm)を使用します。これには、Google Cloudプロジェクトで[Vertex AI APIを有効にする](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com)必要があります。

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
    lambda session_id: ElCarroChatMessageHistory(
        elcarro_engine,
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
