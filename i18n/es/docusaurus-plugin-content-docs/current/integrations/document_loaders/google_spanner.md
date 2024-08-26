---
translated: true
---

# Google Spanner

> [Spanner](https://cloud.google.com/spanner) es una base de datos altamente escalable que combina una escalabilidad ilimitada con semántica relacional, como índices secundarios, consistencia fuerte, esquemas y SQL, proporcionando una disponibilidad del 99,999% en una sola solución fácil de usar.

Este cuaderno explica cómo usar [Spanner](https://cloud.google.com/spanner) para [guardar, cargar y eliminar documentos de langchain](/docs/modules/data_connection/document_loaders/) con `SpannerLoader` y `SpannerDocumentSaver`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-spanner-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-spanner-python/blob/main/docs/document_loader.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

* [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Habilitar la API de Cloud Spanner](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)
* [Crear una instancia de Spanner](https://cloud.google.com/spanner/docs/create-manage-instances)
* [Crear una base de datos de Spanner](https://cloud.google.com/spanner/docs/create-manage-databases)
* [Crear una tabla de Spanner](https://cloud.google.com/spanner/docs/create-query-database-console#create-schema)

Después de confirmar el acceso a la base de datos en el entorno de ejecución de este cuaderno, rellene los siguientes valores y ejecute la celda antes de ejecutar los scripts de ejemplo.

```python
# @markdown Please specify an instance id, a database, and a table for demo purpose.
INSTANCE_ID = "test_instance"  # @param {type:"string"}
DATABASE_ID = "test_database"  # @param {type:"string"}
TABLE_NAME = "test_table"  # @param {type:"string"}
```

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-spanner`, por lo que debemos instalarlo.

```python
%pip install -upgrade --quiet langchain-google-spanner langchain
```

**Colab solo**: Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench puedes reiniciar el terminal usando el botón de arriba.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Establece tu proyecto de Google Cloud

Establece tu proyecto de Google Cloud para que puedas aprovechar los recursos de Google Cloud dentro de este cuaderno.

Si no sabes tu ID de proyecto, prueba lo siguiente:

* Ejecuta `gcloud config list`.
* Ejecuta `gcloud projects list`.
* Consulta la página de soporte: [Localiza el ID del proyecto](https://support.google.com/googleapi/answer/7014113).

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 Autenticación

Autentícate en Google Cloud como el usuario de IAM que ha iniciado sesión en este cuaderno para acceder a tu proyecto de Google Cloud.

- Si estás usando Colab para ejecutar este cuaderno, usa la celda a continuación y continúa.
- Si estás usando Vertex AI Workbench, consulta las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

## Uso básico

### Guardar documentos

Guarda documentos de langchain con `SpannerDocumentSaver.add_documents(<documents>)`. Para inicializar la clase `SpannerDocumentSaver` necesitas proporcionar 3 cosas:

1. `instance_id` - Una instancia de Spanner desde la que cargar datos.
1. `database_id` - Una instancia de la base de datos de Spanner desde la que cargar datos.
1. `table_name` - El nombre de la tabla dentro de la base de datos de Spanner para almacenar documentos de langchain.

```python
from langchain_core.documents import Document
from langchain_google_spanner import SpannerDocumentSaver

test_docs = [
    Document(
        page_content="Apple Granny Smith 150 0.99 1",
        metadata={"fruit_id": 1},
    ),
    Document(
        page_content="Banana Cavendish 200 0.59 0",
        metadata={"fruit_id": 2},
    ),
    Document(
        page_content="Orange Navel 80 1.29 1",
        metadata={"fruit_id": 3},
    ),
]

saver = SpannerDocumentSaver(
    instance_id=INSTANCE_ID,
    database_id=DATABASE_ID,
    table_name=TABLE_NAME,
)
saver.add_documents(test_docs)
```

### Consultar documentos de Spanner

Para más detalles sobre la conexión a una tabla de Spanner, consulta la [documentación del SDK de Python](https://cloud.google.com/python/docs/reference/spanner/latest).

#### Cargar documentos de la tabla

Carga documentos de langchain con `SpannerLoader.load()` o `SpannerLoader.lazy_load()`. `lazy_load` devuelve un generador que solo consulta la base de datos durante la iteración. Para inicializar la clase `SpannerLoader` necesitas proporcionar:

1. `instance_id` - Una instancia de Spanner desde la que cargar datos.
1. `database_id` - Una instancia de la base de datos de Spanner desde la que cargar datos.
1. `query` - Una consulta del dialecto de la base de datos.

```python
from langchain_google_spanner import SpannerLoader

query = f"SELECT * from {TABLE_NAME}"
loader = SpannerLoader(
    instance_id=INSTANCE_ID,
    database_id=DATABASE_ID,
    query=query,
)

for doc in loader.lazy_load():
    print(doc)
    break
```

### Eliminar documentos

Elimina una lista de documentos de langchain de la tabla con `SpannerDocumentSaver.delete(<documents>)`.

```python
docs = loader.load()
print("Documents before delete:", docs)

doc = test_docs[0]
saver.delete([doc])
print("Documents after delete:", loader.load())
```

## Uso avanzado

### Cliente personalizado

El cliente creado por defecto es el cliente predeterminado. Para pasar `credentials` y `project` explícitamente, se puede pasar un cliente personalizado al constructor.

```python
from google.cloud import spanner
from google.oauth2 import service_account

creds = service_account.Credentials.from_service_account_file("/path/to/key.json")
custom_client = spanner.Client(project="my-project", credentials=creds)
loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    client=custom_client,
)
```

### Personalizar el contenido y los metadatos de la página del documento

El cargador devolverá una lista de Documentos con el contenido de la página de una columna de datos específica. Todos los demás datos de las columnas se agregarán a los metadatos. Cada fila se convierte en un documento.

#### Personalizar el formato del contenido de la página

SpannerLoader asume que hay una columna llamada `page_content`. Estos valores predeterminados se pueden cambiar de la siguiente manera:

```python
custom_content_loader = SpannerLoader(
    INSTANCE_ID, DATABASE_ID, query, content_columns=["custom_content"]
)
```

Si se especifican varias columnas, el formato de cadena del contenido de la página predeterminado será `text` (concatenación de cadenas separadas por espacios). Hay otros formatos que el usuario puede especificar, incluyendo `text`, `JSON`, `YAML`, `CSV`.

#### Personalizar el formato de los metadatos

SpannerLoader asume que hay una columna de metadatos llamada `langchain_metadata` que almacena datos JSON. La columna de metadatos se utilizará como diccionario base. De forma predeterminada, se agregarán todos los demás datos de las columnas y pueden sobrescribir el valor original. Estos valores predeterminados se pueden cambiar de la siguiente manera:

```python
custom_metadata_loader = SpannerLoader(
    INSTANCE_ID, DATABASE_ID, query, metadata_columns=["column1", "column2"]
)
```

#### Personalizar el nombre de la columna de metadatos JSON

De forma predeterminada, el cargador utiliza `langchain_metadata` como diccionario base. Esto se puede personalizar para seleccionar una columna JSON que se utilizará como diccionario base para los metadatos del Documento.

```python
custom_metadata_json_loader = SpannerLoader(
    INSTANCE_ID, DATABASE_ID, query, metadata_json_column="another-json-column"
)
```

### Caducidad personalizada

La [caducidad](https://cloud.google.com/python/docs/reference/spanner/latest/snapshot-usage#beginning-a-snapshot) predeterminada es de 15 segundos. Esto se puede personalizar especificando un límite más débil (que puede ser para realizar todas las lecturas en un momento dado), o en función de una duración determinada en el pasado.

```python
import datetime

timestamp = datetime.datetime.utcnow()
custom_timestamp_loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    staleness=timestamp,
)
```

```python
duration = 20.0
custom_duration_loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    staleness=duration,
)
```

### Activar el impulso de datos

De forma predeterminada, el cargador no utilizará el [impulso de datos](https://cloud.google.com/spanner/docs/databoost/databoost-overview) ya que tiene costos adicionales asociados y requiere permisos adicionales de IAM. Sin embargo, el usuario puede optar por activarlo.

```python
custom_databoost_loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    databoost=True,
)
```

### Cliente personalizado

El cliente creado por defecto es el cliente predeterminado. Para pasar `credentials` y `project` explícitamente, se puede pasar un cliente personalizado al constructor.

```python
from google.cloud import spanner

custom_client = spanner.Client(project="my-project", credentials=creds)
saver = SpannerDocumentSaver(
    INSTANCE_ID,
    DATABASE_ID,
    TABLE_NAME,
    client=custom_client,
)
```

### Inicialización personalizada para SpannerDocumentSaver

SpannerDocumentSaver permite una inicialización personalizada. Esto permite al usuario especificar cómo se guarda el Document en la tabla.

content_column: Se utilizará como nombre de columna para el contenido de la página del Document. Predeterminado a `page_content`.

metadata_columns: Estos metadatos se guardarán en columnas específicas si la clave existe en los metadatos del Document.

metadata_json_column: Este será el nombre de columna para la columna JSON especial. Predeterminado a `langchain_metadata`.

```python
custom_saver = SpannerDocumentSaver(
    INSTANCE_ID,
    DATABASE_ID,
    TABLE_NAME,
    content_column="my-content",
    metadata_columns=["foo"],
    metadata_json_column="my-special-json-column",
)
```

### Inicializar un esquema personalizado para Spanner

SpannerDocumentSaver tendrá un método `init_document_table` para crear una nueva tabla para almacenar documentos con un esquema personalizado.

```python
from langchain_google_spanner import Column

new_table_name = "my_new_table"

SpannerDocumentSaver.init_document_table(
    INSTANCE_ID,
    DATABASE_ID,
    new_table_name,
    content_column="my-page-content",
    metadata_columns=[
        Column("category", "STRING(36)", True),
        Column("price", "FLOAT64", False),
    ],
)
```
