---
translated: true
---

# MongoDB

>`MongoDB`는 크로스 플랫폼 문서 지향 데이터베이스 프로그램입니다. `NoSQL` 데이터베이스 프로그램으로 분류되며, `JSON`과 유사한 문서와 선택적 스키마를 사용합니다.
>
>`MongoDB`는 MongoDB Inc.에서 개발되었으며 Server Side Public License (SSPL)에 따라 라이선스가 부여됩니다. - [Wikipedia](https://en.wikipedia.org/wiki/MongoDB)

이 노트북은 `MongoDBChatMessageHistory` 클래스를 사용하여 채팅 메시지 기록을 Mongodb 데이터베이스에 저장하는 방법을 설명합니다.

## 설정

이 통합은 `langchain-mongodb` 패키지에 있으므로 이를 설치해야 합니다.

```bash
pip install -U --quiet langchain-mongodb
```

[LangSmith](https://smith.langchain.com/)를 설정하면 최고 수준의 관찰 기능을 사용할 수 있습니다(필수는 아님).

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 사용법

스토리지를 사용하려면 다음 두 가지만 제공하면 됩니다:

1. 세션 ID - 사용자 이름, 이메일, 채팅 ID 등과 같은 세션의 고유 식별자
2. 연결 문자열 - MongoDB create_engine 함수에 전달될 데이터베이스 연결을 지정하는 문자열

채팅 기록을 저장할 위치를 사용자 정의하려면 다음을 전달할 수도 있습니다:
1. *database_name* - 사용할 데이터베이스 이름
1. *collection_name* - 해당 데이터베이스 내의 컬렉션

```python
from langchain_mongodb.chat_message_histories import MongoDBChatMessageHistory

chat_message_history = MongoDBChatMessageHistory(
    session_id="test_session",
    connection_string="mongodb://mongo_user:password123@mongo:27017",
    database_name="my_db",
    collection_name="chat_histories",
)

chat_message_history.add_user_message("Hello")
chat_message_history.add_ai_message("Hi")
```

```python
chat_message_history.messages
```

```output
[HumanMessage(content='Hello'), AIMessage(content='Hi')]
```

## 체이닝

[LCEL Runnables](/docs/expression_language/how_to/message_history)와 이 메시지 기록 클래스를 쉽게 결합할 수 있습니다.

이를 위해 OpenAI를 사용해야 하므로 해당 패키지를 설치해야 합니다. 또한 OPENAI_API_KEY 환경 변수를 OpenAI 키로 설정해야 합니다.

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
```

```python
import os

assert os.environ[
    "OPENAI_API_KEY"
], "Set the OPENAI_API_KEY environment variable with your OpenAI API key."
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
    lambda session_id: MongoDBChatMessageHistory(
        session_id=session_id,
        connection_string="mongodb://mongo_user:password123@mongo:27017",
        database_name="my_db",
        collection_name="chat_histories",
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
AIMessage(content='Hi Bob! How can I assist you today?')
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content='Your name is Bob. Is there anything else I can help you with, Bob?')
```
