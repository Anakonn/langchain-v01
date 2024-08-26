---
translated: true
---

# Entendiendo Nuclia

>[Nuclia](https://nuclia.com) indexa automáticamente sus datos no estructurados de cualquier fuente interna y externa, proporcionando resultados de búsqueda optimizados y respuestas generativas. Puede manejar transcripción de video y audio, extracción de contenido de imágenes y análisis de documentos.

La `API de Entendimiento de Nuclia` admite el procesamiento de datos no estructurados, incluidos texto, páginas web, documentos y contenido de audio/video. Extrae todos los textos donde sea que se encuentren (usando conversión de voz a texto u OCR cuando sea necesario), identifica entidades, también extrae metadatos, archivos incrustados (como imágenes en un PDF) y enlaces web. También proporciona un resumen del contenido.

Para usar la `API de Entendimiento de Nuclia`, necesita tener una cuenta de `Nuclia`. Puede crear una de forma gratuita en [https://nuclia.cloud](https://nuclia.cloud) y luego [crear una clave NUA](https://docs.nuclia.dev/docs/docs/using/understanding/intro).

```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```

```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```

```python
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=False)
```

Puede enviar archivos a la API de Entendimiento de Nuclia usando la acción `push`. Como el procesamiento se realiza de forma asincrónica, los resultados podrían devolverse en un orden diferente al de los archivos enviados. Es por eso que necesita proporcionar un `id` para hacer coincidir los resultados con el archivo correspondiente.

```python
nua.run({"action": "push", "id": "1", "path": "./report.docx"})
nua.run({"action": "push", "id": "2", "path": "./interview.mp4"})
```

Ahora puede llamar a la acción `pull` en un bucle hasta que obtenga el resultado con formato JSON.

```python
import time

pending = True
data = None
while pending:
    time.sleep(15)
    data = nua.run({"action": "pull", "id": "1", "path": None})
    if data:
        print(data)
        pending = False
    else:
        print("waiting...")
```

También puede hacerlo en un solo paso en modo `async`, solo necesita hacer un push y esperará hasta que se extraigan los resultados:

```python
import asyncio


async def process():
    data = await nua.arun(
        {"action": "push", "id": "1", "path": "./talk.mp4", "text": None}
    )
    print(data)


asyncio.run(process())
```

## Información recuperada

Nuclia devuelve la siguiente información:

- metadatos de archivos
- texto extraído
- texto anidado (como texto en una imagen incrustada)
- un resumen (solo cuando `enable_ml` se establece en `True`)
- división de párrafos y oraciones (definida por la posición de sus primeros y últimos caracteres, más el tiempo de inicio y finalización para un archivo de video o audio)
- entidades con nombre: personas, fechas, lugares, organizaciones, etc. (solo cuando `enable_ml` se establece en `True`)
- enlaces
- una miniatura
- archivos incrustados
- las representaciones vectoriales del texto (solo cuando `enable_ml` se establece en `True`)

Nota:

  Los archivos generados (miniatura, archivos incrustados extraídos, etc.) se proporcionan como un token. Puede descargarlos con el punto final [`/processing/download`](https://docs.nuclia.dev/docs/api#operation/Download_binary_file_processing_download_get).

  Además, en cualquier nivel, si un atributo excede un cierto tamaño, se colocará en un archivo descargable y se reemplazará en el documento por un puntero de archivo. Esto consistirá en `{"file": {"uri": "JWT_TOKEN"}}`. La regla es que si el tamaño del mensaje es mayor a 1000000 caracteres, las partes más grandes se moverán a archivos descargables. Primero, el proceso de compresión apuntará a los vectores. Si eso no es suficiente, apuntará a los metadatos de campo grandes y finalmente apuntará al texto extraído.
