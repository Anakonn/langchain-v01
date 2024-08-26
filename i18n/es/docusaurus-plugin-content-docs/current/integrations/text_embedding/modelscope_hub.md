---
translated: true
---

# ModelScope

>[ModelScope](https://www.modelscope.cn/home) es un gran repositorio de modelos y conjuntos de datos.

Vamos a cargar la clase ModelScope Embedding.

```python
from langchain_community.embeddings import ModelScopeEmbeddings
```

```python
model_id = "damo/nlp_corom_sentence-embedding_english-base"
```

```python
embeddings = ModelScopeEmbeddings(model_id=model_id)
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_results = embeddings.embed_documents(["foo"])
```
