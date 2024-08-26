---
translated: true
---

# Étendue du modèle

>[Étendue du modèle](https://www.modelscope.cn/home) est un grand référentiel des modèles et des jeux de données.

Chargeons la classe Embedding d'Étendue du modèle.

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
