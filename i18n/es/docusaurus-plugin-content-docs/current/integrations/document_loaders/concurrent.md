---
translated: true
---

# Cargador Concurrente

Funciona igual que el GenericLoader pero de forma concurrente para aquellos que elijan optimizar su flujo de trabajo.

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
