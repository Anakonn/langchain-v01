---
sidebar_position: 3
title: Manejar archivos
translated: true
---

Además de los datos de texto sin formato, es posible que desee extraer información de otros tipos de archivos, como presentaciones de PowerPoint o archivos PDF.

Puede usar los [cargadores de documentos](/docs/modules/data_connection/document_loaders/) de LangChain para analizar archivos en un formato de texto que se pueda alimentar en LLM.

LangChain cuenta con una gran cantidad de [integraciones de cargadores de documentos](/docs/integrations/document_loaders).

## Análisis basado en el tipo MIME

Para ver ejemplos básicos de análisis, eche un vistazo a los [cargadores de documentos](/docs/modules/data_connection/document_loaders/).

Aquí, analizaremos el análisis basado en el tipo MIME, que a menudo es útil para aplicaciones de extracción si está escribiendo código de servidor que acepta archivos cargados por el usuario.

En este caso, es mejor asumir que la extensión de archivo del archivo proporcionado por el usuario es incorrecta y, en su lugar, inferir el tipo MIME a partir del contenido binario del archivo.

Descarguemos algo de contenido. Este será un archivo HTML, pero el código a continuación funcionará con otros tipos de archivo.

```python
import requests

response = requests.get("https://en.wikipedia.org/wiki/Car")
data = response.content
data[:20]
```

```output
b'<!DOCTYPE html>\n<htm'
```

Configurar los analizadores

```python
import magic
from langchain.document_loaders.parsers import BS4HTMLParser, PDFMinerParser
from langchain.document_loaders.parsers.generic import MimeTypeBasedParser
from langchain.document_loaders.parsers.txt import TextParser
from langchain_community.document_loaders import Blob

# Configure the parsers that you want to use per mime-type!
HANDLERS = {
    "application/pdf": PDFMinerParser(),
    "text/plain": TextParser(),
    "text/html": BS4HTMLParser(),
}

# Instantiate a mimetype based parser with the given parsers
MIMETYPE_BASED_PARSER = MimeTypeBasedParser(
    handlers=HANDLERS,
    fallback_parser=None,
)

mime = magic.Magic(mime=True)
mime_type = mime.from_buffer(data)

# A blob represents binary data by either reference (path on file system)
# or value (bytes in memory).
blob = Blob.from_data(
    data=data,
    mime_type=mime_type,
)

parser = HANDLERS[mime_type]
documents = parser.parse(blob=blob)
```

```python
print(documents[0].page_content[:30].strip())
```

```output
Car - Wikipedia
```
