---
translated: true
---

# Google Drive

Este cuaderno recorre la conexión de un LangChain a la `API de Google Drive`.

## Requisitos previos

1. Crea un proyecto de Google Cloud o usa un proyecto existente
1. Habilita la [API de Google Drive](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)
1. [Autorizar credenciales para aplicación de escritorio](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## Instrucciones para recuperar los datos de tus documentos de Google

De forma predeterminada, `GoogleDriveTools` y `GoogleDriveWrapper` esperan que el archivo `credentials.json` esté en `~/.credentials/credentials.json`, pero esto se puede configurar usando la variable de entorno `GOOGLE_ACCOUNT_FILE`.
La ubicación de `token.json` usa el mismo directorio (o usa el parámetro `token_path`). Ten en cuenta que `token.json` se creará automáticamente la primera vez que uses la herramienta.

`GoogleDriveSearchTool` puede recuperar una selección de archivos con algunas solicitudes.

De forma predeterminada, si usas un `folder_id`, todos los archivos dentro de esta carpeta se pueden recuperar a `Document`, si el nombre coincide con la consulta.

```python
%pip install --upgrade --quiet  google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

Puedes obtener el ID de tu carpeta y documento a partir de la URL:

* Carpeta: https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> el ID de la carpeta es `"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"`
* Documento: https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> el ID del documento es `"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"`

El valor especial `root` es para tu carpeta personal.

```python
folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'
```

De forma predeterminada, todos los archivos con estos tipos MIME se pueden convertir a `Document`.
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

Es posible actualizar o personalizar esto. Consulta la documentación de `GoogleDriveAPIWrapper`.

Pero, se deben instalar los paquetes correspondientes.

```python
%pip install --upgrade --quiet  unstructured
```

```python
from langchain_googldrive.tools.google_drive.tool import GoogleDriveSearchTool
from langchain_googledrive.utilities.google_drive import GoogleDriveAPIWrapper

# By default, search only in the filename.
tool = GoogleDriveSearchTool(
    api_wrapper=GoogleDriveAPIWrapper(
        folder_id=folder_id,
        num_results=2,
        template="gdrive-query-in-folder",  # Search in the body of documents
    )
)
```

```python
import logging

logging.basicConfig(level=logging.INFO)
```

```python
tool.run("machine learning")
```

```python
tool.description
```

```python
from langchain.agents import load_tools

tools = load_tools(
    ["google-drive-search"],
    folder_id=folder_id,
    template="gdrive-query-in-folder",
)
```

## Uso dentro de un Agente

```python
from langchain.agents import AgentType, initialize_agent
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
)
```

```python
agent.run("Search in google drive, who is 'Yann LeCun' ?")
```
