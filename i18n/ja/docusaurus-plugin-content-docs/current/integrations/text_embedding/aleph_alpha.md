---
translated: true
---

# Aleph Alpha

Aleph Alphaのセマンティック埋め込みを使う方法は2つあります。テキストの構造が異なる(例えば、ドキュメントとクエリ)場合は、非対称埋め込みを使用する必要があります。一方、構造が同等のテキストの場合は、対称埋め込みを使用することをお勧めします。

## 非対称

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

## 対称

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
