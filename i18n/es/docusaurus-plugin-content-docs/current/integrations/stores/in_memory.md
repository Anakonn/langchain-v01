---
keywords:
- InMemoryStore
sidebar_label: En memoria
sidebar_position: 2
translated: true
---

# InMemoryByteStore

El `InMemoryByteStore` es una implementación no persistente de `ByteStore` que almacena todo en un diccionario de Python.

```python
from langchain.storage import InMemoryByteStore

store = InMemoryByteStore()

store.mset([("k1", b"v1"), ("k2", b"v2")])
print(store.mget(["k1", "k2"]))
```

```output
[b'v1', b'v2']
```
