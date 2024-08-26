---
translated: true
---

# Google Cloud SQL para PostgreSQL

> [Cloud SQL para PostgreSQL](https://cloud.google.com/sql/docs/postgres) es un servicio de base de datos totalmente administrado que le ayuda a configurar, mantener, administrar y administrar sus bases de datos relacionales PostgreSQL en Google Cloud Platform. Extienda su aplicación de base de datos para construir experiencias impulsadas por IA aprovechando las integraciones de Langchain de Cloud SQL para PostgreSQL.

Este cuaderno analiza cómo usar `Cloud SQL para PostgreSQL` para cargar Documentos con la clase `PostgresLoader`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-pg-python/).

[![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-pg-python/blob/main/docs/document_loader.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

 * [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Habilitar la API de administración de Cloud SQL.](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
 * [Crear una instancia de Cloud SQL para PostgreSQL.](https://cloud.google.com/sql/docs/postgres/create-instance)
 * [Crear una base de datos de Cloud SQL para PostgreSQL.](https://cloud.google.com/sql/docs/postgres/create-manage-databases)
 * [Agregar un usuario a la base de datos.](https://cloud.google.com/sql/docs/postgres/create-manage-users)

### 🦜🔗 Instalación de la biblioteca

Instale la biblioteca de integración, `langchain_google_cloud_sql_pg`.

```python
%pip install --upgrade --quiet  langchain_google_cloud_sql_pg
```

**Solo Colab:** Descomente la siguiente celda para reiniciar el kernel o use el botón para reiniciar el kernel. Para Vertex AI Workbench puede reiniciar el terminal usando el botón de arriba.

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
# @title Project { display-mode: "form" }
PROJECT_ID = "gcp_project_id"  # @param {type:"string"}

# Set the project id
! gcloud config set project {PROJECT_ID}
```

## Uso básico

### Establecer valores de la base de datos de Cloud SQL

Encuentre sus variables de base de datos en la [página de instancias de Cloud SQL](https://console.cloud.google.com/sql/instances).

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-primary"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### Motor de Cloud SQL

Uno de los requisitos y argumentos para establecer PostgreSQL como un cargador de documentos es un objeto `PostgresEngine`. El `PostgresEngine` configura un grupo de conexiones a su base de datos de Cloud SQL para PostgreSQL, lo que permite conexiones exitosas desde su aplicación y sigue las mejores prácticas de la industria.

Para crear un `PostgresEngine` usando `PostgresEngine.from_instance()`, solo necesita proporcionar 4 cosas:

1. `project_id`: ID del proyecto de Google Cloud donde se encuentra la instancia de Cloud SQL.
1. `region`: Región donde se encuentra la instancia de Cloud SQL.
1. `instance`: El nombre de la instancia de Cloud SQL.
1. `database`: El nombre de la base de datos a la que conectarse en la instancia de Cloud SQL.

De forma predeterminada, se utilizará [autenticación de base de datos de IAM](https://cloud.google.com/sql/docs/postgres/iam-authentication) como el método de autenticación de base de datos. Esta biblioteca usa el principal de IAM perteneciente a las [Credenciales predeterminadas de la aplicación (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) obtenidas del entorno.

Opcionalmente, también se puede usar [autenticación de base de datos integrada](https://cloud.google.com/sql/docs/postgres/users) mediante un nombre de usuario y una contraseña para acceder a la base de datos de Cloud SQL. Simplemente proporcione los argumentos opcionales `user` y `password` a `PostgresEngine.from_instance()`:

* `user`: Usuario de base de datos a usar para la autenticación y el inicio de sesión de la base de datos integrada.
* `password`: Contraseña de base de datos a usar para la autenticación y el inicio de sesión de la base de datos integrada.

**Nota**: Este tutorial demuestra la interfaz asincrónica. Todos los métodos asíncronos tienen métodos síncronos correspondientes.

```python
from langchain_google_cloud_sql_pg import PostgresEngine

engine = await PostgresEngine.afrom_instance(
    project_id=PROJECT_ID,
    region=REGION,
    instance=INSTANCE,
    database=DATABASE,
)
```

### Crear PostgresLoader

```python
from langchain_google_cloud_sql_pg import PostgresLoader

# Creating a basic PostgreSQL object
loader = await PostgresLoader.create(engine, table_name=TABLE_NAME)
```

### Cargar documentos a través de la tabla predeterminada

El cargador devuelve una lista de Documentos de la tabla usando la primera columna como page_content y todas las demás columnas como metadatos. La tabla predeterminada tendrá la primera columna como
page_content y la segunda columna como metadatos (JSON). Cada fila se convierte en un documento. Tenga en cuenta que si desea que sus documentos tengan identificadores, deberá agregarlos.

```python
from langchain_google_cloud_sql_pg import PostgresLoader

# Creating a basic PostgresLoader object
loader = await PostgresLoader.create(engine, table_name=TABLE_NAME)

docs = await loader.aload()
print(docs)
```

### Cargar documentos a través de una tabla/metadatos personalizados o columnas de contenido de página personalizadas

```python
loader = await PostgresLoader.create(
    engine,
    table_name=TABLE_NAME,
    content_columns=["product_name"],  # Optional
    metadata_columns=["id"],  # Optional
)
docs = await loader.aload()
print(docs)
```

### Establecer el formato del contenido de la página

El cargador devuelve una lista de Documentos, con un documento por fila, con el contenido de la página en el formato de cadena especificado, es decir, texto (concatenación separada por espacios), JSON, YAML, CSV, etc. Los formatos JSON y YAML incluyen encabezados, mientras que el texto y el CSV no incluyen encabezados de campo.

```python
loader = await PostgresLoader.create(
    engine,
    table_name="products",
    content_columns=["product_name", "description"],
    format="YAML",
)
docs = await loader.aload()
print(docs)
```
