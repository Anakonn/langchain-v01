---
translated: true
---

# FireworksEmbeddings

Ce notebook explique comment utiliser Fireworks Embeddings, qui est inclus dans le package langchain_fireworks, pour incorporer des textes dans langchain. Nous utilisons le modèle par défaut nomic-ai v1.5 dans cet exemple.

```python
%pip install -qU langchain-fireworks
```

## Configuration

```python
from langchain_fireworks import FireworksEmbeddings
```

```python
import getpass
import os

if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Fireworks API Key:")
```

# Utilisation du modèle d'incorporation

Avec `FireworksEmbeddings`, vous pouvez directement utiliser le modèle par défaut 'nomic-ai/nomic-embed-text-v1.5', ou en définir un différent s'il est disponible.

```python
embedding = FireworksEmbeddings(model="nomic-ai/nomic-embed-text-v1.5")
```

```python
res_query = embedding.embed_query("The test information")
res_document = embedding.embed_documents(["test1", "another test"])
print(res_query[:5])
print(res_document[1][:5])
```

```output
[0.01367950439453125, 0.0103607177734375, -0.157958984375, -0.003070831298828125, 0.05926513671875]
[0.0369873046875, 0.00545501708984375, -0.179931640625, -0.018707275390625, 0.0552978515625]
```
