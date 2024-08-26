---
translated: true
---

# Nuclia

>[Nuclia](https://nuclia.com) indexa automáticamente sus datos no estructurados de cualquier fuente interna y externa, proporcionando resultados de búsqueda y respuestas generativas optimizados. Puede manejar la transcripción de video y audio, la extracción de contenido de imágenes y el análisis de documentos.

`Nuclia Understanding API` el transformador de documentos divide el texto en párrafos y oraciones, identifica entidades, proporciona un resumen del texto y genera incrustaciones para todas las oraciones.

Para usar la API de Nuclia Understanding, necesita tener una cuenta de Nuclia. Puede crear una de forma gratuita en [https://nuclia.cloud](https://nuclia.cloud), y luego [crear una clave NUA](https://docs.nuclia.dev/docs/docs/using/understanding/intro).

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

Para usar el transformador de documentos de Nuclia, debe instanciar una herramienta `NucliaUnderstandingAPI` con `enable_ml` establecido en `True`:

```python
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=True)
```

El transformador de documentos de Nuclia debe llamarse en modo asíncrono, por lo que debe usar el método `atransform_documents`:

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
