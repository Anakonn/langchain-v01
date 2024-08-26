---
translated: true
---

# SingleStoreDB

이 노트북은 SingleStoreDB를 사용하여 채팅 메시지 기록을 저장하는 방법을 다룹니다.

```python
from langchain_community.chat_message_histories import (
    SingleStoreDBChatMessageHistory,
)

history = SingleStoreDBChatMessageHistory(
    session_id="foo", host="root:pass@localhost:3306/db"
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```
