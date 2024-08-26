---
translated: true
---

# Trello

>[Trello](https://www.atlassian.com/software/trello) es una herramienta de gestión de proyectos y colaboración basada en la web que permite a individuos y equipos organizar y hacer seguimiento de sus tareas y proyectos. Proporciona una interfaz visual conocida como "tablero" donde los usuarios pueden crear listas y tarjetas para representar sus tareas y actividades.

El TrelloLoader permite cargar tarjetas desde un tablero de Trello y se implementa sobre [py-trello](https://pypi.org/project/py-trello/)

Actualmente solo admite `api_key/token`.

1. Generación de credenciales: https://trello.com/power-ups/admin/

2. Haz clic en el enlace de generación manual de token para obtener el token.

Para especificar la clave API y el token, puedes establecer las variables de entorno ``TRELLO_API_KEY`` y ``TRELLO_TOKEN`` o puedes pasar ``api_key`` y ``token`` directamente al método de constructor de conveniencia `from_credentials`.

Este cargador te permite proporcionar el nombre del tablero para cargar las tarjetas correspondientes en objetos Document.

Tenga en cuenta que el "nombre" del tablero también se denomina "título" en la documentación oficial:

https://support.atlassian.com/trello/docs/changing-a-boards-title-and-description/

También puedes especificar varios parámetros de carga para incluir o eliminar diferentes campos tanto de las propiedades page_content del documento como de los metadatos.

## Características

- Cargar tarjetas desde un tablero de Trello.
- Filtrar tarjetas según su estado (abierto o cerrado).
- Incluir nombres de tarjetas, comentarios y listas de verificación en los documentos cargados.
- Personalizar los campos de metadatos adicionales que se incluirán en el documento.

De forma predeterminada, se incluyen todos los campos de tarjeta para el texto completo page_content y los metadatos correspondientes.

```python
%pip install --upgrade --quiet  py-trello beautifulsoup4 lxml
```

```python
# If you have already set the API key and token using environment variables,
# you can skip this cell and comment out the `api_key` and `token` named arguments
# in the initialization steps below.
from getpass import getpass

API_KEY = getpass()
TOKEN = getpass()
```

```output
········
········
```

```python
from langchain_community.document_loaders import TrelloLoader

# Get the open cards from "Awesome Board"
loader = TrelloLoader.from_credentials(
    "Awesome Board",
    api_key=API_KEY,
    token=TOKEN,
    card_filter="open",
)
documents = loader.load()

print(documents[0].page_content)
print(documents[0].metadata)
```

```output
Review Tech partner pages
Comments:
{'title': 'Review Tech partner pages', 'id': '6475357890dc8d17f73f2dcc', 'url': 'https://trello.com/c/b0OTZwkZ/1-review-tech-partner-pages', 'labels': ['Demand Marketing'], 'list': 'Done', 'closed': False, 'due_date': ''}
```

```python
# Get all the cards from "Awesome Board" but only include the
# card list(column) as extra metadata.
loader = TrelloLoader.from_credentials(
    "Awesome Board",
    api_key=API_KEY,
    token=TOKEN,
    extra_metadata=("list"),
)
documents = loader.load()

print(documents[0].page_content)
print(documents[0].metadata)
```

```output
Review Tech partner pages
Comments:
{'title': 'Review Tech partner pages', 'id': '6475357890dc8d17f73f2dcc', 'url': 'https://trello.com/c/b0OTZwkZ/1-review-tech-partner-pages', 'list': 'Done'}
```

```python
# Get the cards from "Another Board" and exclude the card name,
# checklist and comments from the Document page_content text.
loader = TrelloLoader.from_credentials(
    "test",
    api_key=API_KEY,
    token=TOKEN,
    include_card_name=False,
    include_checklist=False,
    include_comments=False,
)
documents = loader.load()

print("Document: " + documents[0].page_content)
print(documents[0].metadata)
```
