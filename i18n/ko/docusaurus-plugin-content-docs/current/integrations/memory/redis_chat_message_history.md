---
translated: true
---

# Redis

>[Redis (Remote Dictionary Server)](https://en.wikipedia.org/wiki/Redis)는 분산 메모리 키-값 데이터베이스, 캐시 및 메시지 브로커로 사용되는 오픈 소스 메모리 저장소입니다. 모든 데이터를 메모리에 보유하고 설계상 특징으로 인해 `Redis`는 읽기 및 쓰기 지연 시간이 낮아 캐시가 필요한 사용 사례에 특히 적합합니다. Redis는 가장 인기 있는 NoSQL 데이터베이스이자 전체 데이터베이스 중 하나입니다.

이 노트북에서는 `Redis`를 사용하여 채팅 메시지 기록을 저장하는 방법을 살펴봅니다.

## 설정

먼저 종속성을 설치하고 `redis-server` 명령을 사용하여 Redis 인스턴스를 시작해야 합니다.

```python
pip install -U langchain-community redis
```

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory
```

## 메시지 저장 및 검색

```python
history = RedisChatMessageHistory("foo", url="redis://localhost:6379")

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

## Chains에서 사용하기

```python
pip install -U langchain-openai
```

```python
from typing import Optional

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You're an assistant。"),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()

chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: RedisChatMessageHistory(
        session_id, url="redis://localhost:6379"
    ),
    input_messages_key="question",
    history_messages_key="history",
)

config = {"configurable": {"session_id": "foo"}}

chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)

chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content='Your name is Bob, as you mentioned earlier. Is there anything specific you would like assistance with, Bob?')
```
