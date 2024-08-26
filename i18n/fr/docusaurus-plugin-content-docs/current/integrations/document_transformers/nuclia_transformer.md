---
translated: true
---

# Nuclia

>[Nuclia](https://nuclia.com) indexe automatiquement vos données non structurées provenant de toutes les sources internes et externes, en fournissant des résultats de recherche optimisés et des réponses génératives. Il peut gérer la transcription vidéo et audio, l'extraction du contenu des images et l'analyse de documents.

Le `Nuclia Understanding API` document transformer divise le texte en paragraphes et en phrases, identifie les entités, fournit un résumé du texte et génère des embeddings pour toutes les phrases.

Pour utiliser l'API Nuclia Understanding, vous devez avoir un compte Nuclia. Vous pouvez en créer un gratuitement sur [https://nuclia.cloud](https://nuclia.cloud), puis [créer une clé NUA](https://docs.nuclia.dev/docs/docs/using/understanding/intro).

from langchain_community.document_transformers.nuclia_text_transform import NucliaTextTransformer

```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```

```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```

Pour utiliser le transformateur de documents Nuclia, vous devez instancier un outil `NucliaUnderstandingAPI` avec `enable_ml` défini sur `True` :

```python
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=True)
```

Le transformateur de documents Nuclia doit être appelé en mode asynchrone, donc vous devez utiliser la méthode `atransform_documents` :

```python
import asyncio

from langchain_community.document_transformers.nuclia_text_transform import (
    NucliaTextTransformer,
)
from langchain_core.documents import Document


async def process():
    documents = [
        Document(page_content="<TEXT 1>", metadata={}),
        Document(page_content="<TEXT 2>", metadata={}),
        Document(page_content="<TEXT 3>", metadata={}),
    ]
    nuclia_transformer = NucliaTextTransformer(nua)
    transformed_documents = await nuclia_transformer.atransform_documents(documents)
    print(transformed_documents)


asyncio.run(process())
```
