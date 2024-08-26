---
translated: true
---

# SingleStoreDB

このノートブックでは、SingleStoreDBを使ってチャットメッセージの履歴を保存する方法について説明します。

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
