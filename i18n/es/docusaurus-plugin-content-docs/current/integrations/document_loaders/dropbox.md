---
translated: true
---

# Dropbox

[Dropbox](https://en.wikipedia.org/wiki/Dropbox) es un servicio de alojamiento de archivos que reúne todo: archivos tradicionales, contenido en la nube y accesos directos web en un solo lugar.

Este cuaderno cubre cómo cargar documentos desde *Dropbox*. Además de los archivos comunes como texto y PDF, también admite archivos *Dropbox Paper*.

## Requisitos previos

1. Crea una aplicación Dropbox.
2. Dale a la aplicación estos permisos de ámbito: `files.metadata.read` y `files.content.read`.
3. Genera un token de acceso: https://www.dropbox.com/developers/apps/create.
4. `pip install dropbox` (requiere `pip install "unstructured[pdf]"` para el tipo de archivo PDF).

## Instrucciones

`DropboxLoader`` requiere que crees una aplicación Dropbox y generes un token de acceso. Esto se puede hacer desde https://www.dropbox.com/developers/apps/create. También necesitas tener instalado el SDK de Python de Dropbox (pip install dropbox).

DropboxLoader puede cargar datos de una lista de rutas de archivos de Dropbox o de una sola ruta de carpeta de Dropbox. Ambas rutas deben ser relativas al directorio raíz de la cuenta de Dropbox vinculada al token de acceso.

```python
pip install dropbox
```

```output
Requirement already satisfied: dropbox in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (11.36.2)
Requirement already satisfied: requests>=2.16.2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (2.31.0)
Requirement already satisfied: six>=1.12.0 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (1.16.0)
Requirement already satisfied: stone>=2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (3.3.1)
Requirement already satisfied: charset-normalizer<4,>=2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (3.2.0)
Requirement already satisfied: idna<4,>=2.5 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (3.4)
Requirement already satisfied: urllib3<3,>=1.21.1 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (2.0.4)
Requirement already satisfied: certifi>=2017.4.17 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (2023.7.22)
Requirement already satisfied: ply>=3.4 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from stone>=2->dropbox) (3.11)
Note: you may need to restart the kernel to use updated packages.
```

```python
from langchain_community.document_loaders import DropboxLoader
```

```python
# Generate access token: https://www.dropbox.com/developers/apps/create.
dropbox_access_token = "<DROPBOX_ACCESS_TOKEN>"
# Dropbox root folder
dropbox_folder_path = ""
```

```python
loader = DropboxLoader(
    dropbox_access_token=dropbox_access_token,
    dropbox_folder_path=dropbox_folder_path,
    recursive=False,
)
```

```python
documents = loader.load()
```

```output
File /JHSfLKn0.jpeg could not be decoded as text. Skipping.
File /A REPORT ON WILES’ CAMBRIDGE LECTURES.pdf could not be decoded as text. Skipping.
```

```python
for document in documents:
    print(document)
```
