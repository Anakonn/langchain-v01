---
sidebar_label: Redis
translated: true
---

# RedisStore

`RedisStore`は、すべてをRedisインスタンスに保存する`ByteStore`の実装です。

Redisを設定するには、[Redisガイド](/docs/integrations/providers/redis)に従ってください。

```python
%pip install --upgrade --quiet  redis
```

```python
from langchain.storage import RedisStore

store = RedisStore(redis_url="redis://localhost:6379")

store.mset([("k1", b"v1"), ("k2", b"v2")])
print(store.mget(["k1", "k2"]))
```

```output
[b'v1', b'v2']
```
