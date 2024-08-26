---
translated: true
---

# Google AlloyDB para PostgreSQL

> [AlloyDB](https://cloud.google.com/alloydb) es un servicio de base de datos relacional totalmente administrado que ofrece un alto rendimiento, una integración sin problemas y una impresionante escalabilidad. AlloyDB es 100% compatible con PostgreSQL. Extienda su aplicación de base de datos para crear experiencias impulsadas por IA aprovechando las integraciones de Langchain de AlloyDB.

Este cuaderno explica cómo usar `AlloyDB para PostgreSQL` para cargar documentos con la clase `AlloyDBLoader`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-alloydb-pg-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-alloydb-pg-python/blob/main/docs/document_loader.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

 * [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Habilitar la API de AlloyDB](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)
 * [Crear un clúster y una instancia de AlloyDB.](https://cloud.google.com/alloydb/docs/cluster-create)
 * [Crear una base de datos de AlloyDB.](https://cloud.google.com/alloydb/docs/quickstart/create-and-connect)
 * [Agregar un usuario a la base de datos.](https://cloud.google.com/alloydb/docs/database-users/about)

### 🦜🔗 Instalación de la biblioteca

Instale la biblioteca de integración, `langchain-google-alloydb-pg`.

```python
%pip install --upgrade --quiet  langchain-google-alloydb-pg
```

**Solo Colab:** Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench, puede reiniciar el terminal usando el botón de la parte superior.

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

### Establecer variables de la base de datos de AlloyDB

Encuentre los valores de su base de datos en la [página de instancias de AlloyDB](https://console.cloud.google.com/alloydb/clusters).

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
CLUSTER = "my-cluster"  # @param {type: "string"}
INSTANCE = "my-primary"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### Pool de conexiones de AlloyDBEngine

Uno de los requisitos y argumentos para establecer AlloyDB como un almacén de vectores es un objeto `AlloyDBEngine`. El `AlloyDBEngine` configura un pool de conexiones a su base de datos de AlloyDB, lo que permite conexiones exitosas desde su aplicación y sigue las mejores prácticas de la industria.

Para crear un `AlloyDBEngine` usando `AlloyDBEngine.from_instance()`, solo necesita proporcionar 5 cosas:

1. `project_id`: ID del proyecto de Google Cloud donde se encuentra la instancia de AlloyDB.
1. `region`: Región donde se encuentra la instancia de AlloyDB.
1. `cluster`: El nombre del clúster de AlloyDB.
1. `instance`: El nombre de la instancia de AlloyDB.
1. `database`: El nombre de la base de datos a la que conectarse en la instancia de AlloyDB.

De forma predeterminada, se utilizará la [autenticación de base de datos de IAM](https://cloud.google.com/alloydb/docs/connect-iam) como el método de autenticación de base de datos. Esta biblioteca usa el principal de IAM perteneciente a las [Credenciales predeterminadas de la aplicación (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) obtenidas del entorno.

Opcionalmente, también se puede usar la [autenticación de base de datos integrada](https://cloud.google.com/alloydb/docs/database-users/about) mediante un nombre de usuario y una contraseña para acceder a la base de datos de AlloyDB. Simplemente proporcione los argumentos opcionales `user` y `password` a `AlloyDBEngine.from_instance()`:

* `user`: Usuario de base de datos a usar para la autenticación y el inicio de sesión de la base de datos integrada.
* `password`: Contraseña de base de datos a usar para la autenticación y el inicio de sesión de la base de datos integrada.

**Nota**: Este tutorial demuestra la interfaz asincrónica. Todos los métodos asincrónicos tienen métodos sincrónicos correspondientes.

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

### Crear AlloyDBLoader

```python
from langchain_google_alloydb_pg import AlloyDBLoader

# Creating a basic AlloyDBLoader object
loader = await AlloyDBLoader.create(engine, table_name=TABLE_NAME)
```

### Cargar documentos a través de la tabla predeterminada

El cargador devuelve una lista de documentos de la tabla usando la primera columna como page_content y todas las demás columnas como metadatos. La tabla predeterminada tendrá la primera columna como
page_content y la segunda columna como metadatos (JSON). Cada fila se convierte en un documento.

```python
docs = await loader.aload()
print(docs)
```

### Cargar documentos a través de una tabla/metadatos personalizados o columnas de contenido de página personalizadas

```python
loader = await AlloyDBLoader.create(
    engine,
    table_name=TABLE_NAME,
    content_columns=["product_name"],  # Optional
    metadata_columns=["id"],  # Optional
)
docs = await loader.aload()
print(docs)
```

### Establecer el formato del contenido de la página

El cargador devuelve una lista de documentos, con un documento por fila, con el contenido de la página en el formato de cadena especificado, es decir, texto (concatenación separada por espacios), JSON, YAML, CSV, etc. Los formatos JSON y YAML incluyen encabezados, mientras que el texto y el CSV no incluyen encabezados de campo.

```python
loader = AlloyDBLoader.create(
    engine,
    table_name="products",
    content_columns=["product_name", "description"],
    format="YAML",
)
docs = await loader.aload()
print(docs)
```
