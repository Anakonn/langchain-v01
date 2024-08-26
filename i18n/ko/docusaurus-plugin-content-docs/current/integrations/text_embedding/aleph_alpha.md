---
translated: true
---

# Aleph Alpha

Aleph Alpha의 의미 임베딩을 사용하는 두 가지 방법이 있습니다. 문서와 쿼리와 같이 구조가 다른 텍스트를 사용하는 경우 비대칭 임베딩을 사용하는 것이 좋습니다. 반대로, 구조가 유사한 텍스트의 경우 대칭 임베딩을 사용하는 것이 권장됩니다.

## 비대칭

```python
from langchain_community.embeddings import AlephAlphaAsymmetricSemanticEmbedding
```

```python
document = "This is a content of the document"
query = "What is the content of the document?"
```

```python
embeddings = AlephAlphaAsymmetricSemanticEmbedding(normalize=True, compress_to_size=128)
```

```python
doc_result = embeddings.embed_documents([document])
```

```python
query_result = embeddings.embed_query(query)
```

## 대칭

```python
from langchain_community.embeddings import AlephAlphaSymmetricSemanticEmbedding
```

```python
text = "This is a test text"
```

```python
embeddings = AlephAlphaSymmetricSemanticEmbedding(normalize=True, compress_to_size=128)
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
query_result = embeddings.embed_query(text)
```
