---
translated: true
---

# Jina

Jina の Embedding クラスをロードしましょう。

```python
from langchain_community.embeddings import JinaEmbeddings
```

```python
embeddings = JinaEmbeddings(
    jina_api_key="jina_*", model_name="jina-embeddings-v2-base-en"
)
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
print(query_result)
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
print(doc_result)
```
