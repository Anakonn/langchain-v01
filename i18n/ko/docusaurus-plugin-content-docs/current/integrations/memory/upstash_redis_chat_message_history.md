---
translated: true
---

# Upstash Redis

>[Upstash](https://upstash.com/docs/introduction)는 서버리스 `Redis`, `Kafka`, `QStash` API를 제공하는 업체입니다.

이 노트북에서는 `Upstash Redis`를 사용하여 채팅 메시지 기록을 저장하는 방법을 살펴봅니다.

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
