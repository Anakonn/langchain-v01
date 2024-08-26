---
sidebar_label: Upstash Redis
translated: true
---

# UpstashRedisByteStore

El `UpstashRedisStore` es una implementación de `ByteStore` que almacena todo en su instancia de Redis alojada en Upstash.

Para usar la base `RedisStore` en su lugar, consulte [esta guía](/docs/integrations/stores/redis/)

Para configurar Upstash Redis, siga nuestra [guía de Upstash](/docs/integrations/providers/upstash).

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
