---
traducido: falso
translated: true
---

# Google Drive

Este cuaderno cubre cómo recuperar documentos de `Google Drive`.

## Requisitos previos

1. Crea un proyecto de Google Cloud o usa un proyecto existente
1. Habilita la [API de Google Drive](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)
1. [Autorizar credenciales para aplicación de escritorio](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## Recuperar los documentos de Google

De forma predeterminada, `GoogleDriveRetriever` espera que el archivo `credentials.json` esté en `~/.credentials/credentials.json`, pero esto se puede configurar usando la variable de entorno `GOOGLE_ACCOUNT_FILE`.
La ubicación de `token.json` usa el mismo directorio (o usa el parámetro `token_path`). Tenga en cuenta que `token.json` se creará automáticamente la primera vez que uses el recuperador.

`GoogleDriveRetriever` puede recuperar una selección de archivos con algunas solicitudes.

De forma predeterminada, si usas un `folder_id`, todos los archivos dentro de esta carpeta se pueden recuperar a `Document`.

Puedes obtener el ID de tu carpeta y documento de la URL:

* Carpeta: https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> el ID de la carpeta es `"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"`
* Documento: https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> el ID del documento es `"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"`

El valor especial `root` es para tu carpeta personal.

```python
from langchain_googledrive.retrievers import GoogleDriveRetriever

folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'

retriever = GoogleDriveRetriever(
    num_results=2,
)
```

De forma predeterminada, todos los archivos con estos tipos MIME se pueden convertir a `Document`.

- `text/text`
- `text/plain`
- `text/html`
- `text/csv`
- `text/markdown`
- `image/png`
- `image/jpeg`
- `application/epub+zip`
- `application/pdf`
- `application/rtf`
- `application/vnd.google-apps.document` (GDoc)
- `application/vnd.google-apps.presentation` (GSlide)
- `application/vnd.google-apps.spreadsheet` (GSheet)
- `application/vnd.google.colaboratory` (Notebook colab)
- `application/vnd.openxmlformats-officedocument.presentationml.presentation` (PPTX)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)

Es posible actualizar o personalizar esto. Consulta la documentación de `GoogleDriveRetriever`.

Pero, se deben instalar los paquetes correspondientes.

```python
%pip install --upgrade --quiet  unstructured
```

```python
retriever.invoke("machine learning")
```

Puedes personalizar los criterios para seleccionar los archivos. Se propone un conjunto de filtros predefinidos:

| Plantilla                                 | Descripción                                                           |
| --------------------------------------   | --------------------------------------------------------------------- |
| `gdrive-all-in-folder`                   | Devuelve todos los archivos compatibles de un `folder_id`            |
| `gdrive-query`                           | Busca `query` en todas las unidades                                  |
| `gdrive-by-name`                         | Busca archivo con nombre `query`                                     |
| `gdrive-query-in-folder`                 | Busca `query` en `folder_id` (y subcarpetas en `_recursive=true`)    |
| `gdrive-mime-type`                       | Busca un `mime_type` específico                                      |
| `gdrive-mime-type-in-folder`             | Busca un `mime_type` específico en `folder_id`                       |
| `gdrive-query-with-mime-type`            | Busca `query` con un `mime_type` específico                          |
| `gdrive-query-with-mime-type-and-folder` | Busca `query` con un `mime_type` específico y en `folder_id`         |

```python
retriever = GoogleDriveRetriever(
    template="gdrive-query",  # Search everywhere
    num_results=2,  # But take only 2 documents
)
for doc in retriever.invoke("machine learning"):
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

De lo contrario, puedes personalizar el aviso con una `PromptTemplate` especializada.

```python
from langchain_core.prompts import PromptTemplate

retriever = GoogleDriveRetriever(
    template=PromptTemplate(
        input_variables=["query"],
        # See https://developers.google.com/drive/api/guides/search-files
        template="(fullText contains '{query}') "
        "and mimeType='application/vnd.google-apps.document' "
        "and modifiedTime > '2000-01-01T00:00:00' "
        "and trashed=false",
    ),
    num_results=2,
    # See https://developers.google.com/drive/api/v3/reference/files/list
    includeItemsFromAllDrives=False,
    supportsAllDrives=False,
)
for doc in retriever.invoke("machine learning"):
    print(f"{doc.metadata['name']}:")
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

## Usar el metadato 'descripción' de Google Drive

Cada Google Drive tiene un campo `descripción` en los metadatos (consulta los *detalles de un archivo*).
Usa el modo `snippets` para devolver la descripción de los archivos seleccionados.

```python
retriever = GoogleDriveRetriever(
    template="gdrive-mime-type-in-folder",
    folder_id=folder_id,
    mime_type="application/vnd.google-apps.document",  # Only Google Docs
    num_results=2,
    mode="snippets",
    includeItemsFromAllDrives=False,
    supportsAllDrives=False,
)
retriever.invoke("machine learning")
```
