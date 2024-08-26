---
sidebar_label: Sistema de archivos local
sidebar_position: 3
translated: true
---

# LocalFileStore

El `LocalFileStore` es una implementación persistente de `ByteStore` que almacena todo en una carpeta de su elección.

```python
from pathlib import Path

from langchain.storage import LocalFileStore

root_path = Path.cwd() / "data"  # can also be a path set by a string
store = LocalFileStore(root_path)

store.mset([("k1", b"v1"), ("k2", b"v2")])
print(store.mget(["k1", "k2"]))
```

```output
[b'v1', b'v2']
```

Ahora veamos qué archivos existen en nuestra carpeta `data`:

```python
!ls {root_path}
```

```output
k1 k2
```
