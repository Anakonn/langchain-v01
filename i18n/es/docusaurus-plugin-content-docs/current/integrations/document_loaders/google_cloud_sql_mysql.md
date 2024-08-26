---
translated: true
---

# Google Cloud SQL para MySQL

> [Cloud SQL](https://cloud.google.com/sql) es un servicio de base de datos relacional totalmente administrado que ofrece alto rendimiento, integración sin problemas y una impresionante escalabilidad. Ofrece motores de base de datos [MySQL](https://cloud.google.com/sql/mysql), [PostgreSQL](https://cloud.google.com/sql/postgresql) y [SQL Server](https://cloud.google.com/sql/sqlserver). Extienda su aplicación de base de datos para construir experiencias impulsadas por IA aprovechando las integraciones de Langchain de Cloud SQL.

Este cuaderno analiza cómo usar [Cloud SQL para MySQL](https://cloud.google.com/sql/mysql) para [guardar, cargar y eliminar documentos de langchain](/docs/modules/data_connection/document_loaders/) con `MySQLLoader` y `MySQLDocumentSaver`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/docs/document_loader.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

* [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Habilitar la API de administración de Cloud SQL.](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
* [Crear una instancia de Cloud SQL para MySQL](https://cloud.google.com/sql/docs/mysql/create-instance)
* [Crear una base de datos de Cloud SQL](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
* [Agregar un usuario de base de datos IAM a la base de datos](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users#creating-a-database-user) (Opcional)

Después de confirmar el acceso a la base de datos en el entorno de ejecución de este cuaderno, complete los siguientes valores y ejecute la celda antes de ejecutar los scripts de ejemplo.

```python
# @markdown Please fill in the both the Google Cloud region and name of your Cloud SQL instance.
REGION = "us-central1"  # @param {type:"string"}
INSTANCE = "test-instance"  # @param {type:"string"}

# @markdown Please specify a database and a table for demo purpose.
DATABASE = "test"  # @param {type:"string"}
TABLE_NAME = "test-default"  # @param {type:"string"}
```

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-cloud-sql-mysql`, por lo que debemos instalarlo.

```python
%pip install -upgrade --quiet langchain-google-cloud-sql-mysql
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

Si no sabes tu ID de proyecto, intenta lo siguiente:

* Ejecuta `gcloud config list`.
* Ejecuta `gcloud projects list`.
* Consulta la página de soporte: [Ubicar el ID del proyecto](https://support.google.com/googleapi/answer/7014113).

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 Autenticación

Autentícate en Google Cloud como el usuario IAM que inició sesión en este cuaderno para acceder a tu proyecto de Google Cloud.

- Si estás usando Colab para ejecutar este cuaderno, usa la celda a continuación y continúa.
- Si estás usando Vertex AI Workbench, consulta las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

## Uso básico

### Pool de conexiones de MySQLEngine

Antes de guardar o cargar documentos desde una tabla MySQL, primero debemos configurar un pool de conexiones a la base de datos de Cloud SQL. El `MySQLEngine` configura un pool de conexiones a tu base de datos de Cloud SQL, lo que permite conexiones exitosas desde tu aplicación y sigue las mejores prácticas de la industria.

Para crear un `MySQLEngine` usando `MySQLEngine.from_instance()`, necesitas proporcionar solo 4 cosas:

1. `project_id`: ID del proyecto de Google Cloud donde se encuentra la instancia de Cloud SQL.
2. `region`: Región donde se encuentra la instancia de Cloud SQL.
3. `instance`: El nombre de la instancia de Cloud SQL.
4. `database`: El nombre de la base de datos a la que conectarse en la instancia de Cloud SQL.

De forma predeterminada, se utilizará la [autenticación de base de datos IAM](https://cloud.google.com/sql/docs/mysql/iam-authentication#iam-db-auth) como método de autenticación de base de datos. Esta biblioteca usa el principal IAM perteneciente a las [Credenciales predeterminadas de la aplicación (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) obtenidas del entorno.

Para obtener más información sobre la autenticación de base de datos IAM, consulta:

* [Configurar una instancia para la autenticación de base de datos IAM](https://cloud.google.com/sql/docs/mysql/create-edit-iam-instances)
* [Administrar usuarios con autenticación de base de datos IAM](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users)

Opcionalmente, también se puede utilizar la [autenticación de base de datos integrada](https://cloud.google.com/sql/docs/mysql/built-in-authentication) mediante un nombre de usuario y una contraseña para acceder a la base de datos de Cloud SQL. Simplemente proporciona los argumentos opcionales `user` y `password` a `MySQLEngine.from_instance()`:

* `user`: Usuario de base de datos a utilizar para la autenticación de base de datos integrada y el inicio de sesión.
* `password`: Contraseña de base de datos a utilizar para la autenticación de base de datos integrada y el inicio de sesión.

```python
from langchain_google_cloud_sql_mysql import MySQLEngine

engine = MySQLEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### Inicializar una tabla

Inicializa una tabla con el esquema predeterminado a través de `MySQLEngine.init_document_table(<table_name>)`. Columnas de la tabla:

- page_content (tipo: text)
- langchain_metadata (tipo: JSON)

La bandera `overwrite_existing=True` significa que la nueva tabla inicializada reemplazará cualquier tabla existente con el mismo nombre.

```python
engine.init_document_table(TABLE_NAME, overwrite_existing=True)
```

### Guardar documentos

Guarda documentos de langchain con `MySQLDocumentSaver.add_documents(<documents>)`. Para inicializar la clase `MySQLDocumentSaver`, necesitas proporcionar 2 cosas:

1. `engine` - Una instancia de un motor `MySQLEngine`.
2. `table_name` - El nombre de la tabla dentro de la base de datos de Cloud SQL para almacenar documentos de langchain.

```python
from langchain_core.documents import Document
from langchain_google_cloud_sql_mysql import MySQLDocumentSaver

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
saver = MySQLDocumentSaver(engine=engine, table_name=TABLE_NAME)
saver.add_documents(test_docs)
```

### Cargar documentos

Carga documentos de langchain con `MySQLLoader.load()` o `MySQLLoader.lazy_load()`. `lazy_load` devuelve un generador que solo consulta la base de datos durante la iteración. Para inicializar la clase `MySQLLoader`, necesitas proporcionar:

1. `engine` - Una instancia de un motor `MySQLEngine`.
2. `table_name` - El nombre de la tabla dentro de la base de datos de Cloud SQL para almacenar documentos de langchain.

```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.lazy_load()
for doc in docs:
    print("Loaded documents:", doc)
```

### Cargar documentos a través de consulta

Además de cargar documentos desde una tabla, también podemos elegir cargar documentos desde una vista generada a partir de una consulta SQL. Por ejemplo:

```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(
    engine=engine,
    query=f"select * from `{TABLE_NAME}` where JSON_EXTRACT(langchain_metadata, '$.fruit_id') = 1;",
)
onedoc = loader.load()
onedoc
```

La vista generada a partir de la consulta SQL puede tener un esquema diferente al de la tabla predeterminada. En tales casos, el comportamiento de MySQLLoader es el mismo que al cargar desde una tabla con un esquema no predeterminado. Consulte la sección [Cargar documentos con contenido de página de documento y metadatos personalizados](#Cargar-documentos-con-contenido-de-página-de-documento-y-metadatos-personalizados).

### Eliminar documentos

Elimine una lista de documentos de langchain de la tabla MySQL con `MySQLDocumentSaver.delete(<documents>)`.

Para una tabla con esquema predeterminado (page_content, langchain_metadata), el criterio de eliminación es:

Se debe eliminar una `fila` si existe un `documento` en la lista, de modo que

- `document.page_content` es igual a `row[page_content]`
- `document.metadata` es igual a `row[langchain_metadata]`

```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(onedoc)
print("Documents after delete:", loader.load())
```

## Uso avanzado

### Cargar documentos con contenido de página de documento y metadatos personalizados

Primero preparamos una tabla de ejemplo con un esquema no predeterminado y la poblamos con algunos datos arbitrarios.

```python
import sqlalchemy

with engine.connect() as conn:
    conn.execute(sqlalchemy.text(f"DROP TABLE IF EXISTS `{TABLE_NAME}`"))
    conn.commit()
    conn.execute(
        sqlalchemy.text(
            f"""
            CREATE TABLE IF NOT EXISTS `{TABLE_NAME}`(
                fruit_id INT AUTO_INCREMENT PRIMARY KEY,
                fruit_name VARCHAR(100) NOT NULL,
                variety VARCHAR(50),
                quantity_in_stock INT NOT NULL,
                price_per_unit DECIMAL(6,2) NOT NULL,
                organic TINYINT(1) NOT NULL
            )
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO `{TABLE_NAME}` (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES
                ('Apple', 'Granny Smith', 150, 0.99, 1),
                ('Banana', 'Cavendish', 200, 0.59, 0),
                ('Orange', 'Navel', 80, 1.29, 1);
            """
        )
    )
    conn.commit()
```

Si aún cargamos documentos de langchain con los parámetros predeterminados de `MySQLLoader` desde esta tabla de ejemplo, el `page_content` de los documentos cargados será la primera columna de la tabla y `metadata` consistirá en pares clave-valor de todas las otras columnas.

```python
loader = MySQLLoader(
    engine=engine,
    table_name=TABLE_NAME,
)
loader.load()
```

Podemos especificar el contenido y los metadatos que queremos cargar estableciendo `content_columns` y `metadata_columns` al inicializar el `MySQLLoader`.

1. `content_columns`: Las columnas para escribir en el `page_content` del documento.
2. `metadata_columns`: Las columnas para escribir en el `metadata` del documento.

Por ejemplo, aquí, los valores de las columnas en `content_columns` se unirán en una cadena separada por espacios, como `page_content` de los documentos cargados, y `metadata` de los documentos cargados solo contendrá pares clave-valor de las columnas especificadas en `metadata_columns`.

```python
loader = MySQLLoader(
    engine=engine,
    table_name=TABLE_NAME,
    content_columns=[
        "variety",
        "quantity_in_stock",
        "price_per_unit",
        "organic",
    ],
    metadata_columns=["fruit_id", "fruit_name"],
)
loader.load()
```

### Guardar documento con contenido de página y metadatos personalizados

Para guardar un documento de langchain en una tabla con campos de metadatos personalizados, primero debemos crear dicha tabla a través de `MySQLEngine.init_document_table()` y especificar la lista de `metadata_columns` que queremos que tenga. En este ejemplo, la tabla creada tendrá las siguientes columnas:

- description (tipo: text): para almacenar la descripción de la fruta.
- fruit_name (tipo text): para almacenar el nombre de la fruta.
- organic (tipo tinyint(1)): para indicar si la fruta es orgánica.
- other_metadata (tipo: JSON): para almacenar otra información de metadatos de la fruta.

Podemos usar los siguientes parámetros con `MySQLEngine.init_document_table()` para crear la tabla:

1. `table_name`: El nombre de la tabla dentro de la base de datos de Cloud SQL para almacenar documentos de langchain.
2. `metadata_columns`: Una lista de `sqlalchemy.Column` que indica la lista de columnas de metadatos que necesitamos.
3. `content_column`: El nombre de la columna para almacenar el `page_content` del documento de langchain. Predeterminado: `page_content`.
4. `metadata_json_column`: El nombre de la columna JSON para almacenar los metadatos adicionales del documento de langchain. Predeterminado: `langchain_metadata`.

```python
engine.init_document_table(
    TABLE_NAME,
    metadata_columns=[
        sqlalchemy.Column(
            "fruit_name",
            sqlalchemy.UnicodeText,
            primary_key=False,
            nullable=True,
        ),
        sqlalchemy.Column(
            "organic",
            sqlalchemy.Boolean,
            primary_key=False,
            nullable=True,
        ),
    ],
    content_column="description",
    metadata_json_column="other_metadata",
    overwrite_existing=True,
)
```

Guarde documentos con `MySQLDocumentSaver.add_documents(<documents>)`. Como se puede ver en este ejemplo:

- `document.page_content` se guardará en la columna `description`.
- `document.metadata.fruit_name` se guardará en la columna `fruit_name`.
- `document.metadata.organic` se guardará en la columna `organic`.
- `document.metadata.fruit_id` se guardará en la columna `other_metadata` en formato JSON.

```python
test_docs = [
    Document(
        page_content="Granny Smith 150 0.99",
        metadata={"fruit_id": 1, "fruit_name": "Apple", "organic": 1},
    ),
]
saver = MySQLDocumentSaver(
    engine=engine,
    table_name=TABLE_NAME,
    content_column="description",
    metadata_json_column="other_metadata",
)
saver.add_documents(test_docs)
```

```python
with engine.connect() as conn:
    result = conn.execute(sqlalchemy.text(f"select * from `{TABLE_NAME}`;"))
    print(result.keys())
    print(result.fetchall())
```

### Eliminar documentos con contenido de página y metadatos personalizados

También podemos eliminar documentos de la tabla con columnas de metadatos personalizadas a través de `MySQLDocumentSaver.delete(<documents>)`. El criterio de eliminación es:

Se debe eliminar una `fila` si existe un `documento` en la lista, de modo que

- `document.page_content` es igual a `row[page_content]`
- Para cada campo de metadatos `k` en `document.metadata`
    - `document.metadata[k]` es igual a `row[k]` o `document.metadata[k]` es igual a `row[langchain_metadata][k]`
- No hay ningún campo de metadatos adicional presente en `row` pero no en `document.metadata`.

```python
loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(docs)
print("Documents after delete:", loader.load())
```
