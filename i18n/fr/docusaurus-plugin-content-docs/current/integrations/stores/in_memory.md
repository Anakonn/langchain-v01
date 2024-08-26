---
keywords:
- InMemoryStore
sidebar_label: En mémoire
sidebar_position: 2
translated: true
---

# InMemoryByteStore

Le `InMemoryByteStore` est une implémentation non persistante de `ByteStore` qui stocke tout dans un dictionnaire Python.

```python
from langchain.storage import InMemoryByteStore

store = InMemoryByteStore()

store.mset([("k1", b"v1"), ("k2", b"v2")])
print(store.mget(["k1", "k2"]))
```

```output
[b'v1', b'v2']
```
