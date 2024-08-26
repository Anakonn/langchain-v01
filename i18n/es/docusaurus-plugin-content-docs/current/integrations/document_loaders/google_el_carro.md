---
translated: true
---

# Google El Carro para cargas de trabajo de Oracle

> Google [El Carro Oracle Operator](https://github.com/GoogleCloudPlatform/elcarro-oracle-operator)
ofrece una forma de ejecutar bases de datos de Oracle en Kubernetes como un sistema de orquestación de contenedores portátil, de código abierto, impulsado por la comunidad y sin bloqueo de proveedores. El Carro
proporciona una poderosa API declarativa para una configuración y implementación completas y coherentes, así como para operaciones y monitoreo en tiempo real.
Extiende las capacidades de tu base de datos de Oracle para construir experiencias impulsadas por IA
aprovechando la integración de El Carro Langchain.

Esta guía explica cómo usar la integración de El Carro Langchain para
[guardar, cargar y eliminar documentos de langchain](/docs/modules/data_connection/document_loaders/)
con `ElCarroLoader` y `ElCarroDocumentSaver`. Esta integración funciona para cualquier base de datos de Oracle, independientemente de dónde se esté ejecutando.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-el-carro-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-el-carro-python/blob/main/docs/document_loader.ipynb)

## Antes de comenzar

Por favor, completa
la sección [Primeros pasos](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/README.md#getting-started)
del
README para configurar tu base de datos de Oracle de El Carro.

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-el-carro`, por lo que
necesitamos instalarlo.

```python
%pip install --upgrade --quiet langchain-google-el-carro
```

## Uso básico

### Configurar la conexión a la base de datos de Oracle

Completa la siguiente variable con los detalles de conexión de tu base de datos de Oracle.

```python
# @title Set Your Values Here { display-mode: "form" }
HOST = "127.0.0.1"  # @param {type: "string"}
PORT = 3307  # @param {type: "integer"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
USER = "my-user"  # @param {type: "string"}
PASSWORD = input("Please provide a password to be used for the database user: ")
```

Si estás usando El Carro, puedes encontrar los valores de host y puerto en el
estado de la instancia de Kubernetes de El Carro.
Usa la contraseña de usuario que creaste para tu PDB.

Ejemplo de salida:

```output
kubectl get -w instances.oracle.db.anthosapis.com -n db
NAME   DB ENGINE   VERSION   EDITION      ENDPOINT      URL                DB NAMES   BACKUP ID   READYSTATUS   READYREASON        DBREADYSTATUS   DBREADYREASON

mydb   Oracle      18c       Express      mydb-svc.db   34.71.69.25:6021   ['pdbname']            TRUE          CreateComplete     True            CreateComplete
```

### Pool de conexiones de ElCarroEngine

`ElCarroEngine` configura un pool de conexiones a tu base de datos de Oracle, lo que permite conexiones exitosas desde tu aplicación y siguiendo las mejores prácticas de la industria.

```python
from langchain_google_el_carro import ElCarroEngine

elcarro_engine = ElCarroEngine.from_instance(
    db_host=HOST,
    db_port=PORT,
    db_name=DATABASE,
    db_user=USER,
    db_password=PASSWORD,
)
```

### Inicializar una tabla

Inicializa una tabla del esquema predeterminado
a través de `elcarro_engine.init_document_table(<table_name>)`. Columnas de la tabla:

- page_content (tipo: text)
- langchain_metadata (tipo: JSON)

```python
elcarro_engine.drop_document_table(TABLE_NAME)
elcarro_engine.init_document_table(
    table_name=TABLE_NAME,
)
```

### Guardar documentos

Guarda documentos de langchain con `ElCarroDocumentSaver.add_documents(<documents>)`.
Para inicializar la clase `ElCarroDocumentSaver` necesitas proporcionar 2 cosas:

1. `elcarro_engine` - Una instancia de un motor `ElCarroEngine`.
2. `table_name` - El nombre de la tabla dentro de la base de datos de Oracle para almacenar
   documentos de langchain.

```python
from langchain_core.documents import Document
from langchain_google_el_carro import ElCarroDocumentSaver

doc = Document(
    page_content="Banana",
    metadata={"type": "fruit", "weight": 100, "organic": 1},
)

saver = ElCarroDocumentSaver(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
)
saver.add_documents([doc])
```

### Cargar documentos

Carga documentos de langchain con `ElCarroLoader.load()`
o `ElCarroLoader.lazy_load()`.
`lazy_load` devuelve un generador que solo consulta la base de datos durante la iteración.
Para inicializar la clase `ElCarroLoader` necesitas proporcionar:

1. `elcarro_engine` - Una instancia de un motor `ElCarroEngine`.
2. `table_name` - El nombre de la tabla dentro de la base de datos de Oracle para almacenar
   documentos de langchain.

```python
from langchain_google_el_carro import ElCarroLoader

loader = ElCarroLoader(elcarro_engine=elcarro_engine, table_name=TABLE_NAME)
docs = loader.lazy_load()
for doc in docs:
    print("Loaded documents:", doc)
```

### Cargar documentos a través de una consulta

Además de cargar documentos desde una tabla, también podemos elegir cargar documentos
desde una vista generada a partir de una consulta SQL. Por ejemplo:

```python
from langchain_google_el_carro import ElCarroLoader

loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    query=f"SELECT * FROM {TABLE_NAME} WHERE json_value(langchain_metadata, '$.organic') = '1'",
)
onedoc = loader.load()
print(onedoc)
```

La vista generada a partir de la consulta SQL puede tener un esquema diferente al de la tabla predeterminada.
En tales casos, el comportamiento de ElCarroLoader es el mismo que al cargar desde una tabla
con un esquema no predeterminado. Consulta la
sección [Cargar documentos con contenido de página de documento y metadatos personalizados](#cargar-documentos-con-contenido-de-página-de-documento-y-metadatos-personalizados).

### Eliminar documentos

Elimina una lista de documentos de langchain de una tabla de Oracle
con `ElCarroDocumentSaver.delete(<documents>)`.

Para una tabla con un esquema predeterminado (page_content, langchain_metadata), los
criterios de eliminación son:

Se debe eliminar una `fila` si existe un `documento` en la lista, tal que

- `document.page_content` es igual a `row[page_content]`
- `document.metadata` es igual a `row[langchain_metadata]`

```python
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(onedoc)
print("Documents after delete:", loader.load())
```

## Uso avanzado

### Cargar documentos con contenido de página de documento y metadatos personalizados

Primero preparamos una tabla de ejemplo con un esquema no predeterminado y la poblamos con
algunos datos arbitrarios.

```python
import sqlalchemy

create_table_query = f"""CREATE TABLE {TABLE_NAME} (
    fruit_id NUMBER GENERATED BY DEFAULT AS IDENTITY (START WITH 1),
    fruit_name VARCHAR2(100) NOT NULL,
    variety VARCHAR2(50),
    quantity_in_stock NUMBER(10) NOT NULL,
    price_per_unit NUMBER(6,2) NOT NULL,
    organic NUMBER(3) NOT NULL
)"""
elcarro_engine.drop_document_table(TABLE_NAME)

with elcarro_engine.connect() as conn:
    conn.execute(sqlalchemy.text(create_table_query))
    conn.commit()
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Apple', 'Granny Smith', 150, 0.99, 1)
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Banana', 'Cavendish', 200, 0.59, 0)
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Orange', 'Navel', 80, 1.29, 1)
            """
        )
    )
    conn.commit()
```

Si aún cargamos documentos de langchain con los parámetros predeterminados de `ElCarroLoader`
desde esta tabla de ejemplo, el `page_content` de los documentos cargados será la
primera columna de la tabla, y `metadata` consistirá en pares clave-valor de
todas las demás columnas.

```python
loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
)
loaded_docs = loader.load()
print(f"Loaded Documents: [{loaded_docs}]")
```

Podemos especificar el contenido y los metadatos que queremos cargar estableciendo
`content_columns` y `metadata_columns` al inicializar
el `ElCarroLoader`.

1. `content_columns`: Las columnas para escribir en el `page_content` del
   documento.
2. `metadata_columns`: Las columnas para escribir en los `metadata` del documento.

Por ejemplo, aquí, los valores de las columnas en `content_columns` se unirán
juntos en una cadena separada por espacios, como `page_content` de los documentos cargados,
y `metadata` de los documentos cargados solo contendrá pares clave-valor de las columnas
especificadas en `metadata_columns`.

```python
loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_columns=[
        "variety",
        "quantity_in_stock",
        "price_per_unit",
        "organic",
    ],
    metadata_columns=["fruit_id", "fruit_name"],
)
loaded_docs = loader.load()
print(f"Loaded Documents: [{loaded_docs}]")
```

### Guardar documento con contenido de página y metadatos personalizados

Para guardar un documento de langchain en una tabla con campos de metadatos personalizados, primero debemos crear dicha tabla mediante `ElCarroEngine.init_document_table()` y especificar la lista de `metadata_columns` que queremos que tenga. En este ejemplo, la tabla creada tendrá las siguientes columnas:

- content (tipo: text): para almacenar la descripción de la fruta.
- type (tipo VARCHAR2(200)): para almacenar el tipo de fruta.
- weight (tipo INT): para almacenar el peso de la fruta.
- extra_json_metadata (tipo: JSON): para almacenar otra información de metadatos de la fruta.

Podemos usar los siguientes parámetros con `elcarro_engine.init_document_table()` para crear la tabla:

1. `table_name`: El nombre de la tabla dentro de la base de datos de Oracle para almacenar los documentos de langchain.
2. `metadata_columns`: Una lista de `sqlalchemy.Column` que indica la lista de columnas de metadatos que necesitamos.
3. `content_column`: nombre de la columna para almacenar `page_content` del documento de langchain. Predeterminado: `"page_content", "VARCHAR2(4000)"`.
4. `metadata_json_column`: nombre de la columna para almacenar los `metadata` JSON adicionales del documento de langchain. Predeterminado: `"langchain_metadata", "VARCHAR2(4000)"`.

```python
elcarro_engine.drop_document_table(TABLE_NAME)
elcarro_engine.init_document_table(
    table_name=TABLE_NAME,
    metadata_columns=[
        sqlalchemy.Column("type", sqlalchemy.dialects.oracle.VARCHAR2(200)),
        sqlalchemy.Column("weight", sqlalchemy.INT),
    ],
    content_column="content",
    metadata_json_column="extra_json_metadata",
)
```

Guarda los documentos con `ElCarroDocumentSaver.add_documents(<documents>)`. Como se puede ver en este ejemplo:

- `document.page_content` se guardará en la columna `content`.
- `document.metadata.type` se guardará en la columna `type`.
- `document.metadata.weight` se guardará en la columna `weight`.
- `document.metadata.organic` se guardará en la columna `extra_json_metadata` en formato JSON.

```python
doc = Document(
    page_content="Banana",
    metadata={"type": "fruit", "weight": 100, "organic": 1},
)

print(f"Original Document: [{doc}]")

saver = ElCarroDocumentSaver(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_column="content",
    metadata_json_column="extra_json_metadata",
)
saver.add_documents([doc])

loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_columns=["content"],
    metadata_columns=[
        "type",
        "weight",
    ],
    metadata_json_column="extra_json_metadata",
)

loaded_docs = loader.load()
print(f"Loaded Document: [{loaded_docs[0]}]")
```

### Eliminar documentos con contenido de página y metadatos personalizados

También podemos eliminar documentos de la tabla con columnas de metadatos personalizadas a través de `ElCarroDocumentSaver.delete(<documents>)`. El criterio de eliminación es:

Se debe eliminar una `fila` si existe un `documento` en la lista, de modo que:

- `document.page_content` es igual a `row[page_content]`
- Para cada campo de metadatos `k` en `document.metadata`
    - `document.metadata[k]` es igual a `row[k]` o `document.metadata[k]` es igual a `row[langchain_metadata][k]`
- No hay ningún campo de metadatos adicional presente en `row` pero no en `document.metadata`.

```python
loader = ElCarroLoader(elcarro_engine=elcarro_engine, table_name=TABLE_NAME)
saver.delete(loader.load())
print(f"Documents left: {len(loader.load())}")
```

## Más ejemplos

Por favor, consulta [demo_doc_loader_basic.py](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/samples/demo_doc_loader_basic.py) y [demo_doc_loader_advanced.py](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/samples/demo_doc_loader_advanced.py) para ver ejemplos de código completos.
