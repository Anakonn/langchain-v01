---
translated: true
---

# 모델스코프

>[ModelScope](https://www.modelscope.cn/home)는 모델과 데이터셋의 큰 저장소입니다.

모델스코프 임베딩 클래스를 로드해 보겠습니다.

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
