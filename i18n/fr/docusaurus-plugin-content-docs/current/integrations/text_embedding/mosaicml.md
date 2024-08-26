---
translated: true
---

# MosaicML

>[MosaicML](https://docs.mosaicml.com/en/latest/inference.html) offre un service d'inférence géré. Vous pouvez soit utiliser une variété de modèles open-source, soit déployer le vôtre.

Cet exemple explique comment utiliser LangChain pour interagir avec l'inférence `MosaicML` pour l'intégration de texte.

```python
# sign up for an account: https://forms.mosaicml.com/demo?utm_source=langchain

from getpass import getpass

MOSAICML_API_TOKEN = getpass()
```

```python
import os

os.environ["MOSAICML_API_TOKEN"] = MOSAICML_API_TOKEN
```

```python
from langchain_community.embeddings import MosaicMLInstructorEmbeddings
```

```python
embeddings = MosaicMLInstructorEmbeddings(
    query_instruction="Represent the query for retrieval: "
)
```

```python
query_text = "This is a test query."
query_result = embeddings.embed_query(query_text)
```

```python
document_text = "This is a test document."
document_result = embeddings.embed_documents([document_text])
```

```python
import numpy as np

query_numpy = np.array(query_result)
document_numpy = np.array(document_result[0])
similarity = np.dot(query_numpy, document_numpy) / (
    np.linalg.norm(query_numpy) * np.linalg.norm(document_numpy)
)
print(f"Cosine similarity between document and query: {similarity}")
```
