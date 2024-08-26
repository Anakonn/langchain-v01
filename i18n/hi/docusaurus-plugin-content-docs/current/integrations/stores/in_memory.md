---
keywords:
- InMemoryStore
sidebar_label: मेमोरी में
sidebar_position: 2
translated: true
---

# InMemoryByteStore

`InMemoryByteStore` एक गैर-स्थायी `ByteStore` कार्यान्वयन है जो सब कुछ एक Python डिक्शनरी में संग्रहीत करता है।

```python
from langchain.storage import InMemoryByteStore

store = InMemoryByteStore()

store.mset([("k1", b"v1"), ("k2", b"v2")])
print(store.mget(["k1", "k2"]))
```

```output
[b'v1', b'v2']
```
