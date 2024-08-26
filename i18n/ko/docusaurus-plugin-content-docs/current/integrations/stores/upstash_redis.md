---
sidebar_label: Upstash Redis
translated: true
---

# UpstashRedisByteStore

`UpstashRedisStore`는 모든 것을 Upstash 호스팅 Redis 인스턴스에 저장하는 `ByteStore` 구현입니다.

기본 `RedisStore`를 사용하려면 [이 가이드](/docs/integrations/stores/redis/)를 참조하세요.

Upstash Redis를 구성하려면 [Upstash 가이드](/docs/integrations/providers/upstash)를 따르세요.

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
