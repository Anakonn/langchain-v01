---
translated: true
---

# Gradiente

`Gradiente` permite crear `Incrustaciones` y también ajustar y obtener completaciones en LLM con una API web sencilla.

Este cuaderno explica cómo usar Langchain con Incrustaciones de [Gradiente](https://gradient.ai/).

## Importaciones

```python
from langchain_community.embeddings import GradientEmbeddings
```

## Establecer la clave de la API del entorno

Asegúrese de obtener su clave de API de Gradient AI. Se le otorgan $10 en créditos gratuitos para probar y ajustar diferentes modelos.

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

Opcional: Valide sus variables de entorno `GRADIENT_ACCESS_TOKEN` y `GRADIENT_WORKSPACE_ID` para obtener los modelos actualmente implementados. Usando el paquete Python `gradientai`.

```python
%pip install --upgrade --quiet  gradientai
```

## Crear la instancia de Gradiente

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
