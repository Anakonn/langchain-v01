---
translated: true
---

# Google Firestore en modo Datastore

> [Firestore en modo Datastore](https://cloud.google.com/datastore) es una base de datos de documentos NoSQL construida para escalado automático, alto rendimiento y facilidad de desarrollo de aplicaciones. Extienda su aplicación de base de datos para construir experiencias impulsadas por IA aprovechando las integraciones de Langchain de Datastore.

Este cuaderno explica cómo usar [Firestore en modo Datastore](https://cloud.google.com/datastore) para [guardar, cargar y eliminar documentos de langchain](/docs/modules/data_connection/document_loaders/) con `DatastoreLoader` y `DatastoreSaver`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-datastore-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-datastore-python/blob/main/docs/document_loader.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

* [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Habilitar la API de Datastore](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com)
* [Crear una base de datos de Firestore en modo Datastore](https://cloud.google.com/datastore/docs/manage-databases)

Después de confirmar el acceso a la base de datos en el entorno de ejecución de este cuaderno, complete los siguientes valores y ejecute la celda antes de ejecutar los scripts de ejemplo.

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-datastore`, por lo que necesitamos instalarlo.

```python
%pip install -upgrade --quiet langchain-google-datastore
```

**Solo Colab**: Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench puedes reiniciar el terminal usando el botón de arriba.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Establece tu proyecto de Google Cloud

Establece tu proyecto de Google Cloud para que puedas aprovechar los recursos de Google Cloud dentro de este cuaderno.

Si no conoces tu ID de proyecto, intenta lo siguiente:

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

Guarda documentos de langchain con `DatastoreSaver.upsert_documents(<documents>)`. De forma predeterminada, intentará extraer la clave de la entidad de la `clave` en los metadatos del documento.

```python
from langchain_core.documents import Document
from langchain_google_datastore import DatastoreSaver

saver = DatastoreSaver()

data = [Document(page_content="Hello, World!")]
saver.upsert_documents(data)
```

#### Guardar documentos sin clave

Si se especifica un `tipo`, los documentos se almacenarán con un ID generado automáticamente.

```python
saver = DatastoreSaver("MyKind")

saver.upsert_documents(data)
```

### Cargar documentos por tipo

Carga documentos de langchain con `DatastoreLoader.load()` o `DatastoreLoader.lazy_load()`. `lazy_load` devuelve un generador que solo consulta la base de datos durante la iteración. Para inicializar la clase `DatastoreLoader` necesitas proporcionar:
1. `source` - La fuente para cargar los documentos. Puede ser una instancia de Query o el nombre del tipo de Datastore del que leer.

```python
from langchain_google_datastore import DatastoreLoader

loader = DatastoreLoader("MyKind")
data = loader.load()
```

### Cargar documentos por consulta

Además de cargar documentos por tipo, también podemos elegir cargar documentos por consulta. Por ejemplo:

```python
from google.cloud import datastore

client = datastore.Client(database="non-default-db", namespace="custom_namespace")
query_load = client.query(kind="MyKind")
query_load.add_filter("region", "=", "west_coast")

loader_document = DatastoreLoader(query_load)

data = loader_document.load()
```

### Eliminar documentos

Elimina una lista de documentos de langchain de Datastore con `DatastoreSaver.delete_documents(<documents>)`.

```python
saver = DatastoreSaver()

saver.delete_documents(data)

keys_to_delete = [
    ["Kind1", "identifier"],
    ["Kind2", 123],
    ["Kind3", "identifier", "NestedKind", 456],
]
# The Documents will be ignored and only the document ids will be used.
saver.delete_documents(data, keys_to_delete)
```

## Uso avanzado

### Cargar documentos con contenido de página y metadatos personalizados

Los argumentos de `page_content_properties` y `metadata_properties` especificarán las propiedades de la Entidad que se escribirán en el `page_content` y `metadata` del documento de LangChain.

```python
loader = DatastoreLoader(
    source="MyKind",
    page_content_fields=["data_field"],
    metadata_fields=["metadata_field"],
)

data = loader.load()
```

### Personalizar el formato del contenido de la página

Cuando el `page_content` contiene solo un campo, la información será solo el valor del campo. De lo contrario, el `page_content` estará en formato JSON.

### Personalizar la conexión y la autenticación

```python
from google.auth import compute_engine
from google.cloud.firestore import Client

client = Client(database="non-default-db", creds=compute_engine.Credentials())
loader = DatastoreLoader(
    source="foo",
    client=client,
)
```
