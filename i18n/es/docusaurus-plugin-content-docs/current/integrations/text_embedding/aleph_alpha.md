---
translated: true
---

# Aleph Alpha

Hay dos formas posibles de usar los incrustaciones semánticas de Aleph Alpha. Si tiene textos con una estructura disímil (por ejemplo, un documento y una consulta), querrá usar incrustaciones asimétricas. Por el contrario, para textos con estructuras comparables, se sugiere el enfoque de incrustaciones simétricas.

## Asimétrico

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

## Simétrico

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
