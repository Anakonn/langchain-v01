---
translated: true
---

# Postgres

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL) également connu sous le nom de `Postgres`, est un système de gestion de base de données relationnelle (SGBDR) gratuit et open source mettant l'accent sur l'extensibilité et la conformité SQL.

Ce notebook passe en revue comment utiliser Postgres pour stocker l'historique des messages de discussion.

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
