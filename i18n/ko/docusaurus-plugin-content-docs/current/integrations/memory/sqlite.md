---
translated: true
---

# SQLite

>[SQLite](https://en.wikipedia.org/wiki/SQLite)는 C 프로그래밍 언어로 작성된 데이터베이스 엔진입니다. 독립형 애플리케이션이 아니라 소프트웨어 개발자가 자신의 애플리케이션에 포함시키는 라이브러리입니다. 따라서 임베디드 데이터베이스 제품군에 속합니다. 주요 웹 브라우저, 운영 체제, 모바일 폰 및 기타 임베디드 시스템에 널리 사용되는 가장 널리 배포된 데이터베이스 엔진입니다.

이 연습에서는 `SqliteEntityStore`로 지원되는 `ConversationEntityMemory`를 사용하는 간단한 대화 체인을 만들 것입니다.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 사용법

스토리지를 사용하려면 다음 2가지만 제공하면 됩니다:

1. 세션 ID - 사용자 이름, 이메일, 채팅 ID 등과 같은 세션의 고유 식별자.
2. 연결 문자열 - 데이터베이스 연결을 지정하는 문자열입니다. SQLite의 경우 `slqlite:///`로 시작하고 데이터베이스 파일 이름이 뒤따릅니다. 해당 파일이 없으면 생성됩니다.

```python
from langchain_community.chat_message_histories import SQLChatMessageHistory

chat_message_history = SQLChatMessageHistory(
    session_id="test_session_id", connection_string="sqlite:///sqlite.db"
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

## 체인

[LCEL Runnables](/docs/expression_language/how_to/message_history)와 이 메시지 기록 클래스를 쉽게 결합할 수 있습니다.

이를 위해 OpenAI를 사용해야 하므로 해당 패키지를 설치해야 합니다. 또한 OPENAI_API_KEY 환경 변수를 OpenAI 키로 설정해야 합니다.

```bash
pip install -U langchain-openai

export OPENAI_API_KEY='sk-xxxxxxx'
```

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
config = {"configurable": {"session_id": "<SQL_SESSION_ID>"}}
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
