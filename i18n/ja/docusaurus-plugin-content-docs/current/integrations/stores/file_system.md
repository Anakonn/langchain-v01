---
sidebar_label: ローカルファイルシステム
sidebar_position: 3
translated: true
---

# LocalFileStore

`LocalFileStore`は、選択したフォルダに全てを保存する`ByteStore`の永続的な実装です。

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

では、`data`フォルダにどのようなファイルが存在するかを確認しましょう:

```python
!ls {root_path}
```

```output
k1 k2
```
