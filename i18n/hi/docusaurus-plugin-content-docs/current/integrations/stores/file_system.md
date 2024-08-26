---
sidebar_label: स्थानीय फ़ाइलसिस्टम
sidebar_position: 3
translated: true
---

# LocalFileStore

`LocalFileStore` एक `ByteStore` का स्थायी कार्यान्वयन है जो सब कुछ आपके द्वारा चुने गए फ़ोल्डर में संग्रहित करता है।

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

अब आइए देखते हैं कि हमारे `data` फ़ोल्डर में कौन-कौन सी फ़ाइलें मौजूद हैं:

```python
!ls {root_path}
```

```output
k1 k2
```
