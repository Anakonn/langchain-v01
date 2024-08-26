---
translated: true
---

# Representaciones Falsas

LangChain también proporciona una clase de representación falsa. Puedes usarla para probar tus canalizaciones.

```python
from langchain_community.embeddings import FakeEmbeddings
```

```python
embeddings = FakeEmbeddings(size=1352)
```

```python
query_result = embeddings.embed_query("foo")
```

```python
doc_results = embeddings.embed_documents(["foo"])
```
