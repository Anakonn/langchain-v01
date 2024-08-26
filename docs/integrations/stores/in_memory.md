---
canonical: https://python.langchain.com/v0.1/docs/integrations/stores/in_memory
keywords:
- InMemoryStore
sidebar_label: In Memory
sidebar_position: 2
translated: false
---

# InMemoryByteStore

The `InMemoryByteStore` is a non-persistent implementation of `ByteStore` that stores everything in a Python dictionary.

```python
from langchain.storage import InMemoryByteStore

store = InMemoryByteStore()

store.mset([("k1", b"v1"), ("k2", b"v2")])
print(store.mget(["k1", "k2"]))
```

```output
[b'v1', b'v2']
```