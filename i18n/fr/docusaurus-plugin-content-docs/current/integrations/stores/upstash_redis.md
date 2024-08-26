---
sidebar_label: Upstash Redis
translated: true
---

# UpstashRedisByteStore

Le `UpstashRedisStore` est une implémentation de `ByteStore` qui stocke tout dans votre instance Redis hébergée par Upstash.

Pour utiliser la base `RedisStore` à la place, voir [ce guide](/docs/integrations/stores/redis/)

Pour configurer Upstash Redis, suivez notre [guide Upstash](/docs/integrations/providers/upstash).

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
