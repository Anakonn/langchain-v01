---
sidebar_label: Redis
translated: true
---

# RedisStore

El `RedisStore` es una implementación de `ByteStore` que almacena todo en tu instancia de Redis.

Para configurar Redis, sigue nuestra [guía de Redis](/docs/integrations/providers/redis).

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
