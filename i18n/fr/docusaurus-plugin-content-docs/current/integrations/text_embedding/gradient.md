---
translated: true
---

# Gradient

`Gradient` permet de créer des `Embeddings` ainsi que d'affiner et d'obtenir des compléments sur les LLM avec une simple API web.

Ce notebook explique comment utiliser Langchain avec les Embeddings de [Gradient](https://gradient.ai/).

## Imports

```python
from langchain_community.embeddings import GradientEmbeddings
```

## Définir la clé d'API de l'environnement

Assurez-vous d'obtenir votre clé d'API de Gradient AI. Vous bénéficiez de 10 $ de crédits gratuits pour tester et affiner différents modèles.

```python
import os
from getpass import getpass

if not os.environ.get("GRADIENT_ACCESS_TOKEN", None):
    # Access token under https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_ACCESS_TOKEN"] = getpass("gradient.ai access token:")
if not os.environ.get("GRADIENT_WORKSPACE_ID", None):
    # `ID` listed in `$ gradient workspace list`
    # also displayed after login at at https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_WORKSPACE_ID"] = getpass("gradient.ai workspace id:")
```

Facultatif : Validez vos variables d'environnement `GRADIENT_ACCESS_TOKEN` et `GRADIENT_WORKSPACE_ID` pour obtenir les modèles actuellement déployés. En utilisant le package Python `gradientai`.

```python
%pip install --upgrade --quiet  gradientai
```

## Créer l'instance Gradient

```python
documents = [
    "Pizza is a dish.",
    "Paris is the capital of France",
    "numpy is a lib for linear algebra",
]
query = "Where is Paris?"
```

```python
embeddings = GradientEmbeddings(model="bge-large")

documents_embedded = embeddings.embed_documents(documents)
query_result = embeddings.embed_query(query)
```

```python
# (demo) compute similarity
import numpy as np

scores = np.array(documents_embedded) @ np.array(query_result).T
dict(zip(documents, scores))
```
