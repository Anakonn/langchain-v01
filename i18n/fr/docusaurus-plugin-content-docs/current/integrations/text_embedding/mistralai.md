---
translated: true
---

# MistralAI

Ce notebook explique comment utiliser MistralAIEmbeddings, qui est inclus dans le package langchain_mistralai, pour incorporer des textes dans langchain.

```python
# pip install -U langchain-mistralai
```

## importer la bibliothèque

```python
from langchain_mistralai import MistralAIEmbeddings
```

```python
embedding = MistralAIEmbeddings(api_key="your-api-key")
```

# Utilisation du modèle d'incorporation

Avec `MistralAIEmbeddings`, vous pouvez utiliser directement le modèle par défaut 'mistral-embed', ou en définir un différent s'il est disponible.

```python
embedding.model = "mistral-embed"  # or your preferred model if available
```

```python
res_query = embedding.embed_query("The test information")
res_document = embedding.embed_documents(["test1", "another test"])
```
