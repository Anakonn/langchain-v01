---
canonical: https://python.langchain.com/v0.1/docs/integrations/stores/redis
sidebar_label: Redis
translated: false
---

# RedisStore

The `RedisStore` is an implementation of `ByteStore` that stores everything in your Redis instance.

To configure Redis, follow our [Redis guide](/docs/integrations/providers/redis).

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