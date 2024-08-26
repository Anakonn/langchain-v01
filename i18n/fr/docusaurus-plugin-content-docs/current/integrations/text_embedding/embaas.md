---
translated: true
---

# Embaas

[embaas](https://embaas.io) est un service d'API NLP entièrement géré qui offre des fonctionnalités telles que la génération d'embeddings, l'extraction de texte de document, le document vers les embeddings et plus encore. Vous pouvez choisir parmi une [variété de modèles pré-entraînés](https://embaas.io/docs/models/embeddings).

Dans ce tutoriel, nous vous montrerons comment utiliser l'API Embeddings d'embaas pour générer des embeddings pour un texte donné.

### Prérequis

Créez votre compte embaas gratuit sur [https://embaas.io/register](https://embaas.io/register) et générez une [clé API](https://embaas.io/dashboard/api-keys).

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

Pour plus d'informations détaillées sur l'API Embeddings d'embaas, veuillez vous référer à [la documentation officielle de l'API embaas](https://embaas.io/api-reference).
