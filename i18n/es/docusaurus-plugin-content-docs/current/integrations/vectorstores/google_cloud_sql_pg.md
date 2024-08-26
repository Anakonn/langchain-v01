---
translated: true
---

# Google Cloud SQL para PostgreSQL

> [Cloud SQL](https://cloud.google.com/sql) es un servicio de base de datos relacional totalmente administrado que ofrece alto rendimiento, integración sin problemas y una impresionante escalabilidad. Ofrece motores de base de datos PostgreSQL, PostgreSQL y SQL Server. Extienda su aplicación de base de datos para construir experiencias impulsadas por IA aprovechando las integraciones de Langchain de Cloud SQL.

Este cuaderno analiza cómo usar `Cloud SQL para PostgreSQL` para almacenar incrustaciones vectoriales con la clase `PostgresVectorStore`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-pg-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-pg-python/blob/main/docs/vector_store.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

 * [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Habilitar la API de administración de Cloud SQL.](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com)
 * [Crear una instancia de Cloud SQL.](https://cloud.google.com/sql/docs/postgres/connect-instance-auth-proxy#create-instance)
 * [Crear una base de datos de Cloud SQL.](https://cloud.google.com/sql/docs/postgres/create-manage-databases)
 * [Agregar un usuario a la base de datos.](https://cloud.google.com/sql/docs/postgres/create-manage-users)

### 🦜🔗 Instalación de la biblioteca

Instale la biblioteca de integración, `langchain-google-cloud-sql-pg`, y la biblioteca para el servicio de incrustación, `langchain-google-vertexai`.

```python
%pip install --upgrade --quiet  langchain-google-cloud-sql-pg langchain-google-vertexai
```

**Colab solo:** Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench puedes reiniciar el terminal usando el botón de arriba.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 Autenticación

Autentíquese en Google Cloud como el usuario de IAM que inició sesión en este cuaderno para acceder a su proyecto de Google Cloud.

* Si está usando Colab para ejecutar este cuaderno, use la celda a continuación y continúe.
* Si está usando Vertex AI Workbench, consulte las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ Establezca su proyecto de Google Cloud

Establezca su proyecto de Google Cloud para que pueda aprovechar los recursos de Google Cloud dentro de este cuaderno.

Si no conoce su ID de proyecto, intente lo siguiente:

* Ejecute `gcloud config list`.
* Ejecute `gcloud projects list`.
* Consulte la página de soporte: [Ubicar el ID del proyecto](https://support.google.com/googleapi/answer/7014113).

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

## Uso básico

### Establecer los valores de la base de datos de Cloud SQL

Encuentre los valores de su base de datos en la [página de instancias de Cloud SQL](https://console.cloud.google.com/sql?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687).

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-pg-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### Grupo de conexiones del motor PostgreSQL

Uno de los requisitos y argumentos para establecer Cloud SQL como un almacén de vectores es un objeto `PostgresEngine`. El `PostgresEngine` configura un grupo de conexiones a su base de datos de Cloud SQL, lo que permite conexiones exitosas desde su aplicación y sigue las mejores prácticas de la industria.

Para crear un `PostgresEngine` usando `PostgresEngine.from_instance()`, solo necesita proporcionar 4 cosas:

1.   `project_id` : ID del proyecto de Google Cloud donde se encuentra la instancia de Cloud SQL.
1. `region` : Región donde se encuentra la instancia de Cloud SQL.
1. `instance` : El nombre de la instancia de Cloud SQL.
1. `database` : El nombre de la base de datos a la que conectarse en la instancia de Cloud SQL.

De forma predeterminada, se utilizará [autenticación de base de datos de IAM](https://cloud.google.com/sql/docs/postgres/iam-authentication#iam-db-auth) como el método de autenticación de base de datos. Esta biblioteca usa el principal de IAM perteneciente a las [Credenciales predeterminadas de la aplicación (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) obtenidas del entorno.

Para obtener más información sobre la autenticación de base de datos de IAM, consulte:

* [Configurar una instancia para la autenticación de base de datos de IAM](https://cloud.google.com/sql/docs/postgres/create-edit-iam-instances)
* [Administrar usuarios con autenticación de base de datos de IAM](https://cloud.google.com/sql/docs/postgres/add-manage-iam-users)

Opcionalmente, también se puede usar [autenticación de base de datos integrada](https://cloud.google.com/sql/docs/postgres/built-in-authentication) mediante un nombre de usuario y una contraseña para acceder a la base de datos de Cloud SQL. Simplemente proporcione los argumentos opcionales `user` y `password` a `PostgresEngine.from_instance()`:

* `user` : Usuario de base de datos a usar para la autenticación y el inicio de sesión de la base de datos integrada
* `password` : Contraseña de base de datos a usar para la autenticación y el inicio de sesión de la base de datos integrada.

"**Nota**: Este tutorial demuestra la interfaz asincrónica. Todos los métodos asincrónicos tienen métodos sincrónicos correspondientes."

```python
from langchain_google_cloud_sql_pg import PostgresEngine

engine = await PostgresEngine.afrom_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### Inicializar una tabla

La clase `PostgresVectorStore` requiere una tabla de base de datos. El motor `PostgresEngine` tiene un método auxiliar `init_vectorstore_table()` que se puede usar para crear una tabla con el esquema adecuado para usted.

```python
from langchain_google_cloud_sql_pg import PostgresEngine

await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
)
```

### Crear una instancia de clase de incrustación

Puede usar cualquier [modelo de incrustaciones de LangChain](/docs/integrations/text_embedding/).
Es posible que deba habilitar la API de Vertex AI para usar `VertexAIEmbeddings`. Recomendamos establecer la versión del modelo de incrustación para la producción, obtenga más información sobre los [modelos de incrustaciones de texto](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings).

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

### Inicializar un PostgresVectorStore predeterminado

```python
from langchain_google_cloud_sql_pg import PostgresVectorStore

store = await PostgresVectorStore.create(  # Use .create() to initialize an async vector store
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

Acelere las consultas de búsqueda de vectores aplicando un índice de vectores. Más información sobre [índices de vectores](https://cloud.google.com/blog/products/databases/faster-similarity-search-performance-with-pgvector-indexes).

```python
from langchain_google_cloud_sql_pg.indexes import IVFFlatIndex

index = IVFFlatIndex()
await store.aapply_vector_index(index)
```

### Reindexar

```python
await store.areindex()  # Re-index using default index name
```

### Eliminar un índice

```python
await store.aadrop_vector_index()  # Delete index using default name
```

## Crear un Vector Store personalizado

Un Vector Store puede aprovechar los datos relacionales para filtrar las búsquedas de similitud.

Cree una tabla con columnas de metadatos personalizadas.

```python
from langchain_google_cloud_sql_pg import Column

# Set table name
TABLE_NAME = "vectorstore_custom"

await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # VertexAI model: textembedding-gecko@latest
    metadata_columns=[Column("len", "INTEGER")],
)


# Initialize PostgresVectorStore
custom_store = await PostgresVectorStore.create(
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
