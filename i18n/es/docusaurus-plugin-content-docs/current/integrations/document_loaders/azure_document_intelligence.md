---
translated: true
---

# Inteligencia de documentos de Azure AI

>[Inteligencia de documentos de Azure AI](https://aka.ms/doc-intelligence) (anteriormente conocido como `Azure Form Recognizer`) es un servicio basado en aprendizaje automático que extrae textos (incluida la escritura a mano), tablas, estructuras de documentos (por ejemplo, títulos, encabezados de sección, etc.) y pares clave-valor de
>PDF, imágenes, archivos de Office y HTML digitales o escaneados.
>
>La Inteligencia de documentos admite `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` y `HTML`.

Esta implementación actual de un cargador que utiliza `Inteligencia de documentos` puede incorporar contenido página por página y convertirlo en documentos LangChain. El formato de salida predeterminado es Markdown, que se puede encadenar fácilmente con `MarkdownHeaderTextSplitter` para el fragmentado semántico de documentos. También puede usar `mode="single"` o `mode="page"` para devolver textos puros en una sola página o documento dividido por página.

## Requisito previo

Un recurso de Inteligencia de documentos de Azure AI en una de las 3 regiones de vista previa: **Este de EE. UU.**, **Oeste de EE. UU. 2**, **Europa Occidental**: siga [este documento](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0) para crear uno si no tiene. Pasará `<endpoint>` y `<key>` como parámetros al cargador.

```python
%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence
```

## Ejemplo 1

El primer ejemplo usa un archivo local que se enviará a Inteligencia de documentos de Azure AI.

Con el cliente de análisis de documentos inicializado, podemos proceder a crear una instancia de DocumentIntelligenceLoader:

```python
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint, api_key=key, file_path=file_path, api_model="prebuilt-layout"
)

documents = loader.load()
```

La salida predeterminada contiene un documento LangChain con contenido en formato Markdown:

```python
documents
```

## Ejemplo 2

El archivo de entrada también puede ser una ruta de URL pública. Por ejemplo, https://raw.githubusercontent.com/Azure-Samples/cognitive-services-REST-api-samples/master/curl/form-recognizer/rest-api/layout.png.

```python
url_path = "<url>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint, api_key=key, url_path=url_path, api_model="prebuilt-layout"
)

documents = loader.load()
```

```python
documents
```

## Ejemplo 3

También puede especificar `mode="page"` para cargar el documento por páginas.

```python
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint,
    api_key=key,
    file_path=file_path,
    api_model="prebuilt-layout",
    mode="page",
)

documents = loader.load()
```

La salida será cada página almacenada como un documento separado en la lista:

```python
for document in documents:
    print(f"Page Content: {document.page_content}")
    print(f"Metadata: {document.metadata}")
```

## Ejemplo 4

También puede especificar `analysis_feature=["ocrHighResolution"]` para habilitar las capacidades adicionales. Para obtener más información, consulte: https://aka.ms/azsdk/python/documentintelligence/analysisfeature.

```python
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader

file_path = "<filepath>"
endpoint = "<endpoint>"
key = "<key>"
analysis_features = ["ocrHighResolution"]
loader = AzureAIDocumentIntelligenceLoader(
    api_endpoint=endpoint,
    api_key=key,
    file_path=file_path,
    api_model="prebuilt-layout",
    analysis_features=analysis_features,
)

documents = loader.load()
```

La salida contiene el documento LangChain reconocido con la capacidad de alta resolución:

```python
documents
```
