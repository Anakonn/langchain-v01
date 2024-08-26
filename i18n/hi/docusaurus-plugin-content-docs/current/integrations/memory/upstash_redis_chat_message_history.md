---
translated: true
---

# उपस्थ रेडिस

>[उपस्थ](https://upstash.com/docs/introduction) एक सर्वरलेस `रेडिस`, `कफ़्का`, और `क्यूस्टैश` एपीआई प्रदाता है।

यह नोटबुक चैट संदेश इतिहास को संग्रहित करने के लिए `उपस्थ रेडिस` का उपयोग करने के बारे में बताता है।

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
