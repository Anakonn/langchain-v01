---
translated: true
---

# Base de datos de Notion 2/2

>[Notion](https://www.notion.so/) es una plataforma de colaboración con soporte de Markdown modificado que integra tableros de Kanban, tareas, wikis y bases de datos. Es un espacio de trabajo todo en uno para la toma de notas, la gestión del conocimiento y los datos, y la gestión de proyectos y tareas.

`NotionDBLoader` es una clase de Python para cargar contenido de una base de datos `Notion`. Recupera páginas de la base de datos, lee su contenido y devuelve una lista de objetos Document.

## Requisitos

- Una base de datos `Notion`
- Token de integración de Notion

## Configuración

### 1. Crear una base de datos de tabla de Notion

Crea una nueva base de datos de tabla en Notion. Puedes agregar cualquier columna a la base de datos y se tratarán como metadatos. Por ejemplo, puedes agregar las siguientes columnas:

- Título: establece Título como la propiedad predeterminada.
- Categorías: una propiedad de selección múltiple para almacenar las categorías asociadas con la página.
- Palabras clave: una propiedad de selección múltiple para almacenar las palabras clave asociadas con la página.

Agrega tu contenido al cuerpo de cada página de la base de datos. El NotionDBLoader extraerá el contenido y los metadatos de estas páginas.

## 2. Crear una integración de Notion

Para crear una integración de Notion, sigue estos pasos:

1. Visita la página [Notion Developers](https://www.notion.com/my-integrations) e inicia sesión con tu cuenta de Notion.
2. Haz clic en el botón "+ Nueva integración".
3. Dale un nombre a tu integración y elige el espacio de trabajo donde se encuentra tu base de datos.
4. Selecciona las capacidades requeridas, esta extensión solo necesita la capacidad de leer contenido.
5. Haz clic en el botón "Enviar" para crear la integración.
Una vez creada la integración, se te proporcionará un `Token de integración (clave API)`. Copia este token y consérvalo, ya que lo necesitarás para usar el NotionDBLoader.

### 3. Conectar la integración a la base de datos

Para conectar tu integración a la base de datos, sigue estos pasos:

1. Abre tu base de datos en Notion.
2. Haz clic en el icono de los tres puntos en la esquina superior derecha de la vista de la base de datos.
3. Haz clic en el botón "+ Nueva integración".
4. Encuentra tu integración, es posible que tengas que empezar a escribir su nombre en el cuadro de búsqueda.
5. Haz clic en el botón "Conectar" para conectar la integración a la base de datos.

### 4. Obtener el ID de la base de datos

Para obtener el ID de la base de datos, sigue estos pasos:

1. Abre tu base de datos en Notion.
2. Haz clic en el icono de los tres puntos en la esquina superior derecha de la vista de la base de datos.
3. Selecciona "Copiar enlace" en el menú para copiar la URL de la base de datos al portapapeles.
4. El ID de la base de datos es la larga cadena de caracteres alfanuméricos que se encuentra en la URL. Normalmente se ve así: https://www.notion.so/username/8935f9d140a04f95a872520c4f123456?v=.... En este ejemplo, el ID de la base de datos es 8935f9d140a04f95a872520c4f123456.

Con la base de datos configurada correctamente y el token de integración y el ID de la base de datos en mano, ahora puedes usar el código NotionDBLoader para cargar el contenido y los metadatos de tu base de datos de Notion.

## Uso

NotionDBLoader es parte de los cargadores de documentos del paquete langchain. Puedes usarlo de la siguiente manera:

```python
from getpass import getpass

NOTION_TOKEN = getpass()
DATABASE_ID = getpass()
```

```output
········
········
```

```python
from langchain_community.document_loaders import NotionDBLoader
```

```python
loader = NotionDBLoader(
    integration_token=NOTION_TOKEN,
    database_id=DATABASE_ID,
    request_timeout_sec=30,  # optional, defaults to 10
)
```

```python
docs = loader.load()
```

```python
print(docs)
```
