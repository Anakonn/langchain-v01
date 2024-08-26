---
translated: true
---

# TiDB

> [TiDB Cloud](https://tidbcloud.com/), es una solución integral de Database-as-a-Service (DBaaS) que ofrece opciones dedicadas y sin servidor. TiDB Serverless ahora está integrando una búsqueda vectorial integrada en el panorama de MySQL. Con esta mejora, puede desarrollar aplicaciones de IA utilizando TiDB Serverless sin necesidad de una nueva base de datos o pilas técnicas adicionales. Sea de los primeros en experimentarlo uniéndose a la lista de espera para la versión beta privada en https://tidb.cloud/ai.

Este cuaderno presenta cómo usar `TiDBLoader` para cargar datos de TiDB en langchain.

## Requisitos previos

Antes de usar el `TiDBLoader`, instalaremos las siguientes dependencias:

```python
%pip install --upgrade --quiet langchain
```

Luego, configuraremos la conexión a un TiDB. En este cuaderno, seguiremos el método de conexión estándar proporcionado por TiDB Cloud para establecer una conexión de base de datos segura y eficiente.

```python
import getpass

# copy from tidb cloud console，replace it with your own
tidb_connection_string_template = "mysql+pymysql://<USER>:<PASSWORD>@<HOST>:4000/<DB>?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"
tidb_password = getpass.getpass("Input your TiDB password:")
tidb_connection_string = tidb_connection_string_template.replace(
    "<PASSWORD>", tidb_password
)
```

## Cargar datos de TiDB

Aquí hay un desglose de algunos argumentos clave que puede usar para personalizar el comportamiento del `TiDBLoader`:

- `query` (str): Esta es la consulta SQL que se ejecutará contra la base de datos TiDB. La consulta debe seleccionar los datos que desea cargar en sus objetos `Document`.
    Por ejemplo, es posible que use una consulta como `"SELECT * FROM my_table"` para obtener todos los datos de `my_table`.

- `page_content_columns` (Optional[List[str]]): Especifica la lista de nombres de columna cuyos valores deben incluirse en el `page_content` de cada objeto `Document`.
    Si se establece en `None` (el valor predeterminado), se incluyen todas las columnas devueltas por la consulta en `page_content`. Esto le permite adaptar el contenido de cada documento en función de columnas específicas de sus datos.

- `metadata_columns` (Optional[List[str]]): Especifica la lista de nombres de columna cuyos valores deben incluirse en los `metadata` de cada objeto `Document`.
    De forma predeterminada, esta lista está vacía, lo que significa que no se incluirá ningún metadato a menos que se especifique explícitamente. Esto es útil para incluir información adicional sobre cada documento que no forme parte del contenido principal, pero que sigue siendo valiosa para el procesamiento o el análisis.

```python
from sqlalchemy import Column, Integer, MetaData, String, Table, create_engine

# Connect to the database
engine = create_engine(tidb_connection_string)
metadata = MetaData()
table_name = "test_tidb_loader"

# Create a table
test_table = Table(
    table_name,
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(255)),
    Column("description", String(255)),
)
metadata.create_all(engine)


with engine.connect() as connection:
    transaction = connection.begin()
    try:
        connection.execute(
            test_table.insert(),
            [
                {"name": "Item 1", "description": "Description of Item 1"},
                {"name": "Item 2", "description": "Description of Item 2"},
                {"name": "Item 3", "description": "Description of Item 3"},
            ],
        )
        transaction.commit()
    except:
        transaction.rollback()
        raise
```

```python
from langchain_community.document_loaders import TiDBLoader

# Setup TiDBLoader to retrieve data
loader = TiDBLoader(
    connection_string=tidb_connection_string,
    query=f"SELECT * FROM {table_name};",
    page_content_columns=["name", "description"],
    metadata_columns=["id"],
)

# Load data
documents = loader.load()

# Display the loaded documents
for doc in documents:
    print("-" * 30)
    print(f"content: {doc.page_content}\nmetada: {doc.metadata}")
```

```output
------------------------------
content: name: Item 1
description: Description of Item 1
metada: {'id': 1}
------------------------------
content: name: Item 2
description: Description of Item 2
metada: {'id': 2}
------------------------------
content: name: Item 3
description: Description of Item 3
metada: {'id': 3}
```

```python
test_table.drop(bind=engine)
```
