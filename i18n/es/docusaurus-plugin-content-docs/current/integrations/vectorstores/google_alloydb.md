---
translated: true
---

# Google AlloyDB para PostgreSQL

> [AlloyDB](https://cloud.google.com/alloydb) es un servicio de base de datos relacional totalmente administrado que ofrece alto rendimiento, integración sin problemas y una impresionante escalabilidad. AlloyDB es 100% compatible con PostgreSQL. Extiende tu aplicación de base de datos para construir experiencias impulsadas por IA aprovechando las integraciones de Langchain de AlloyDB.

Este cuaderno explica cómo usar `AlloyDB para PostgreSQL` para almacenar incrustaciones vectoriales con la clase `AlloyDBVectorStore`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-alloydb-pg-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-alloydb-pg-python/blob/main/docs/vector_store.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberás hacer lo siguiente:

 * [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Habilitar la API de AlloyDB](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)
 * [Crear un clúster y una instancia de AlloyDB.](https://cloud.google.com/alloydb/docs/cluster-create)
 * [Crear una base de datos de AlloyDB.](https://cloud.google.com/alloydb/docs/quickstart/create-and-connect)
 * [Agregar un usuario a la base de datos.](https://cloud.google.com/alloydb/docs/database-users/about)

### 🦜🔗 Instalación de la biblioteca

Instala la biblioteca de integración, `langchain-google-alloydb-pg`, y la biblioteca para el servicio de incrustación, `langchain-google-vertexai`.

```python
%pip install --upgrade --quiet  langchain-google-alloydb-pg langchain-google-vertexai
```

**Sólo Colab:** Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench puedes reiniciar el terminal usando el botón de arriba.

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

Si no sabes tu ID de proyecto, prueba lo siguiente:

* Ejecuta `gcloud config list`.
* Ejecuta `gcloud projects list`.
* Consulta la página de soporte: [Localizar el ID del proyecto](https://support.google.com/googleapi/answer/7014113).

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

## Uso básico

### Establecer los valores de la base de datos de AlloyDB

Encuentra tus valores de base de datos en la [página de instancias de AlloyDB](https://console.cloud.google.com/alloydb/clusters).

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
CLUSTER = "my-cluster"  # @param {type: "string"}
INSTANCE = "my-primary"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### Pool de conexiones de AlloyDBEngine

Uno de los requisitos y argumentos para establecer AlloyDB como un almacén de vectores es un objeto `AlloyDBEngine`. El `AlloyDBEngine` configura un pool de conexiones a tu base de datos de AlloyDB, permitiendo conexiones exitosas desde tu aplicación y siguiendo las mejores prácticas de la industria.

Para crear un `AlloyDBEngine` usando `AlloyDBEngine.from_instance()`, necesitas proporcionar solo 5 cosas:

1. `project_id`: ID del proyecto de Google Cloud donde se encuentra la instancia de AlloyDB.
1. `region`: Región donde se encuentra la instancia de AlloyDB.
1. `cluster`: El nombre del clúster de AlloyDB.
1. `instance`: El nombre de la instancia de AlloyDB.
1. `database`: El nombre de la base de datos a la que conectarse en la instancia de AlloyDB.

De forma predeterminada, se utilizará la [autenticación de base de datos de IAM](https://cloud.google.com/alloydb/docs/connect-iam) como método de autenticación de base de datos. Esta biblioteca usa el principal de IAM perteneciente a las [Credenciales predeterminadas de la aplicación (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) obtenidas del entorno.

Opcionalmente, también se puede utilizar la [autenticación de base de datos integrada](https://cloud.google.com/alloydb/docs/database-users/about) mediante un nombre de usuario y una contraseña para acceder a la base de datos de AlloyDB. Simplemente proporciona los argumentos opcionales `user` y `password` a `AlloyDBEngine.from_instance()`:

* `user`: Usuario de base de datos a utilizar para la autenticación y el inicio de sesión de la base de datos integrada.
* `password`: Contraseña de base de datos a utilizar para la autenticación y el inicio de sesión de la base de datos integrada.

**Nota:** Este tutorial demuestra la interfaz asíncrona. Todos los métodos asíncronos tienen métodos síncronos correspondientes.

```python
from langchain_google_alloydb_pg import AlloyDBEngine

engine = await AlloyDBEngine.afrom_instance(
    project_id=PROJECT_ID,
    region=REGION,
    cluster=CLUSTER,
    instance=INSTANCE,
    database=DATABASE,
)
```

### Inicializar una tabla

La clase `AlloyDBVectorStore` requiere una tabla de base de datos. El motor `AlloyDBEngine` tiene un método auxiliar `init_vectorstore_table()` que se puede usar para crear una tabla con el esquema adecuado para ti.

```python
await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
)
```

### Crear una instancia de clase de incrustación

Puedes usar cualquier [modelo de incrustaciones de LangChain](/docs/integrations/text_embedding/).
Es posible que necesites habilitar la API de Vertex AI para usar `VertexAIEmbeddings`. Recomendamos establecer la versión del modelo de incrustación para producción, obtén más información sobre los [modelos de incrustaciones de texto](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings).

```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```

```python
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### Inicializar un AlloyDBVectorStore predeterminado

```python
from langchain_google_alloydb_pg import AlloyDBVectorStore

store = await AlloyDBVectorStore.create(
    engine=engine,
    table_name=TABLE_NAME,
    embedding_service=embedding,
)
```

### Agregar textos

```python
import uuid

all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]

await store.aadd_texts(all_texts, metadatas=metadatas, ids=ids)
```

### Eliminar textos

```python
await store.adelete([ids[1]])
```

### Buscar documentos

```python
query = "I'd like a fruit."
docs = await store.asimilarity_search(query)
print(docs)
```

### Buscar documentos por vector

```python
query_vector = embedding.embed_query(query)
docs = await store.asimilarity_search_by_vector(query_vector, k=2)
print(docs)
```

## Agregar un índice

Acelera las consultas de búsqueda de vectores aplicando un índice de vectores. Más información sobre [índices de vectores](https://cloud.google.com/blog/products/databases/faster-similarity-search-performance-with-pgvector-indexes).

```python
from langchain_google_alloydb_pg.indexes import IVFFlatIndex

index = IVFFlatIndex()
await store.aapply_vector_index(index)
```

### Reindexar

```python
await store.areindex()  # Re-index using default index name
```

### Eliminar un índice

```python
await store.adrop_vector_index()  # Delete index using default name
```

## Crear un Vector Store personalizado

Un Vector Store puede aprovechar los datos relacionales para filtrar las búsquedas de similitud.

Crea una tabla con columnas de metadatos personalizadas.

```python
from langchain_google_alloydb_pg import Column

# Set table name
TABLE_NAME = "vectorstore_custom"

await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # VertexAI model: textembedding-gecko@latest
    metadata_columns=[Column("len", "INTEGER")],
)


# Initialize AlloyDBVectorStore
custom_store = await AlloyDBVectorStore.create(
    engine=engine,
    table_name=TABLE_NAME,
    embedding_service=embedding,
    metadata_columns=["len"],
    # Connect to a existing VectorStore by customizing the table schema:
    # id_column="uuid",
    # content_column="documents",
    # embedding_column="vectors",
)
```

### Buscar documentos con filtro de metadatos

```python
import uuid

# Add texts to the Vector Store
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]
await store.aadd_texts(all_texts, metadatas=metadatas, ids=ids)

# Use filter on search
docs = await custom_store.asimilarity_search_by_vector(query_vector, filter="len >= 6")

print(docs)
```
