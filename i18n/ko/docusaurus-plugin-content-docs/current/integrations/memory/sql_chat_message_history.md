---
translated: true
---

# SQL (SQLAlchemy)

>[Structured Query Language (SQL)](https://en.wikipedia.org/wiki/SQL)은 관계형 데이터베이스 관리 시스템(RDBMS) 또는 관계형 데이터 스트림 관리 시스템(RDSMS)에서 데이터를 관리하기 위해 사용되는 도메인 특화 언어입니다. 이는 특히 엔티티와 변수 간의 관계를 포함하는 구조화된 데이터를 처리하는 데 유용합니다.

>[SQLAlchemy](https://github.com/sqlalchemy/sqlalchemy)는 MIT 라이선스 하에 릴리스된 Python 프로그래밍 언어용 오픈 소스 `SQL` 툴킷 및 객체-관계 매퍼(ORM)입니다.

이 노트북은 `SQLAlchemy`에서 지원하는 모든 데이터베이스에 채팅 기록을 저장할 수 있는 `SQLChatMessageHistory` 클래스를 다룹니다.

`SQLite` 이외의 데이터베이스를 사용하려면 해당 데이터베이스 드라이버를 설치해야 합니다.

## 설정

이 통합은 `langchain-community` 패키지에 있으므로 이를 설치해야 합니다. 또한 `SQLAlchemy` 패키지도 설치해야 합니다.

```bash
pip install -U langchain-community SQLAlchemy langchain-openai
```

[LangSmith](https://smith.langchain.com/)를 설정하면 최고 수준의 관찰 기능을 사용할 수 있습니다(필수는 아님).

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 사용법

스토리지를 사용하려면 다음 두 가지만 제공하면 됩니다:

1. 세션 ID - 사용자 이름, 이메일, 채팅 ID 등과 같은 세션의 고유 식별자
2. 연결 문자열 - SQLAlchemy의 create_engine 함수에 전달될 데이터베이스 연결을 지정하는 문자열

```python
from langchain_community.chat_message_histories import SQLChatMessageHistory

chat_message_history = SQLChatMessageHistory(
    session_id="test_session", connection_string="sqlite:///sqlite.db"
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

이 메시지 기록 클래스를 [LCEL Runnables](/docs/expression_language/how_to/message_history)와 쉽게 결합할 수 있습니다.

이를 위해 OpenAI를 사용해야 하므로 이를 설치해야 합니다.

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
    lambda session_id: SQLChatMessageHistory(
        session_id=session_id, connection_string="sqlite:///sqlite.db"
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
