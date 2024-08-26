---
translated: true
---

# MistralAI

Este cuaderno explica cómo usar MistralAIEmbeddings, que se incluye en el paquete langchain_mistralai, para incrustar textos en langchain.

```python
# pip install -U langchain-mistralai
```

## importar la biblioteca

```python
from langchain_mistralai import MistralAIEmbeddings
```

```python
embedding = MistralAIEmbeddings(api_key="your-api-key")
```

# Uso del modelo de incrustación

Con `MistralAIEmbeddings`, puede usar directamente el modelo predeterminado 'mistral-embed' o establecer uno diferente si está disponible.

```python
embedding.model = "mistral-embed"  # or your preferred model if available
```

```python
res_query = embedding.embed_query("The test information")
res_document = embedding.embed_documents(["test1", "another test"])
```
