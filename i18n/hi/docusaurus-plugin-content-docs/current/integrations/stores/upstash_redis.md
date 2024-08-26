---
sidebar_label: उपस्थ रेडिस
translated: true
---

# UpstashRedisByteStore

`UpstashRedisStore` `ByteStore` का एक कार्यान्वयन है जो सब कुछ आपके Upstash-होस्टेड रेडिस इंस्टैंस में संग्रहीत करता है।

बेस `RedisStore` का उपयोग करने के लिए, [इस गाइड](/docs/integrations/stores/redis/) देखें।

Upstash रेडिस को कॉन्फ़िगर करने के लिए, हमारे [Upstash गाइड](/docs/integrations/providers/upstash) का पालन करें।

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
