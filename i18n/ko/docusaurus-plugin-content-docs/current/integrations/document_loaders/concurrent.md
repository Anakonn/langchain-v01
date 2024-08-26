---
translated: true
---

# 동시 로더

GenericLoader와 똑같이 작동하지만 워크플로우를 최적화하고자 하는 사용자들을 위해 동시에 작동합니다.

```python
from langchain_community.document_loaders import ConcurrentLoader
```

```python
loader = ConcurrentLoader.from_filesystem("example_data/", glob="**/*.txt")
```

```python
files = loader.load()
```

```python
len(files)
```

```output
2
```

