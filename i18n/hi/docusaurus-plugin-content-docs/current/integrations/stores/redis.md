---
sidebar_label: रेडिस
translated: true
---

# RedisStore

`RedisStore` `ByteStore` का एक कार्यान्वयन है जो सब कुछ आपके रेडिस इंस्टांस में संग्रहित करता है।

रेडिस को कॉन्फ़िगर करने के लिए, हमारे [रेडिस गाइड](/docs/integrations/providers/redis) का पालन करें।

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
