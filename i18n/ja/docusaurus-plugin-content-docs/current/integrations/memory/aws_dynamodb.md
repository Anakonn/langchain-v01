---
translated: true
---

# AWS DynamoDB

>[Amazon AWS DynamoDB](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/dynamodb/index.html)は、高速で予測可能なパフォーマンスと seamless なスケーラビリティを提供する完全マネージドの `NoSQL` データベースサービスです。

このノートブックでは、`DynamoDBChatMessageHistory` クラスを使ってチャットメッセージの履歴を `DynamoDB` に保存する方法を説明します。

## セットアップ

まず、[AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) を正しく設定していることを確認してください。次に、`langchain-community` パッケージをインストールする必要があります。また、`boto3` パッケージもインストールする必要があります。

```bash
pip install -U langchain-community boto3
```

[LangSmith](https://smith.langchain.com/) を設定すると、最高レベルの可観測性を得られるので便利です(必須ではありません)。

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

```python
from langchain_community.chat_message_histories import (
    DynamoDBChatMessageHistory,
)
```

## テーブルの作成

メッセージを保存する `DynamoDB` テーブルを作成します:

```python
import boto3

# Get the service resource.
dynamodb = boto3.resource("dynamodb")

# Create the DynamoDB table.
table = dynamodb.create_table(
    TableName="SessionTable",
    KeySchema=[{"AttributeName": "SessionId", "KeyType": "HASH"}],
    AttributeDefinitions=[{"AttributeName": "SessionId", "AttributeType": "S"}],
    BillingMode="PAY_PER_REQUEST",
)

# Wait until the table exists.
table.meta.client.get_waiter("table_exists").wait(TableName="SessionTable")

# Print out some data about the table.
print(table.item_count)
```

```output
0
```

## DynamoDBChatMessageHistory

```python
history = DynamoDBChatMessageHistory(table_name="SessionTable", session_id="0")

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

## カスタムエンドポイントURLを使った DynamoDBChatMessageHistory

場合によっては、AWS エンドポイントの URL を指定する必要があります。例えば、[Localstack](https://localstack.cloud/) でローカルに実行する場合などです。そのような場合は、コンストラクタの `endpoint_url` パラメータを使ってURLを指定できます。

```python
history = DynamoDBChatMessageHistory(
    table_name="SessionTable",
    session_id="0",
    endpoint_url="http://localhost.localstack.cloud:4566",
)
```

## コンポジットキーを使った DynamoDBChatMessageHistory

DynamoDBChatMessageHistory のデフォルトのキーは `{"SessionId": self.session_id}` ですが、テーブルの設計に合わせて変更することができます。

### プライマリキー名

プライマリキーは、コンストラクタの `primary_key_name` パラメータを渡すことで変更できます。その結果、キーは `{self.primary_key_name: self.session_id}` になります。

### コンポジットキー

既存の DynamoDB テーブルを使用する場合は、デフォルトのキー構造から Sort Key を含むものに変更する必要があるかもしれません。これを行うには、`key` パラメータを使用します。

`key` パラメータに値を渡すと、`primary_key` パラメータが上書きされ、渡された値がキー構造になります。

```python
composite_table = dynamodb.create_table(
    TableName="CompositeTable",
    KeySchema=[
        {"AttributeName": "PK", "KeyType": "HASH"},
        {"AttributeName": "SK", "KeyType": "RANGE"},
    ],
    AttributeDefinitions=[
        {"AttributeName": "PK", "AttributeType": "S"},
        {"AttributeName": "SK", "AttributeType": "S"},
    ],
    BillingMode="PAY_PER_REQUEST",
)

# Wait until the table exists.
composite_table.meta.client.get_waiter("table_exists").wait(TableName="CompositeTable")

# Print out some data about the table.
print(composite_table.item_count)
```

```output
0
```

```python
my_key = {
    "PK": "session_id::0",
    "SK": "langchain_history",
}

composite_key_history = DynamoDBChatMessageHistory(
    table_name="CompositeTable",
    session_id="0",
    endpoint_url="http://localhost.localstack.cloud:4566",
    key=my_key,
)

composite_key_history.add_user_message("hello, composite dynamodb table!")

composite_key_history.messages
```

```output
[HumanMessage(content='hello, composite dynamodb table!')]
```

## チェーニング

このメッセージ履歴クラスを [LCEL Runnables](/docs/expression_language/how_to/message_history) と簡単に組み合わせることができます。

これを行うには OpenAI が必要なので、それもインストールする必要があります。

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()
```

```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: DynamoDBChatMessageHistory(
        table_name="SessionTable", session_id=session_id
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

```python
# This is where we configure the session id
config = {"configurable": {"session_id": "<SESSION_ID>"}}
```

```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```

```output
AIMessage(content='Hello Bob! How can I assist you today?')
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content='Your name is Bob! Is there anything specific you would like assistance with, Bob?')
```
