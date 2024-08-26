---
translated: true
---

# SingleStoreDB

Ce cahier passe en revue comment utiliser SingleStoreDB pour stocker l'historique des messages de chat.

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
