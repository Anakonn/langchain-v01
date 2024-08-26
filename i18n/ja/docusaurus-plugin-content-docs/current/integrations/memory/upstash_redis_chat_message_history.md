---
translated: true
---

# Upstash Redis

>[Upstash](https://upstash.com/docs/introduction)は、サーバーレスの`Redis`、`Kafka`、および`QStash` APIを提供するプロバイダーです。

このノートブックでは、`Upstash Redis`を使ってチャットメッセージの履歴を保存する方法について説明します。

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
