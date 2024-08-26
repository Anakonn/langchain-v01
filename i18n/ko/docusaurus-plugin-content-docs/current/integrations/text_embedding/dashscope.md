---
translated: true
---

# DashScope

DashScope Embedding 클래스를 로드해 보겠습니다.

```python
from langchain_community.embeddings import DashScopeEmbeddings
```

```python
embeddings = DashScopeEmbeddings(
    model="text-embedding-v1", dashscope_api_key="your-dashscope-api-key"
)
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
print(query_result)
```

```python
doc_results = embeddings.embed_documents(["foo"])
print(doc_results)
```
