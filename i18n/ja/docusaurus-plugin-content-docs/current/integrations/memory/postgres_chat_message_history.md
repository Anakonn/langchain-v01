---
translated: true
---

# PostgreSQL

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL)、通称 `Postgres` は、拡張性とSQL準拠に重点を置いた、無料でオープンソースのリレーショナルデータベース管理システム (RDBMS) です。

このノートブックでは、Postgresを使ってチャットメッセージの履歴を保存する方法について説明します。

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
