---
translated: true
---

# Microsoft Excel

El `UnstructuredExcelLoader` se utiliza para cargar archivos de `Microsoft Excel`. El cargador funciona tanto con archivos `.xlsx` como `.xls`. El contenido de la página será el texto sin formato del archivo Excel. Si usa el cargador en el modo `"elements"`, habrá una representación HTML del archivo Excel disponible en los metadatos del documento bajo la clave `text_as_html`.

```python
from langchain_community.document_loaders import UnstructuredExcelLoader
```

```python
loader = UnstructuredExcelLoader("example_data/stanley-cups.xlsx", mode="elements")
docs = loader.load()
docs[0]
```

```output
Document(page_content='\n  \n    \n      Team\n      Location\n      Stanley Cups\n    \n    \n      Blues\n      STL\n      1\n    \n    \n      Flyers\n      PHI\n      2\n    \n    \n      Maple Leafs\n      TOR\n      13\n    \n  \n', metadata={'source': 'example_data/stanley-cups.xlsx', 'filename': 'stanley-cups.xlsx', 'file_directory': 'example_data', 'filetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'page_number': 1, 'page_name': 'Stanley Cups', 'text_as_html': '<table border="1" class="dataframe">\n  <tbody>\n    <tr>\n      <td>Team</td>\n      <td>Location</td>\n      <td>Stanley Cups</td>\n    </tr>\n    <tr>\n      <td>Blues</td>\n      <td>STL</td>\n      <td>1</td>\n    </tr>\n    <tr>\n      <td>Flyers</td>\n      <td>PHI</td>\n      <td>2</td>\n    </tr>\n    <tr>\n      <td>Maple Leafs</td>\n      <td>TOR</td>\n      <td>13</td>\n    </tr>\n  </tbody>\n</table>', 'category': 'Table'})
```

## Uso de Azure AI Document Intelligence

>[Azure AI Document Intelligence](https://aka.ms/doc-intelligence) (anteriormente conocido como `Azure Form Recognizer`) es un servicio basado en aprendizaje automático que extrae textos (incluida la escritura a mano), tablas, estructuras de documentos (por ejemplo, títulos, encabezados de sección, etc.) y pares clave-valor de
>PDF digitales o escaneados, imágenes, archivos de Office y HTML.
>
>Document Intelligence admite `PDF`, `JPEG/JPG`, `PNG`, `BMP`, `TIFF`, `HEIF`, `DOCX`, `XLSX`, `PPTX` y `HTML`.

Esta implementación actual de un cargador que utiliza `Document Intelligence` puede incorporar el contenido página por página y convertirlo en documentos LangChain. El formato de salida predeterminado es Markdown, que se puede encadenar fácilmente con `MarkdownHeaderTextSplitter` para el fragmentado semántico de documentos. También puede usar `mode="single"` o `mode="page"` para devolver textos puros en una sola página o documento dividido por página.

### Requisito previo

Un recurso de Azure AI Document Intelligence en una de las 3 regiones de vista previa: **Este de EE. UU.**, **Oeste de EE. UU. 2**, **Europa Occidental**: siga [este documento](https://learn.microsoft.com/azure/ai-services/document-intelligence/create-document-intelligence-resource?view=doc-intel-4.0.0) para crear uno si no tiene. Pasará `<endpoint>` y `<key>` como parámetros al cargador.

```python
%pip install --upgrade --quiet  langchain langchain-community azure-ai-documentintelligence
```

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
