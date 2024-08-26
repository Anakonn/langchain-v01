---
translated: true
---

# 偽のエンベディング

LangChainには、偽のエンベディングクラスも提供されています。これを使用して、パイプラインをテストすることができます。

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
