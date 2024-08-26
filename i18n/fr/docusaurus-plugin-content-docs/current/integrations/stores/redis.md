---
sidebar_label: Redis
translated: true
---

# RedisStore

Le `RedisStore` est une implémentation de `ByteStore` qui stocke tout dans votre instance Redis.

Pour configurer Redis, suivez notre [guide Redis](/docs/integrations/providers/redis).

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
