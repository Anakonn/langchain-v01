---
translated: true
---

# 가짜 임베딩

LangChain은 또한 가짜 임베딩 클래스를 제공합니다. 이를 사용하여 파이프라인을 테스트할 수 있습니다.

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
