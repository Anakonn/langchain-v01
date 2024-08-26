---
sidebar_label: 로컬 파일 시스템
sidebar_position: 3
translated: true
---

# LocalFileStore

`LocalFileStore`는 선택한 폴더에 모든 것을 저장하는 `ByteStore`의 지속적인 구현입니다.

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

이제 `data` 폴더에 어떤 파일이 있는지 확인해 보겠습니다:

```python
!ls {root_path}
```

```output
k1 k2
```
