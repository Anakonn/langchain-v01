---
translated: true
---

Aquí está la traducción al español (es):

---
sidebar_label: Firestore
translated: false
---

# Google Firestore (Modo Nativo)

> [Firestore](https://cloud.google.com/firestore) es una base de datos sin servidor orientada a documentos que se escala para satisfacer cualquier demanda. Extienda su aplicación de base de datos para construir experiencias impulsadas por IA aprovechando las integraciones de Langchain de Firestore.

Este cuaderno explica cómo usar [Firestore](https://cloud.google.com/firestore) para almacenar vectores y consultarlos usando la clase `FirestoreVectorStore`.

[![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/vectorstores.ipynb)

## Antes de Comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

* [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Habilitar la API de Firestore](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [Crear una base de datos de Firestore](https://cloud.google.com/firestore/docs/manage-databases)

Después de confirmar el acceso a la base de datos en el entorno de ejecución de este cuaderno, complete los siguientes valores y ejecute la celda antes de ejecutar los scripts de ejemplo.

```python
# @markdown Please specify a source for demo purpose.
COLLECTION_NAME = "test"  # @param {type:"CollectionReference"|"string"}
```

### 🦜🔗 Instalación de la Biblioteca

La integración se encuentra en su propio paquete `langchain-google-firestore`, por lo que necesitamos instalarlo. Para este cuaderno, también instalaremos `langchain-google-genai` para usar los incrustaciones de Google Generative AI.

```python
%pip install -upgrade --quiet langchain-google-firestore langchain-google-vertexai
```

**Solo Colab**: Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench, puede reiniciar el terminal usando el botón de la parte superior.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Establece tu Proyecto de Google Cloud

Establece tu proyecto de Google Cloud para que puedas aprovechar los recursos de Google Cloud dentro de este cuaderno.

Si no conoces tu ID de proyecto, intenta lo siguiente:

* Ejecuta `gcloud config list`.
* Ejecuta `gcloud projects list`.
* Consulta la página de soporte: [Ubicar el ID del proyecto](https://support.google.com/googleapi/answer/7014113).

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "extensions-testing"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 Autenticación

Autentícate en Google Cloud como el usuario de IAM que ha iniciado sesión en este cuaderno para acceder a tu proyecto de Google Cloud.

- Si estás usando Colab para ejecutar este cuaderno, usa la celda a continuación y continúa.
- Si estás usando Vertex AI Workbench, revisa las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

# Uso Básico

### Inicializar FirestoreVectorStore

`FirestoreVectorStore` te permite almacenar nuevos vectores en una base de datos de Firestore. Puedes usarlo para almacenar incrustaciones de cualquier modelo, incluidos los de Google Generative AI.

```python
from langchain_google_firestore import FirestoreVectorStore
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest",
    project=PROJECT_ID,
)

# Sample data
ids = ["apple", "banana", "orange"]
fruits_texts = ['{"name": "apple"}', '{"name": "banana"}', '{"name": "orange"}']

# Create a vector store
vector_store = FirestoreVectorStore(
    collection="fruits",
    embedding=embedding,
)

# Add the fruits to the vector store
vector_store.add_texts(fruits_texts, ids=ids)
```

Como un atajo, puedes inicializar y agregar vectores en un solo paso usando el método `from_texts` y `from_documents`.

```python
vector_store = FirestoreVectorStore.from_texts(
    collection="fruits",
    texts=fruits_texts,
    embedding=embedding,
)
```

```python
from langchain_core.documents import Document

fruits_docs = [Document(page_content=fruit) for fruit in fruits_texts]

vector_store = FirestoreVectorStore.from_documents(
    collection="fruits",
    documents=fruits_docs,
    embedding=embedding,
)
```

### Eliminar Vectores

Puedes eliminar documentos con vectores de la base de datos usando el método `delete`. Deberás proporcionar el ID del documento del vector que deseas eliminar. Esto eliminará todo el documento de la base de datos, incluidos los demás campos que pueda tener.

```python
vector_store.delete(ids)
```

### Actualizar Vectores

Actualizar vectores es similar a agregarlos. Puedes usar el método `add` para actualizar el vector de un documento proporcionando el ID del documento y el nuevo vector.

```python
fruit_to_update = ['{"name": "apple","price": 12}']
apple_id = "apple"

vector_store.add_texts(fruit_to_update, ids=[apple_id])
```

## Búsqueda de Similitud

Puedes usar `FirestoreVectorStore` para realizar búsquedas de similitud en los vectores que has almacenado. Esto es útil para encontrar documentos o textos similares.

```python
vector_store.similarity_search("I like fuji apples", k=3)
```

```python
vector_store.max_marginal_relevance_search("fuji", 5)
```

Puedes agregar un prefiltro a la búsqueda usando el parámetro `filters`. Esto es útil para filtrar por un campo o valor específico.

```python
from google.cloud.firestore_v1.base_query import FieldFilter

vector_store.max_marginal_relevance_search(
    "fuji", 5, filters=FieldFilter("content", "==", "apple")
)
```

### Personalizar Conexión y Autenticación

```python
from google.api_core.client_options import ClientOptions
from google.cloud import firestore
from langchain_google_firestore import FirestoreVectorStore

client_options = ClientOptions()
client = firestore.Client(client_options=client_options)

# Create a vector store
vector_store = FirestoreVectorStore(
    collection="fruits",
    embedding=embedding,
    client=client,
)
```
