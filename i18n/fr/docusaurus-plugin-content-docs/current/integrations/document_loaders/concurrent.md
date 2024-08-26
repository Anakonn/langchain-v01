---
translated: true
---

# Chargeur concurrent

Fonctionne tout comme le GenericLoader mais de manière concurrente pour ceux qui choisissent d'optimiser leur flux de travail.

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
