---
translated: true
---

# समवर्ती लोडर

GenericLoader की तरह काम करता है लेकिन उन लोगों के लिए समवर्ती रूप से जो अपने कार्यप्रवाह को अनुकूलित करना चुनते हैं।

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
