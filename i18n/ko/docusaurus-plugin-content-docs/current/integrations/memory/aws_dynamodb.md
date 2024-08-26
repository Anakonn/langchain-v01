---
translated: true
---

# AWS DynamoDB

>[Amazon AWS DynamoDB](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/dynamodb/index.html)는 빠르고 예측 가능한 성능과 원활한 확장성을 제공하는 완전 관리형 `NoSQL` 데이터베이스 서비스입니다.

이 노트북에서는 `DynamoDBChatMessageHistory` 클래스를 사용하여 채팅 메시지 기록을 저장하는 방법을 살펴봅니다.

## 설정

먼저 [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)를 올바르게 구성했는지 확인하세요. 그런 다음 `langchain-community` 패키지를 설치했는지 확인하세요. 또한 `boto3` 패키지도 설치해야 합니다.

```bash
pip install -U langchain-community boto3
```

[LangSmith](https://smith.langchain.com/)를 설정하면 최고 수준의 관찰 기능을 활용할 수 있습니다(필수는 아님).

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

```python
from langchain_community.chat_message_histories import (
    DynamoDBChatMessageHistory,
)
```

## 테이블 생성

이제 메시지를 저장할 `DynamoDB` 테이블을 생성합니다:

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

## 사용자 지정 엔드포인트 URL을 사용한 DynamoDBChatMessageHistory

때때로 AWS 엔드포인트 URL을 지정하는 것이 유용할 수 있습니다. 예를 들어 [Localstack](https://localstack.cloud/)에 대해 로컬로 실행할 때 등입니다. 이러한 경우 생성자에서 `endpoint_url` 매개변수를 사용하여 URL을 지정할 수 있습니다.

```python
history = DynamoDBChatMessageHistory(
    table_name="SessionTable",
    session_id="0",
    endpoint_url="http://localhost.localstack.cloud:4566",
)
```

## 복합 키를 사용한 DynamoDBChatMessageHistory

DynamoDBChatMessageHistory의 기본 키는 `{"SessionId": self.session_id}`입니다. 그러나 테이블 설계에 맞게 이를 수정할 수 있습니다.

### 기본 키 이름

생성자에서 `primary_key_name` 값을 전달하여 기본 키를 수정할 수 있습니다. 그러면 `{self.primary_key_name: self.session_id}`가 됩니다.

### 복합 키

기존 DynamoDB 테이블을 사용할 때는 기본 키 구조를 수정해야 할 수 있습니다. 이를 위해 `key` 매개변수를 사용할 수 있습니다.

`key` 값을 전달하면 `primary_key` 매개변수를 재정의하고, 결과 키 구조는 전달된 값이 됩니다.

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

## 체이닝

[LCEL Runnables](/docs/expression_language/how_to/message_history)와 이 메시지 기록 클래스를 쉽게 결합할 수 있습니다.

이를 위해 OpenAI를 사용해야 하므로 해당 패키지를 설치해야 합니다.

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
