---
translated: true
---

# Aleph Alpha

Il existe deux façons possibles d'utiliser les embeddings sémantiques d'Aleph Alpha. Si vous avez des textes avec une structure dissemblable (par exemple un document et une requête), vous voudrez utiliser des embeddings asymétriques. À l'inverse, pour des textes avec des structures comparables, les embeddings symétriques sont la méthode recommandée.

## Asymétrique

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

## Symétrique

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
