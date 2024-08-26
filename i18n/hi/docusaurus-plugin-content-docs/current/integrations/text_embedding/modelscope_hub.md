---
translated: true
---

# मॉडलस्कोप

>[मॉडलस्कोप](https://www.modelscope.cn/home) मॉडल और डेटासेट का एक बड़ा भंडार है।

चलो मॉडलस्कोप एम्बेडिंग क्लास को लोड करें।

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
