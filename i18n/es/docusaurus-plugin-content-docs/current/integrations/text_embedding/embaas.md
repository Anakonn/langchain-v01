---
translated: true
---

# Embaas

[embaas](https://embaas.io) es un servicio de API de NLP totalmente administrado que ofrece funciones como generación de incrustaciones, extracción de texto de documentos, documentos a incrustaciones y más. Puede elegir una [variedad de modelos previamente entrenados](https://embaas.io/docs/models/embeddings).

En este tutorial, le mostraremos cómo usar la API de incrustaciones de embaas para generar incrustaciones para un texto dado.

### Requisitos previos

Cree su cuenta gratuita de embaas en [https://embaas.io/register](https://embaas.io/register) y genere una [clave API](https://embaas.io/dashboard/api-keys).

```python
import os

# Set API key
embaas_api_key = "YOUR_API_KEY"
# or set environment variable
os.environ["EMBAAS_API_KEY"] = "YOUR_API_KEY"
```

```python
from langchain_community.embeddings import EmbaasEmbeddings
```

```python
embeddings = EmbaasEmbeddings()
```

```python
# Create embeddings for a single document
doc_text = "This is a test document."
doc_text_embedding = embeddings.embed_query(doc_text)
```

```python
# Print created embedding
print(doc_text_embedding)
```

```python
# Create embeddings for multiple documents
doc_texts = ["This is a test document.", "This is another test document."]
doc_texts_embeddings = embeddings.embed_documents(doc_texts)
```

```python
# Print created embeddings
for i, doc_text_embedding in enumerate(doc_texts_embeddings):
    print(f"Embedding for document {i + 1}: {doc_text_embedding}")
```

```python
# Using a different model and/or custom instruction
embeddings = EmbaasEmbeddings(
    model="instructor-large",
    instruction="Represent the Wikipedia document for retrieval",
)
```

Para obtener información más detallada sobre la API de incrustaciones de embaas, consulte [la documentación oficial de la API de embaas](https://embaas.io/api-reference).
