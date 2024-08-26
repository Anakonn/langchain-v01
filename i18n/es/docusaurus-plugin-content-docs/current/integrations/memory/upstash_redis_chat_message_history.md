---
translated: true
---

# Upstash Redis

>[Upstash](https://upstash.com/docs/introduction) es un proveedor de las API sin servidor de `Redis`, `Kafka` y `QStash`.

Este cuaderno analiza cómo usar `Upstash Redis` para almacenar el historial de mensajes de chat.

```python
from langchain_community.chat_message_histories import (
    UpstashRedisChatMessageHistory,
)

URL = "<UPSTASH_REDIS_REST_URL>"
TOKEN = "<UPSTASH_REDIS_REST_TOKEN>"

history = UpstashRedisChatMessageHistory(
    url=URL, token=TOKEN, ttl=10, session_id="my-test-session"
)

history.add_user_message("hello llm!")
history.add_ai_message("hello user!")
```

```python
history.messages
```
