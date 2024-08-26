---
translated: true
---

# Faux Embeddings

LangChain fournit également une classe d'embeddings factices. Vous pouvez l'utiliser pour tester vos pipelines.

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
