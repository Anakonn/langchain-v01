---
canonical: https://python.langchain.com/v0.1/docs/integrations/stores/upstash_redis
sidebar_label: Upstash Redis
translated: false
---

# UpstashRedisByteStore

The `UpstashRedisStore` is an implementation of `ByteStore` that stores everything in your Upstash-hosted Redis instance.

To use the base `RedisStore` instead, see [this guide](/docs/integrations/stores/redis/)

To configure Upstash Redis, follow our [Upstash guide](/docs/integrations/providers/upstash).

```python
%pip install --upgrade --quiet  upstash-redis
```

```python
from langchain.storage import UpstashRedisByteStore
from upstash_redis import Redis

URL = "<UPSTASH_REDIS_REST_URL>"
TOKEN = "<UPSTASH_REDIS_REST_TOKEN>"

redis_client = Redis(url=URL, token=TOKEN)
store = UpstashRedisByteStore(client=redis_client, ttl=None, namespace="test-ns")

store.mset([("k1", b"v1"), ("k2", b"v2")])
print(store.mget(["k1", "k2"]))
```

```output
[b'v1', b'v2']
```