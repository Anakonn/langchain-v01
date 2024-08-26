---
sidebar_label: Upstash Redis
translated: true
---

# UpstashRedisByteStore

`UpstashRedisStore`は、すべてをUpstash ホスト型Redis インスタンスに保存する`ByteStore`の実装です。

ベースの`RedisStore`を使用する場合は、[このガイド](/docs/integrations/stores/redis/)を参照してください。

Upstash Redisを設定するには、[Upstashガイド](/docs/integrations/providers/upstash)に従ってください。

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
