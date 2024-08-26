---
keywords:
- InMemoryStore
sidebar_label: 메모리 내
sidebar_position: 2
translated: true
---

# InMemoryByteStore

`InMemoryByteStore`는 모든 것을 Python 사전에 저장하는 `ByteStore`의 비영구적 구현입니다.

```python
from langchain.storage import InMemoryByteStore

store = InMemoryByteStore()

store.mset([("k1", b"v1"), ("k2", b"v2")])
print(store.mget(["k1", "k2"]))
```

```output
[b'v1', b'v2']
```
