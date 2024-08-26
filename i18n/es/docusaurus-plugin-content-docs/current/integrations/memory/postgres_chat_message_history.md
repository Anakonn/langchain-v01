---
translated: true
---

# Postgres

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL) también conocido como `Postgres`, es un sistema de gestión de bases de datos relacionales (RDBMS) gratuito y de código abierto que hace énfasis en la extensibilidad y el cumplimiento de SQL.

Este cuaderno repasa cómo usar Postgres para almacenar el historial de mensajes de chat.

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
