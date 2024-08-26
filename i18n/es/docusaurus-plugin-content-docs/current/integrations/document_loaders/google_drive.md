---
translated: true
---

# Google Drive

>[Google Drive](https://en.wikipedia.org/wiki/Google_Drive) es un servicio de almacenamiento y sincronización de archivos desarrollado por Google.

Este cuaderno cubre cómo cargar documentos desde `Google Drive`. Actualmente, solo se admiten `Google Docs`.

## Requisitos previos

1. Crea un proyecto de Google Cloud o usa un proyecto existente
1. Habilita la [API de Google Drive](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)
1. [Autoriza las credenciales para la aplicación de escritorio](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## 🧑 Instrucciones para ingerir tus datos de Google Docs

Establece la variable de entorno `GOOGLE_APPLICATION_CREDENTIALS` en una cadena vacía (`""`).

De forma predeterminada, `GoogleDriveLoader` espera que el archivo `credentials.json` se encuentre en `~/.credentials/credentials.json`, pero esto se puede configurar usando el argumento de palabra clave `credentials_path`. Lo mismo ocurre con `token.json`: ruta predeterminada: `~/.credentials/token.json`, parámetro del constructor: `token_path`.

La primera vez que uses `GoogleDriveLoader`, se te mostrará la pantalla de consentimiento en tu navegador para la autenticación de usuario. Después de la autenticación, `token.json` se creará automáticamente en la ruta proporcionada o la ruta predeterminada. Además, si ya hay un `token.json` en esa ruta, no se te solicitará la autenticación.

`GoogleDriveLoader` puede cargar desde una lista de identificadores de documentos de Google Docs o un identificador de carpeta. Puedes obtener el identificador de tu carpeta y documento a partir de la URL:

* Carpeta: https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> el identificador de la carpeta es `"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"`
* Documento: https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> el identificador del documento es `"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"`

```python
%pip install --upgrade --quiet langchain-google-community[drive]
```

```python
from langchain_google_community import GoogleDriveLoader
```

```python
loader = GoogleDriveLoader(
    folder_id="1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5",
    token_path="/path/where/you/want/token/to/be/created/google_token.json",
    # Optional: configure whether to recursively fetch files from subfolders. Defaults to False.
    recursive=False,
)
```

```python
docs = loader.load()
```

Cuando pasas un `folder_id`, de forma predeterminada se cargan todos los archivos de tipo documento, hoja y pdf. Puedes modificar este comportamiento pasando un argumento `file_types`

```python
loader = GoogleDriveLoader(
    folder_id="1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5",
    file_types=["document", "sheet"],
    recursive=False,
)
```

## Pasar cargadores de archivos opcionales

Cuando se procesan archivos que no son Google Docs y Google Sheets, puede ser útil pasar un cargador de archivos opcional a `GoogleDriveLoader`. Si pasas un cargador de archivos, ese cargador de archivos se utilizará en los documentos que no tengan un tipo MIME de Google Docs o Google Sheets. Aquí hay un ejemplo de cómo cargar un documento de Excel desde Google Drive usando un cargador de archivos.

```python
from langchain_community.document_loaders import UnstructuredFileIOLoader
from langchain_google_community import GoogleDriveLoader
```

```python
file_id = "1x9WBtFPWMEAdjcJzPScRsjpjQvpSo_kz"
loader = GoogleDriveLoader(
    file_ids=[file_id],
    file_loader_cls=UnstructuredFileIOLoader,
    file_loader_kwargs={"mode": "elements"},
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

También puedes procesar una carpeta con una mezcla de archivos y Google Docs/Sheets usando el siguiente patrón:

```python
folder_id = "1asMOHY1BqBS84JcRbOag5LOJac74gpmD"
loader = GoogleDriveLoader(
    folder_id=folder_id,
    file_loader_cls=UnstructuredFileIOLoader,
    file_loader_kwargs={"mode": "elements"},
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

## Uso extendido

Un componente externo (no oficial) puede gestionar la complejidad de Google Drive: `langchain-googledrive`
Es compatible con `langchain_community.document_loaders.GoogleDriveLoader` y se puede usar
en su lugar.

Para ser compatible con los contenedores, la autenticación usa una variable de entorno `GOOGLE_ACCOUNT_FILE` para el archivo de credenciales (para usuario o servicio).

```python
%pip install --upgrade --quiet  langchain-googledrive
```

```python
folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'
```

```python
# Use the advanced version.
from langchain_googledrive.document_loaders import GoogleDriveLoader
```

```python
loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    num_results=2,  # Maximum number of file to load
)
```

De forma predeterminada, todos los archivos con este tipo MIME se pueden convertir en `Document`.
- text/text
- text/plain
- text/html
- text/csv
- text/markdown
- image/png
- image/jpeg
- application/epub+zip
- application/pdf
- application/rtf
- application/vnd.google-apps.document (GDoc)
- application/vnd.google-apps.presentation (GSlide)
- application/vnd.google-apps.spreadsheet (GSheet)
- application/vnd.google.colaboratory (Notebook colab)
- application/vnd.openxmlformats-officedocument.presentationml.presentation (PPTX)
- application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX)

Es posible actualizar o personalizar esto. Consulta la documentación de `GDriveLoader`.

Pero, se deben instalar los paquetes correspondientes.

```python
%pip install --upgrade --quiet  unstructured
```

```python
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

### Carga de identidades de autenticación

Las identidades autorizadas para cada archivo ingerido por Google Drive Loader se pueden cargar junto con los metadatos por Documento.

```python
from langchain_google_community import GoogleDriveLoader

loader = GoogleDriveLoader(
    folder_id=folder_id,
    load_auth=True,
    # Optional: configure whether to load authorized identities for each Document.
)

doc = loader.load()
```

Puedes pasar `load_auth=True` para agregar las identidades de acceso a documentos de Google Drive a los metadatos.

```python
doc[0].metadata
```

### Carga de metadatos extendidos

También se pueden obtener los siguientes campos adicionales dentro de los metadatos de cada Documento:
 - full_path - Ruta completa del archivo/s en Google Drive.
 - owner - propietario del archivo/s.
 - size - tamaño del archivo/s.

```python
from langchain_google_community import GoogleDriveLoader

loader = GoogleDriveLoader(
    folder_id=folder_id,
    load_extended_matadata=True,
    # Optional: configure whether to load extended metadata for each Document.
)

doc = loader.load()
```

Puedes pasar `load_extended_matadata=True` para agregar detalles extendidos de documentos de Google Drive a los metadatos.

```python
doc[0].metadata
```

### Personalizar el patrón de búsqueda

Todos los parámetros compatibles con la API de Google [`list()`](https://developers.google.com/drive/api/v3/reference/files/list) se pueden establecer.

Para especificar el nuevo patrón de la solicitud de Google, puede usar un `PromptTemplate()`.
Las variables para el aviso se pueden establecer con `kwargs` en el constructor.
Se proponen algunas solicitudes preformateadas (use `{query}`, `{folder_id}` y/o `{mime_type}`):

Puede personalizar los criterios para seleccionar los archivos. Se propone un conjunto de filtros predefinidos:

| plantilla                               | descripción                                                           |
| -------------------------------------- | --------------------------------------------------------------------- |
| gdrive-all-in-folder                   | Devuelve todos los archivos compatibles de un `folder_id`                        |
| gdrive-query                           | Buscar `query` en todas las unidades                                          |
| gdrive-by-name                         | Buscar archivo con nombre `query`                                        |
| gdrive-query-in-folder                 | Buscar `query` en `folder_id` (y subcarpetas si `recursive=true`)  |
| gdrive-mime-type                       | Buscar un `mime_type` específico                                         |
| gdrive-mime-type-in-folder             | Buscar un `mime_type` específico en `folder_id`                          |
| gdrive-query-with-mime-type            | Buscar `query` con un `mime_type` específico                            |
| gdrive-query-with-mime-type-and-folder | Buscar `query` con un `mime_type` específico y en `folder_id`         |

```python
loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    template="gdrive-query",  # Default template to use
    query="machine learning",
    num_results=2,  # Maximum number of file to load
    supportsAllDrives=False,  # GDrive `list()` parameter
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

Puede personalizar su patrón.

```python
from langchain_core.prompts.prompt import PromptTemplate

loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    template=PromptTemplate(
        input_variables=["query", "query_name"],
        template="fullText contains '{query}' and name contains '{query_name}' and trashed=false",
    ),  # Default template to use
    query="machine learning",
    query_name="ML",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

La conversión puede administrarse en formato Markdown:
- viñeta
- enlace
- tabla
- títulos

Establezca el atributo `return_link` en `True` para exportar enlaces.

#### Modos para GSlide y GSheet

El parámetro mode acepta diferentes valores:

- "document": devuelve el cuerpo de cada documento
- "snippets": devuelve la descripción de cada archivo (establecida en los metadatos de los archivos de Google Drive).

El parámetro `gslide_mode` acepta diferentes valores:

- "single" : un documento con &lt;SALTO DE PÁGINA&gt;
- "slide" : un documento por diapositiva
- "elements" : un documento para cada elemento.

```python
loader = GoogleDriveLoader(
    template="gdrive-mime-type",
    mime_type="application/vnd.google-apps.presentation",  # Only GSlide files
    gslide_mode="slide",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

El parámetro `gsheet_mode` acepta diferentes valores:
- `"single"`: Generar un documento por línea
- `"elements"` : un documento con matriz markdown y etiquetas &lt;SALTO DE PÁGINA&gt;.

```python
loader = GoogleDriveLoader(
    template="gdrive-mime-type",
    mime_type="application/vnd.google-apps.spreadsheet",  # Only GSheet files
    gsheet_mode="elements",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

### Uso avanzado

Todos los archivos de Google tienen una 'descripción' en los metadatos. Este campo se puede usar para memorizar un resumen del documento u otras etiquetas indexadas (consulte el método `lazy_update_description_with_summary()`).

Si usa el `mode="snippet"`, solo se usará la descripción para el cuerpo. De lo contrario, el `metadata['summary']` tiene el campo.

A veces, se puede usar un filtro específico para extraer información del nombre de archivo y seleccionar algunos archivos con criterios específicos. Puede usar un filtro.

A veces, se devuelven muchos documentos. No es necesario tener todos los documentos en la memoria al mismo tiempo. Puede usar las versiones perezosas de los métodos para obtener un documento a la vez. Es mejor usar una consulta compleja en lugar de una búsqueda recursiva. Para cada carpeta, se debe aplicar una consulta si activa `recursive=True`.

```python
import os

loader = GoogleDriveLoader(
    gdrive_api_file=os.environ["GOOGLE_ACCOUNT_FILE"],
    num_results=2,
    template="gdrive-query",
    filter=lambda search, file: "#test" not in file.get("description", ""),
    query="machine learning",
    supportsAllDrives=False,
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```
