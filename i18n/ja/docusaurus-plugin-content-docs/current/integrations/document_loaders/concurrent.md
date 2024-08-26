---
translated: true
---

# 並行ローダー

GenericLoader と同様に機能しますが、ワークフローを最適化したい人のために並行して動作します。

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
