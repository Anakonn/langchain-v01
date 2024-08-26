---
sidebar_label: Redis
translated: true
---

# RedisStore

`RedisStore`는 모든 것을 Redis 인스턴스에 저장하는 `ByteStore`의 구현입니다.

Redis를 구성하려면 [Redis 가이드](/docs/integrations/providers/redis)를 따르세요.

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
