---
translated: true
---

# Microsoft Word

>[Microsoft Word](https://www.microsoft.com/en-us/microsoft-365/word) es un procesador de texto desarrollado por Microsoft.

Esto cubre cómo cargar documentos de `Word` en un formato de documento que podemos usar más adelante.

## Usando Docx2txt

Carga .docx usando `Docx2txt` en un documento.

```python
%pip install --upgrade --quiet  docx2txt
```

```python
from langchain_community.document_loaders import Docx2txtLoader
```

```python
loader = Docx2txtLoader("example_data/fake.docx")
```

```python
data = loader.load()
```

```python
data
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', metadata={'source': 'example_data/fake.docx'})]
```

## Usando Unstructured

```python
from langchain_community.document_loaders import UnstructuredWordDocumentLoader
```

```python
loader = UnstructuredWordDocumentLoader("example_data/fake.docx")
```

```python
data = loader.load()
```

```python
data
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 'fake.docx'}, lookup_index=0)]
```

### Retener Elementos

Bajo el capó, Unstructured crea diferentes "elementos" para diferentes fragmentos de texto. De forma predeterminada, los combinamos, pero puede mantener fácilmente esa separación especificando `mode="elements"`.

```python
loader = UnstructuredWordDocumentLoader("example_data/fake.docx", mode="elements")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 'fake.docx', 'filename': 'fake.docx', 'category': 'Title'}, lookup_index=0)
```

## Usando Azure AI Document Intelligence

>[Azure AI Document Intelligence](https://aka.ms/doc-intelligence) (anteriormente conocido como `Azure Form Recognizer`) es un servicio basado en aprendizaje automático que extrae textos (incluida la escritura a mano), tablas, estructuras de documentos (por ejemplo, títulos, encabezados de sección, etc.) y pares clave-valor de
>PDF digitales o escaneados, imágenes, archivos de Office y HTML.
>
>Document Intelligence admite `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` y `HTML`.

Esta implementación actual de un cargador que usa `Document Intelligence` puede incorporar el contenido por página y convertirlo en documentos LangChain. El formato de salida predeterminado es Markdown, que se puede encadenar fácilmente con `MarkdownHeaderTextSplitter` para el fragmentado semántico de documentos. También puede usar `mode="single"` o `mode="page"` para devolver textos puros en una sola página o documento dividido por página.

## Requisito previo

Un recurso de Azure AI Document Intelligence en una de las 3 regiones de vista previa: **Este de EE. UU.**, **Oeste de EE. UU. 2**, **Europa Occidental**: siga [este documento](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0) para crear uno si no tiene. Pasará `<endpoint>` y `<key>` como parámetros al cargador.

%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence

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
