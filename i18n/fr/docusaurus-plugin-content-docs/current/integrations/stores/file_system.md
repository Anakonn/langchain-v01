---
sidebar_label: Système de fichiers local
sidebar_position: 3
translated: true
---

# LocalFileStore

Le `LocalFileStore` est une implémentation persistante de `ByteStore` qui stocke tout dans un dossier de votre choix.

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

Voyons maintenant quels fichiers existent dans notre dossier `data` :

```python
!ls {root_path}
```

```output
k1 k2
```
