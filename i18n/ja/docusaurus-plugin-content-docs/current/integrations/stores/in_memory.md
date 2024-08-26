---
keywords:
- InMemoryStore
sidebar_label: メモリ内
sidebar_position: 2
translated: true
---

# InMemoryByteStore

`InMemoryByteStore`は、すべてをPythonの辞書に格納する`ByteStore`の非永続的な実装です。

```python
from langchain.storage import InMemoryByteStore

store = InMemoryByteStore()

store.mset([("k1", b"v1"), ("k2", b"v2")])
print(store.mget(["k1", "k2"]))
```

```output
[b'v1', b'v2']
```
