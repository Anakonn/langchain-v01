---
translated: true
---

# SingleStoreDB

यह नोटबुक SingleStoreDB का उपयोग करके चैट संदेश इतिहास को कैसे संग्रहीत करें, इस पर चर्चा करता है।

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
