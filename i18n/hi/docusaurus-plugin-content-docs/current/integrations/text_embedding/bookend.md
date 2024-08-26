---
translated: true
---

# बुकएंड एआई

चलो बुकएंड एआई एम्बेडिंग्स क्लास को लोड करें।

```python
from langchain_community.embeddings import BookendEmbeddings
```

```python
embeddings = BookendEmbeddings(
    domain="your_domain",
    api_token="your_api_token",
    model_id="your_embeddings_model_id",
)
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```
