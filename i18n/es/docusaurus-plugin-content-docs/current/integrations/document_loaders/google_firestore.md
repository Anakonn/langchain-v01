---
translated: true
---

# Google Firestore (Modo Nativo)

> [Firestore](https://cloud.google.com/firestore) es una base de datos sin servidor orientada a documentos que se escala para satisfacer cualquier demanda. Extiende tu aplicación de base de datos para construir experiencias impulsadas por IA aprovechando las integraciones de Langchain de Firestore.

Este cuaderno explica cómo usar [Firestore](https://cloud.google.com/firestore) para [guardar, cargar y eliminar documentos de langchain](/docs/modules/data_connection/document_loaders/) con `FirestoreLoader` y `FirestoreSaver`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-firestore-python/).

[![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/document_loader.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

* [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Habilitar la API de Firestore](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [Crear una base de datos de Firestore](https://cloud.google.com/firestore/docs/manage-databases)

Después de confirmar el acceso a la base de datos en el entorno de ejecución de este cuaderno, complete los siguientes valores y ejecute la celda antes de ejecutar los scripts de ejemplo.

```python
# @markdown Please specify a source for demo purpose.
SOURCE = "test"  # @param {type:"Query"|"CollectionGroup"|"DocumentReference"|"string"}
```

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-firestore`, por lo que debemos instalarlo.

```python
%pip install -upgrade --quiet langchain-google-firestore
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

`FirestoreSaver` puede almacenar documentos en Firestore. De forma predeterminada, intentará extraer la referencia del documento de los metadatos.

Guarda documentos de langchain con `FirestoreSaver.upsert_documents(<documents>)`.

```python
from langchain_core.documents import Document
from langchain_google_firestore import FirestoreSaver

saver = FirestoreSaver()

data = [Document(page_content="Hello, World!")]

saver.upsert_documents(data)
```

#### Guardar documentos sin referencia

Si se especifica una colección, los documentos se almacenarán con un ID generado automáticamente.

```python
saver = FirestoreSaver("Collection")

saver.upsert_documents(data)
```

#### Guardar documentos con otras referencias

```python
doc_ids = ["AnotherCollection/doc_id", "foo/bar"]
saver = FirestoreSaver()

saver.upsert_documents(documents=data, document_ids=doc_ids)
```

### Cargar desde una colección o subcoleción

Carga documentos de langchain con `FirestoreLoader.load()` o `Firestore.lazy_load()`. `lazy_load` devuelve un generador que solo consulta la base de datos durante la iteración. Para inicializar la clase `FirestoreLoader`, necesitas proporcionar:

1. `source` - Una instancia de una consulta, un grupo de colecciones, una referencia de documento o la ruta de una sola colección de Firestore delimitada por `\`.

```python
from langchain_google_firestore import FirestoreLoader

loader_collection = FirestoreLoader("Collection")
loader_subcollection = FirestoreLoader("Collection/doc/SubCollection")


data_collection = loader_collection.load()
data_subcollection = loader_subcollection.load()
```

### Cargar un solo documento

```python
from google.cloud import firestore

client = firestore.Client()
doc_ref = client.collection("foo").document("bar")

loader_document = FirestoreLoader(doc_ref)

data = loader_document.load()
```

### Cargar desde un grupo de colecciones o una consulta

```python
from google.cloud.firestore import CollectionGroup, FieldFilter, Query

col_ref = client.collection("col_group")
collection_group = CollectionGroup(col_ref)

loader_group = FirestoreLoader(collection_group)

col_ref = client.collection("collection")
query = col_ref.where(filter=FieldFilter("region", "==", "west_coast"))

loader_query = FirestoreLoader(query)
```

### Eliminar documentos

Elimina una lista de documentos de langchain de la colección de Firestore con `FirestoreSaver.delete_documents(<documents>)`.

Si se proporcionan los ID de los documentos, se ignorarán los documentos.

```python
saver = FirestoreSaver()

saver.delete_documents(data)

# The Documents will be ignored and only the document ids will be used.
saver.delete_documents(data, doc_ids)
```

## Uso avanzado

### Cargar documentos con contenido de página y metadatos personalizados

Los argumentos de `page_content_fields` y `metadata_fields` especificarán los campos del documento de Firestore que se escribirán en el `page_content` y los `metadatos` del documento de LangChain.

```python
loader = FirestoreLoader(
    source="foo/bar/subcol",
    page_content_fields=["data_field"],
    metadata_fields=["metadata_field"],
)

data = loader.load()
```

#### Personalizar el formato del contenido de la página

Cuando el `page_content` contiene solo un campo, la información será el valor del campo. De lo contrario, el `page_content` estará en formato JSON.

### Personalizar la conexión y la autenticación

```python
from google.auth import compute_engine
from google.cloud.firestore import Client

client = Client(database="non-default-db", creds=compute_engine.Credentials())
loader = FirestoreLoader(
    source="foo",
    client=client,
)
```
