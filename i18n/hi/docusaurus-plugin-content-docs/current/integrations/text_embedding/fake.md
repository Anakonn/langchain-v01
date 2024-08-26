---
translated: true
---

# नकली एम्बेडिंग्स

LangChain एक नकली एम्बेडिंग वर्ग भी प्रदान करता है। आप अपने पाइपलाइन को परीक्षण करने के लिए इसका उपयोग कर सकते हैं।

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
