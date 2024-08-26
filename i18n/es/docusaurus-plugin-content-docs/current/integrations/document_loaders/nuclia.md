---
translated: true
---

# Nuclia

>[Nuclia](https://nuclia.com) indexa automáticamente sus datos no estructurados de cualquier fuente interna y externa, proporcionando resultados de búsqueda y respuestas generativas optimizados. Puede manejar la transcripción de video y audio, la extracción de contenido de imágenes y el análisis de documentos.

>La `Nuclia Understanding API` admite el procesamiento de datos no estructurados, incluidos texto, páginas web, documentos y contenido de audio/video. Extrae todos los textos donde sea que se encuentren (usando reconocimiento de voz a texto u OCR cuando sea necesario), también extrae metadatos, archivos incrustados (como imágenes en un PDF) y enlaces web. Si se habilita el aprendizaje automático, identifica entidades, proporciona un resumen del contenido y genera incrustaciones para todas las oraciones.

## Configuración

Para usar la `Nuclia Understanding API`, necesita tener una cuenta de Nuclia. Puede crear una de forma gratuita en [https://nuclia.cloud](https://nuclia.cloud), y luego [crear una clave NUA](https://docs.nuclia.dev/docs/docs/using/understanding/intro).

```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```

```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```

## Ejemplo

Para usar el cargador de documentos de Nuclia, debe instanciar una herramienta `NucliaUnderstandingAPI`:

```python
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=False)
```

```python
from langchain_community.document_loaders.nuclia import NucliaLoader

loader = NucliaLoader("./interview.mp4", nua)
```

Ahora puede llamar a `load` el documento en un bucle hasta que obtenga el documento.

```python
import time

pending = True
while pending:
    time.sleep(15)
    docs = loader.load()
    if len(docs) > 0:
        print(docs[0].page_content)
        print(docs[0].metadata)
        pending = False
    else:
        print("waiting...")
```

## Información recuperada

Nuclia devuelve la siguiente información:

- metadatos de archivo
- texto extraído
- texto anidado (como texto en una imagen incrustada)
- división de párrafos y oraciones (definida por la posición de sus primeros y últimos caracteres, más el tiempo de inicio y el tiempo de finalización para un archivo de video o audio)
- enlaces
- una miniatura
- archivos incrustados

Nota:

  Los archivos generados (miniatura, archivos incrustados extraídos, etc.) se proporcionan como un token. Puede descargarlos con el [`/processing/download` endpoint](https://docs.nuclia.dev/docs/api#operation/Download_binary_file_processing_download_get).

  Además, en cualquier nivel, si un atributo excede un cierto tamaño, se colocará en un archivo descargable y se reemplazará en el documento por un puntero de archivo. Esto consistirá en `{"file": {"uri": "JWT_TOKEN"}}`. La regla es que si el tamaño del mensaje es mayor a 1000000 caracteres, las partes más grandes se moverán a archivos descargables. Primero, el proceso de compresión apuntará a los vectores. Si eso no es suficiente, apuntará a los metadatos de campo grandes y finalmente apuntará al texto extraído.
