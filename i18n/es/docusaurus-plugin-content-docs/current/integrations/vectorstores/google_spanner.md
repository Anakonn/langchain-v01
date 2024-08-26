---
translated: true
---

# Google Spanner

> [Spanner](https://cloud.google.com/spanner) es una base de datos altamente escalable que combina escalabilidad ilimitada con semántica relacional, como índices secundarios, consistencia fuerte, esquemas y SQL, proporcionando una disponibilidad del 99,999% en una sola solución fácil de usar.

Este cuaderno explica cómo usar `Spanner` para la búsqueda vectorial con la clase `SpannerVectorStore`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-spanner-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-spanner-python/blob/main/docs/vector_store.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

 * [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Habilitar la API de Cloud Spanner](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)
 * [Crear una instancia de Spanner](https://cloud.google.com/spanner/docs/create-manage-instances)
 * [Crear una base de datos de Spanner](https://cloud.google.com/spanner/docs/create-manage-databases)

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-spanner`, por lo que debemos instalarlo.

```python
%pip install --upgrade --quiet langchain-google-spanner
```

```output
Note: you may need to restart the kernel to use updated packages.
```

**Colab solo:** Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench, puedes reiniciar el terminal usando el botón de la parte superior.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 Autenticación

Autentícate en Google Cloud como el usuario de IAM que ha iniciado sesión en este cuaderno para acceder a tu proyecto de Google Cloud.

* Si estás usando Colab para ejecutar este cuaderno, usa la celda a continuación y continúa.
* Si estás usando Vertex AI Workbench, consulta las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ Establece tu proyecto de Google Cloud

Establece tu proyecto de Google Cloud para que puedas aprovechar los recursos de Google Cloud dentro de este cuaderno.

Si no conoces tu ID de proyecto, prueba lo siguiente:

* Ejecuta `gcloud config list`.
* Ejecuta `gcloud projects list`.
* Consulta la página de soporte: [Localizar el ID del proyecto](https://support.google.com/googleapi/answer/7014113).

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 Habilitación de la API

El paquete `langchain-google-spanner` requiere que [habilites la API de Spanner](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com) en tu proyecto de Google Cloud.

```python
# enable Spanner API
!gcloud services enable spanner.googleapis.com
```

## Uso básico

### Establecer los valores de la base de datos de Spanner

Encuentra tus valores de base de datos en la [página de instancias de Spanner](https://console.cloud.google.com/spanner?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687).

```python
# @title Set Your Values Here { display-mode: "form" }
INSTANCE = "my-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vectors_search_data"  # @param {type: "string"}
```

### Inicializar una tabla

La instancia de la clase `SpannerVectorStore` requiere una tabla de base de datos con columnas de id, contenido y incrustaciones.

El método auxiliar `init_vector_store_table()` se puede usar para crear una tabla con el esquema adecuado.

```python
from langchain_google_spanner import SecondaryIndex, SpannerVectorStore, TableColumn

SpannerVectorStore.init_vector_store_table(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    id_column="row_id",
    metadata_columns=[
        TableColumn(name="metadata", type="JSON", is_null=True),
        TableColumn(name="title", type="STRING(MAX)", is_null=False),
    ],
    secondary_indexes=[
        SecondaryIndex(index_name="row_id_and_title", columns=["row_id", "title"])
    ],
)
```

### Crear una instancia de clase de incrustación

Puedes usar cualquier [modelo de incrustaciones de LangChain](/docs/integrations/text_embedding/).
Es posible que necesites habilitar la API de Vertex AI para usar `VertexAIEmbeddings`. Recomendamos establecer la versión del modelo de incrustaciones para producción, obtén más información sobre los [modelos de incrustaciones de texto](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings).

```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```

```python
from langchain_google_vertexai import VertexAIEmbeddings

embeddings = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### SpannerVectorStore

Para inicializar la clase `SpannerVectorStore`, necesitas proporcionar 4 argumentos obligatorios y otros argumentos son opcionales y solo necesitan pasarse si son diferentes de los valores predeterminados.

1. `instance_id` - El nombre de la instancia de Spanner
1. `database_id` - El nombre de la base de datos de Spanner
1. `table_name` - El nombre de la tabla dentro de la base de datos para almacenar los documentos y sus incrustaciones.
1. `embedding_service` - La implementación de Embeddings que se usa para generar las incrustaciones.

```python
db = SpannerVectorStore(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    ignore_metadata_columns=[],
    embedding_service=embeddings,
    metadata_json_column="metadata",
)
```

#### 🔐 Agregar documentos

Para agregar documentos en el vector store.

```python
import uuid

from langchain_community.document_loaders import HNLoader

loader = HNLoader("https://news.ycombinator.com/item?id=34817881")

documents = loader.load()
ids = [str(uuid.uuid4()) for _ in range(len(documents))]
```

#### 🔐 Buscar documentos

Para buscar documentos en el vector store con búsqueda de similitud.

```python
db.similarity_search(query="Explain me vector store?", k=3)
```

#### 🔐 Buscar documentos

Para buscar documentos en el vector store con búsqueda de relevancia marginal máxima.

```python
db.max_marginal_relevance_search("Testing the langchain integration with spanner", k=3)
```

#### 🔐 Eliminar documentos

Para eliminar documentos del vector store, usa los ID que corresponden a los valores de la columna `row_id` al inicializar el VectorStore.

```python
db.delete(ids=["id1", "id2"])
```

#### 🔐 Eliminar documentos

Para eliminar documentos del vector store, puedes utilizar los propios documentos. La columna de contenido y las columnas de metadatos proporcionadas durante la inicialización de VectorStore se utilizarán para averiguar las filas correspondientes a los documentos. Cualquier fila coincidente se eliminará.

```python
db.delete(documents=[documents[0], documents[1]])
```
