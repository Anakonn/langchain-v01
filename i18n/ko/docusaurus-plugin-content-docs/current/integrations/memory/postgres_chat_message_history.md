---
translated: true
---

# PostgreSQL

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL) 또한 `Postgres`로 알려져 있는 무료 오픈 소스 관계형 데이터베이스 관리 시스템(RDBMS)으로, 확장성과 SQL 준수성에 중점을 두고 있습니다.

이 노트북에서는 Postgres를 사용하여 채팅 메시지 기록을 저장하는 방법을 살펴봅니다.

```python
from langchain_community.chat_message_histories import (
    PostgresChatMessageHistory,
)

history = PostgresChatMessageHistory(
    connection_string="postgresql://postgres:mypassword@localhost/chat_history",
    session_id="foo",
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```
