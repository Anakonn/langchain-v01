---
translated: true
---

# Google Cloud SQL para SQL Server

> [Cloud SQL](https://cloud.google.com/sql) es un servicio de base de datos relacional totalmente administrado que ofrece alto rendimiento, integración sin problemas y una impresionante escalabilidad. Ofrece motores de base de datos [MySQL](https://cloud.google.com/sql/mysql), [PostgreSQL](https://cloud.google.com/sql/postgres) y [SQL Server](https://cloud.google.com/sql/sqlserver). Extienda su aplicación de base de datos para construir experiencias impulsadas por IA aprovechando las integraciones de Langchain de Cloud SQL.

Este cuaderno analiza cómo usar [Cloud SQL para SQL Server](https://cloud.google.com/sql/sqlserver) para [guardar, cargar y eliminar documentos de Langchain](/docs/modules/data_connection/document_loaders/) con `MSSQLLoader` y `MSSQLDocumentSaver`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mssql-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mssql-python/blob/main/docs/document_loader.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

* [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Habilitar la API de administración de Cloud SQL.](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
* [Crear una instancia de Cloud SQL para SQL Server](https://cloud.google.com/sql/docs/sqlserver/create-instance)
* [Crear una base de datos de Cloud SQL](https://cloud.google.com/sql/docs/sqlserver/create-manage-databases)
* [Agregar un usuario de base de datos IAM a la base de datos](https://cloud.google.com/sql/docs/sqlserver/create-manage-users) (Opcional)

Después de confirmar el acceso a la base de datos en el entorno de ejecución de este cuaderno, complete los siguientes valores y ejecute la celda antes de ejecutar los scripts de ejemplo.

```python
# @markdown Please fill in the both the Google Cloud region and name of your Cloud SQL instance.
REGION = "us-central1"  # @param {type:"string"}
INSTANCE = "test-instance"  # @param {type:"string"}

# @markdown Please fill in user name and password of your Cloud SQL instance.
DB_USER = "sqlserver"  # @param {type:"string"}
DB_PASS = "password"  # @param {type:"string"}

# @markdown Please specify a database and a table for demo purpose.
DATABASE = "test"  # @param {type:"string"}
TABLE_NAME = "test-default"  # @param {type:"string"}
```

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-cloud-sql-mssql`, por lo que debemos instalarlo.

```python
%pip install --upgrade --quiet langchain-google-cloud-sql-mssql
```

**Colab solo**: Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench puedes reiniciar el terminal usando el botón de arriba.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 Autenticación

Autentíquese en Google Cloud como el usuario IAM que inició sesión en este cuaderno para acceder a su proyecto de Google Cloud.

- Si está usando Colab para ejecutar este cuaderno, use la celda a continuación y continúe.
- Si está usando Vertex AI Workbench, consulte las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

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

### 💡 Habilitación de la API

El paquete `langchain-google-cloud-sql-mssql` requiere que [habilite la API de administración de Cloud SQL](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com) en su proyecto de Google Cloud.

```python
# enable Cloud SQL Admin API
!gcloud services enable sqladmin.googleapis.com
```

## Uso básico

### Pool de conexiones de MSSQLEngine

Antes de guardar o cargar documentos desde la tabla MSSQL, primero debemos configurar un pool de conexiones a la base de datos de Cloud SQL. El `MSSQLEngine` configura un [pool de conexiones SQLAlchemy](https://docs.sqlalchemy.org/en/20/core/pooling.html#module-sqlalchemy.pool) a su base de datos de Cloud SQL, lo que permite conexiones exitosas desde su aplicación y sigue las mejores prácticas de la industria.

Para crear un `MSSQLEngine` usando `MSSQLEngine.from_instance()`, necesita proporcionar solo 4 cosas:

1. `project_id`: ID del proyecto de Google Cloud donde se encuentra la instancia de Cloud SQL.
1. `region`: Región donde se encuentra la instancia de Cloud SQL.
1. `instance`: El nombre de la instancia de Cloud SQL.
1. `database`: El nombre de la base de datos a la que conectarse en la instancia de Cloud SQL.
1. `user`: Usuario de base de datos a usar para la autenticación y el inicio de sesión de la base de datos integrada.
1. `password`: Contraseña de base de datos a usar para la autenticación y el inicio de sesión de la base de datos integrada.

```python
from langchain_google_cloud_sql_mssql import MSSQLEngine

engine = MSSQLEngine.from_instance(
    project_id=PROJECT_ID,
    region=REGION,
    instance=INSTANCE,
    database=DATABASE,
    user=DB_USER,
    password=DB_PASS,
)
```

### Inicializar una tabla

Inicialice una tabla de esquema predeterminado a través de `MSSQLEngine.init_document_table(<table_name>)`. Columnas de tabla:

- page_content (tipo: texto)
- langchain_metadata (tipo: JSON)

La bandera `overwrite_existing=True` significa que la tabla recién inicializada reemplazará cualquier tabla existente del mismo nombre.

```python
engine.init_document_table(TABLE_NAME, overwrite_existing=True)
```

### Guardar documentos

Guarde documentos de Langchain con `MSSQLDocumentSaver.add_documents(<documents>)`. Para inicializar la clase `MSSQLDocumentSaver`, necesita proporcionar 2 cosas:

1. `engine` - Una instancia de un motor `MSSQLEngine`.
2. `table_name` - El nombre de la tabla dentro de la base de datos de Cloud SQL para almacenar documentos de Langchain.

```python
from langchain_core.documents import Document
from langchain_google_cloud_sql_mssql import MSSQLDocumentSaver

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
saver = MSSQLDocumentSaver(engine=engine, table_name=TABLE_NAME)
saver.add_documents(test_docs)
```

### Cargar documentos

Cargue documentos de Langchain con `MSSQLLoader.load()` o `MSSQLLoader.lazy_load()`. `lazy_load` devuelve un generador que solo consulta la base de datos durante la iteración. Para inicializar la clase `MSSQLDocumentSaver`, necesita proporcionar:

1. `engine` - Una instancia de un motor `MSSQLEngine`.
2. `table_name` - El nombre de la tabla dentro de la base de datos de Cloud SQL para almacenar documentos de Langchain.

```python
from langchain_google_cloud_sql_mssql import MSSQLLoader

loader = MSSQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.lazy_load()
for doc in docs:
    print("Loaded documents:", doc)
```

### Cargar documentos a través de consulta

Además de cargar documentos desde una tabla, también podemos optar por cargar documentos desde una vista generada a partir de una consulta SQL. Por ejemplo:

```python
from langchain_google_cloud_sql_mssql import MSSQLLoader

loader = MSSQLLoader(
    engine=engine,
    query=f"select * from \"{TABLE_NAME}\" where JSON_VALUE(langchain_metadata, '$.fruit_id') = 1;",
)
onedoc = loader.load()
onedoc
```

La vista generada a partir de la consulta SQL puede tener un esquema diferente al de la tabla predeterminada. En tales casos, el comportamiento de MSSQLLoader es el mismo que al cargar desde una tabla con un esquema no predeterminado. Consulte la sección [Cargar documentos con contenido de página de documento y metadatos personalizados](#Cargar-documentos-con-contenido-de-página-de-documento-y-metadatos-personalizados).

### Eliminar documentos

Elimina una lista de documentos de langchain de la tabla MSSQL con `MSSQLDocumentSaver.delete(<documents>)`.

Para la tabla con esquema predeterminado (page_content, langchain_metadata), el criterio de eliminación es:

Se debe eliminar una `fila` si existe un `documento` en la lista, de modo que

- `document.page_content` es igual a `row[page_content]`
- `document.metadata` es igual a `row[langchain_metadata]`

```python
from langchain_google_cloud_sql_mssql import MSSQLLoader

loader = MSSQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(onedoc)
print("Documents after delete:", loader.load())
```

## Uso avanzado

### Cargar documentos con contenido de página y metadatos personalizados

Primero preparamos una tabla de ejemplo con un esquema no predeterminado y la poblamos con algunos datos arbitrarios.

```python
import sqlalchemy

with engine.connect() as conn:
    conn.execute(sqlalchemy.text(f'DROP TABLE IF EXISTS "{TABLE_NAME}"'))
    conn.commit()
    conn.execute(
        sqlalchemy.text(
            f"""
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[{TABLE_NAME}]') AND type in (N'U'))
                BEGIN
                    CREATE TABLE [dbo].[{TABLE_NAME}](
                        fruit_id INT IDENTITY(1,1) PRIMARY KEY,
                        fruit_name VARCHAR(100) NOT NULL,
                        variety VARCHAR(50),
                        quantity_in_stock INT NOT NULL,
                        price_per_unit DECIMAL(6,2) NOT NULL,
                        organic BIT NOT NULL
                    )
                END
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO "{TABLE_NAME}" (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES
                ('Apple', 'Granny Smith', 150, 0.99, 1),
                ('Banana', 'Cavendish', 200, 0.59, 0),
                ('Orange', 'Navel', 80, 1.29, 1);
            """
        )
    )
    conn.commit()
```

Si aún cargamos documentos de langchain con los parámetros predeterminados de `MSSQLLoader` desde esta tabla de ejemplo, el `page_content` de los documentos cargados será la primera columna de la tabla y `metadata` consistirá en pares clave-valor de todas las demás columnas.

```python
loader = MSSQLLoader(
    engine=engine,
    table_name=TABLE_NAME,
)
loader.load()
```

Podemos especificar el contenido y los metadatos que queremos cargar estableciendo `content_columns` y `metadata_columns` al inicializar el `MSSQLLoader`.

1. `content_columns`: Las columnas para escribir en el `page_content` del documento.
2. `metadata_columns`: Las columnas para escribir en el `metadata` del documento.

Por ejemplo, aquí, los valores de las columnas en `content_columns` se unirán en una cadena separada por espacios, como `page_content` de los documentos cargados, y `metadata` de los documentos cargados solo contendrá pares clave-valor de las columnas especificadas en `metadata_columns`.

```python
loader = MSSQLLoader(
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

Para guardar el documento de langchain en una tabla con campos de metadatos personalizados, primero debemos crear dicha tabla a través de `MSSQLEngine.init_document_table()` y especificar la lista de `metadata_columns` que queremos que tenga. En este ejemplo, la tabla creada tendrá las siguientes columnas:

- description (tipo: text): para almacenar la descripción de la fruta.
- fruit_name (tipo text): para almacenar el nombre de la fruta.
- organic (tipo tinyint(1)): para indicar si la fruta es orgánica.
- other_metadata (tipo: JSON): para almacenar otra información de metadatos de la fruta.

Podemos usar los siguientes parámetros con `MSSQLEngine.init_document_table()` para crear la tabla:

1. `table_name`: El nombre de la tabla dentro de la base de datos de Cloud SQL para almacenar los documentos de langchain.
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

Guarda los documentos con `MSSQLDocumentSaver.add_documents(<documents>)`. Como se puede ver en este ejemplo:

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
saver = MSSQLDocumentSaver(
    engine=engine,
    table_name=TABLE_NAME,
    content_column="description",
    metadata_json_column="other_metadata",
)
saver.add_documents(test_docs)
```

```python
with engine.connect() as conn:
    result = conn.execute(sqlalchemy.text(f'select * from "{TABLE_NAME}";'))
    print(result.keys())
    print(result.fetchall())
```

### Eliminar documentos con contenido de página y metadatos personalizados

También podemos eliminar documentos de la tabla con columnas de metadatos personalizadas a través de `MSSQLDocumentSaver.delete(<documents>)`. El criterio de eliminación es:

Se debe eliminar una `fila` si existe un `documento` en la lista, de modo que

- `document.page_content` es igual a `row[page_content]`
- Para cada campo de metadatos `k` en `document.metadata`
    - `document.metadata[k]` es igual a `row[k]` o `document.metadata[k]` es igual a `row[langchain_metadata][k]`
- No hay ningún campo de metadatos adicional presente en `row` pero no en `document.metadata`.

```python
loader = MSSQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(docs)
print("Documents after delete:", loader.load())
```
