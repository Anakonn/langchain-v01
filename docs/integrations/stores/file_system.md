---
canonical: https://python.langchain.com/v0.1/docs/integrations/stores/file_system
sidebar_label: Local Filesystem
sidebar_position: 3
translated: false
---

# LocalFileStore

The `LocalFileStore` is a persistent implementation of `ByteStore` that stores everything in a folder of your choosing.

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

Now let's see which files exist in our `data` folder:

```python
!ls {root_path}
```

```output
k1 k2
```