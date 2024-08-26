---
translated: true
---

# Google Cloud SQL para MySQL

> [Cloud SQL](https://cloud.google.com/sql) es un servicio de base de datos relacional totalmente administrado que ofrece alto rendimiento, integración sin problemas y una impresionante escalabilidad. Ofrece motores de base de datos PostgreSQL, MySQL y SQL Server. Extienda su aplicación de base de datos para crear experiencias impulsadas por IA aprovechando las integraciones de LangChain de Cloud SQL.

Este cuaderno analiza cómo usar `Cloud SQL para MySQL` para almacenar incrustaciones vectoriales con la clase `MySQLVectorStore`.

Obtenga más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/docs/vector_store.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

 * [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Habilitar la API de administración de Cloud SQL.](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com)
 * [Crear una instancia de Cloud SQL.](https://cloud.google.com/sql/docs/mysql/connect-instance-auth-proxy#create-instance) (la versión debe ser >= **8.0.36** con la bandera de base de datos **cloudsql_vector** configurada en "On")
 * [Crear una base de datos de Cloud SQL.](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
 * [Agregar un usuario a la base de datos.](https://cloud.google.com/sql/docs/mysql/create-manage-users)

### 🦜🔗 Instalación de la biblioteca

Instale la biblioteca de integración, `langchain-google-cloud-sql-mysql`, y la biblioteca para el servicio de incrustación, `langchain-google-vertexai`.

```python
%pip install --upgrade --quiet langchain-google-cloud-sql-mysql langchain-google-vertexai
```

**Sólo Colab:** Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench puedes reiniciar el terminal usando el botón de arriba.

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

**Nota:** El soporte de vectores MySQL solo está disponible en instancias MySQL con versión **>= 8.0.36**.

Para las instancias existentes, es posible que deba realizar una [actualización de mantenimiento de autoservicio](https://cloud.google.com/sql/docs/mysql/self-service-maintenance) para actualizar su versión de mantenimiento a **MYSQL_8_0_36.R20240401.03_00** o superior. Una vez actualizado, [configure las banderas de su base de datos](https://cloud.google.com/sql/docs/mysql/flags) para tener la nueva bandera **cloudsql_vector** en "On".

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-mysql-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### Grupo de conexiones MySQLEngine

Uno de los requisitos y argumentos para establecer Cloud SQL como un almacén de vectores es un objeto `MySQLEngine`. El `MySQLEngine` configura un grupo de conexiones a su base de datos de Cloud SQL, lo que permite conexiones exitosas desde su aplicación y sigue las mejores prácticas de la industria.

Para crear un `MySQLEngine` usando `MySQLEngine.from_instance()`, solo necesita proporcionar 4 cosas:

1. `project_id`: ID del proyecto de Google Cloud donde se encuentra la instancia de Cloud SQL.
1. `region`: Región donde se encuentra la instancia de Cloud SQL.
1. `instance`: El nombre de la instancia de Cloud SQL.
1. `database`: El nombre de la base de datos a la que conectarse en la instancia de Cloud SQL.

De forma predeterminada, se utilizará [autenticación de base de datos de IAM](https://cloud.google.com/sql/docs/mysql/iam-authentication#iam-db-auth) como el método de autenticación de base de datos. Esta biblioteca usa el principal de IAM perteneciente a las [Credenciales predeterminadas de la aplicación (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) obtenidas del entorno.

Para obtener más información sobre la autenticación de base de datos de IAM, consulte:

* [Configurar una instancia para la autenticación de base de datos de IAM](https://cloud.google.com/sql/docs/mysql/create-edit-iam-instances)
* [Administrar usuarios con autenticación de base de datos de IAM](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users)

Opcionalmente, también se puede usar [autenticación de base de datos integrada](https://cloud.google.com/sql/docs/mysql/built-in-authentication) mediante un nombre de usuario y una contraseña para acceder a la base de datos de Cloud SQL. Simplemente proporcione los argumentos opcionales `user` y `password` a `MySQLEngine.from_instance()`:

* `user`: Usuario de base de datos a usar para la autenticación y el inicio de sesión de la base de datos integrada
* `password`: Contraseña de base de datos a usar para la autenticación y el inicio de sesión de la base de datos integrada.

```python
from langchain_google_cloud_sql_mysql import MySQLEngine

engine = MySQLEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### Inicializar una tabla

La clase `MySQLVectorStore` requiere una tabla de base de datos. La clase `MySQLEngine` tiene un método auxiliar `init_vectorstore_table()` que se puede usar para crear una tabla con el esquema adecuado para usted.

```python
engine.init_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
)
```

### Crear una instancia de clase de incrustación

Puede usar cualquier [modelo de incrustaciones de LangChain](/docs/integrations/text_embedding/).
Es posible que deba habilitar la API de Vertex AI para usar `VertexAIEmbeddings`.

Recomendamos fijar la versión del modelo de incrustación para la producción, obtenga más información sobre los [modelos de incrustaciones de texto](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings).

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

### Inicializar un MySQLVectorStore predeterminado

Para inicializar una clase `MySQLVectorStore`, solo necesita proporcionar 3 cosas:

1. `engine` - Una instancia de un motor `MySQLEngine`.
1. `embedding_service` - Una instancia de un modelo de incrustación de LangChain.
1. `table_name`: El nombre de la tabla dentro de la base de datos de Cloud SQL que se utilizará como el almacén de vectores.

```python
from langchain_google_cloud_sql_mysql import MySQLVectorStore

store = MySQLVectorStore(
    engine=engine,
    embedding_service=embedding,
    table_name=TABLE_NAME,
)
```

### Agregar textos

```python
import uuid

all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]

store.add_texts(all_texts, metadatas=metadatas, ids=ids)
```

### Eliminar textos

Eliminar vectores de la tienda de vectores por ID.

```python
store.delete([ids[1]])
```

### Buscar documentos

```python
query = "I'd like a fruit."
docs = store.similarity_search(query)
print(docs[0].page_content)
```

```output
Pineapple
```

### Buscar documentos por vector

También es posible realizar una búsqueda de documentos similares a un vector de incrustación dado usando `similarity_search_by_vector`, que acepta un vector de incrustación como parámetro en lugar de una cadena.

```python
query_vector = embedding.embed_query(query)
docs = store.similarity_search_by_vector(query_vector, k=2)
print(docs)
```

```output
[Document(page_content='Pineapple', metadata={'len': 9}), Document(page_content='Banana', metadata={'len': 6})]
```

### Agregar un índice

Acelera las consultas de búsqueda de vectores aplicando un índice de vectores. Más información sobre [índices de vectores de MySQL](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/src/langchain_google_cloud_sql_mysql/indexes.py).

**Nota:** Para la autenticación de base de datos de IAM (uso predeterminado), el usuario de base de datos de IAM deberá recibir los siguientes permisos de un usuario de base de datos privilegiado para el control total de los índices de vectores.

```sql
GRANT EXECUTE ON PROCEDURE mysql.create_vector_index TO '<IAM_DB_USER>'@'%';
GRANT EXECUTE ON PROCEDURE mysql.alter_vector_index TO '<IAM_DB_USER>'@'%';
GRANT EXECUTE ON PROCEDURE mysql.drop_vector_index TO '<IAM_DB_USER>'@'%';
GRANT SELECT ON mysql.vector_indexes TO '<IAM_DB_USER>'@'%';
```

```python
from langchain_google_cloud_sql_mysql import VectorIndex

store.apply_vector_index(VectorIndex())
```

### Eliminar un índice

```python
store.drop_vector_index()
```

## Uso avanzado

### Crear un MySQLVectorStore con metadatos personalizados

Una tienda de vectores puede aprovechar los datos relacionales para filtrar las búsquedas de similitud.

Crea una tabla e instancia `MySQLVectorStore` con columnas de metadatos personalizadas.

```python
from langchain_google_cloud_sql_mysql import Column

# set table name
CUSTOM_TABLE_NAME = "vector_store_custom"

engine.init_vectorstore_table(
    table_name=CUSTOM_TABLE_NAME,
    vector_size=768,  # VertexAI model: textembedding-gecko@latest
    metadata_columns=[Column("len", "INTEGER")],
)


# initialize MySQLVectorStore with custom metadata columns
custom_store = MySQLVectorStore(
    engine=engine,
    embedding_service=embedding,
    table_name=CUSTOM_TABLE_NAME,
    metadata_columns=["len"],
    # connect to an existing VectorStore by customizing the table schema:
    # id_column="uuid",
    # content_column="documents",
    # embedding_column="vectors",
)
```

### Buscar documentos con filtro de metadatos

Puede ser útil reducir los documentos antes de trabajar con ellos.

Por ejemplo, los documentos se pueden filtrar por metadatos usando el argumento `filter`.

```python
import uuid

# add texts to the vector store
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]
custom_store.add_texts(all_texts, metadatas=metadatas, ids=ids)

# use filter on search
query_vector = embedding.embed_query("I'd like a fruit.")
docs = custom_store.similarity_search_by_vector(query_vector, filter="len >= 6")

print(docs)
```

```output
[Document(page_content='Pineapple', metadata={'len': 9}), Document(page_content='Banana', metadata={'len': 6}), Document(page_content='Apples and oranges', metadata={'len': 18}), Document(page_content='Cars and airplanes', metadata={'len': 18})]
```
