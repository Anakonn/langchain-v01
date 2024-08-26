---
translated: true
---

# Búsqueda de vectores de IA de Oracle: Procesamiento de documentos

La Búsqueda de vectores de IA de Oracle está diseñada para cargas de trabajo de Inteligencia Artificial (IA) que le permiten consultar datos en función de la semántica, en lugar de palabras clave. Uno de los mayores beneficios de la Búsqueda de vectores de IA de Oracle es que la búsqueda semántica en datos no estructurados se puede combinar con la búsqueda relacional en datos empresariales en un solo sistema. Esto no solo es poderoso, sino también significativamente más efectivo porque no necesita agregar una base de datos de vectores especializada, eliminando el dolor de la fragmentación de datos entre múltiples sistemas.

La guía demuestra cómo usar las Capacidades de Procesamiento de Documentos dentro de la Búsqueda de vectores de IA de Oracle para cargar y dividir documentos usando OracleDocLoader y OracleTextSplitter respectivamente.

### Requisitos previos

Instale el controlador del cliente de Python de Oracle para usar Langchain con la Búsqueda de vectores de IA de Oracle.

```python
# pip install oracledb
```

### Conectarse a la base de datos de Oracle

El siguiente código de muestra mostrará cómo conectarse a la base de datos de Oracle.

```python
import sys

import oracledb

# please update with your username, password, hostname and service_name
username = "<username>"
password = "<password>"
dsn = "<hostname>/<service_name>"

try:
    conn = oracledb.connect(user=username, password=password, dsn=dsn)
    print("Connection successful!")
except Exception as e:
    print("Connection failed!")
    sys.exit(1)
```

Ahora creemos una tabla e insertemos algunos documentos de muestra para probar.

```python
try:
    cursor = conn.cursor()

    drop_table_sql = """drop table if exists demo_tab"""
    cursor.execute(drop_table_sql)

    create_table_sql = """create table demo_tab (id number, data clob)"""
    cursor.execute(create_table_sql)

    insert_row_sql = """insert into demo_tab values (:1, :2)"""
    rows_to_insert = [
        (
            1,
            "If the answer to any preceding questions is yes, then the database stops the search and allocates space from the specified tablespace; otherwise, space is allocated from the database default shared temporary tablespace.",
        ),
        (
            2,
            "A tablespace can be online (accessible) or offline (not accessible) whenever the database is open.\nA tablespace is usually online so that its data is available to users. The SYSTEM tablespace and temporary tablespaces cannot be taken offline.",
        ),
        (
            3,
            "The database stores LOBs differently from other data types. Creating a LOB column implicitly creates a LOB segment and a LOB index. The tablespace containing the LOB segment and LOB index, which are always stored together, may be different from the tablespace containing the table.\nSometimes the database can store small amounts of LOB data in the table itself rather than in a separate LOB segment.",
        ),
    ]
    cursor.executemany(insert_row_sql, rows_to_insert)

    conn.commit()

    print("Table created and populated.")
    cursor.close()
except Exception as e:
    print("Table creation failed.")
    cursor.close()
    conn.close()
    sys.exit(1)
```

### Cargar documentos

Los usuarios pueden cargar los documentos desde la base de datos de Oracle o un sistema de archivos, o ambos. Solo necesitan establecer los parámetros del cargador en consecuencia. Consulte el libro de guía de la Búsqueda de vectores de IA de Oracle para obtener información completa sobre estos parámetros.

El principal beneficio de usar OracleDocLoader es que puede manejar más de 150 formatos de archivo diferentes. No necesita usar diferentes tipos de cargador para diferentes formatos de archivo. Aquí está la lista de los formatos que admitimos: [Formatos de documentos compatibles con Oracle Text](https://docs.oracle.com/en/database/oracle/oracle-database/23/ccref/oracle-text-supported-document-formats.html)

El siguiente código de muestra mostrará cómo hacer eso:

```python
from langchain_community.document_loaders.oracleai import OracleDocLoader
from langchain_core.documents import Document

"""
# loading a local file
loader_params = {}
loader_params["file"] = "<file>"

# loading from a local directory
loader_params = {}
loader_params["dir"] = "<directory>"
"""

# loading from Oracle Database table
loader_params = {
    "owner": "<owner>",
    "tablename": "demo_tab",
    "colname": "data",
}

""" load the docs """
loader = OracleDocLoader(conn=conn, params=loader_params)
docs = loader.load()

""" verify """
print(f"Number of docs loaded: {len(docs)}")
# print(f"Document-0: {docs[0].page_content}") # content
```

### Dividir documentos

Los documentos pueden tener diferentes tamaños: pequeños, medianos, grandes o muy grandes. A los usuarios les gusta dividir/dividir sus documentos en piezas más pequeñas para generar incrustaciones. Hay muchas personalizaciones de división diferentes que los usuarios pueden hacer. Consulte el libro de guía de la Búsqueda de vectores de IA de Oracle para obtener información completa sobre estos parámetros.

El siguiente código de muestra mostrará cómo hacer eso:

```python
from langchain_community.document_loaders.oracleai import OracleTextSplitter
from langchain_core.documents import Document

"""
# Some examples
# split by chars, max 500 chars
splitter_params = {"split": "chars", "max": 500, "normalize": "all"}

# split by words, max 100 words
splitter_params = {"split": "words", "max": 100, "normalize": "all"}

# split by sentence, max 20 sentences
splitter_params = {"split": "sentence", "max": 20, "normalize": "all"}
"""

# split by default parameters
splitter_params = {"normalize": "all"}

# get the splitter instance
splitter = OracleTextSplitter(conn=conn, params=splitter_params)

list_chunks = []
for doc in docs:
    chunks = splitter.split_text(doc.page_content)
    list_chunks.extend(chunks)

""" verify """
print(f"Number of Chunks: {len(list_chunks)}")
# print(f"Chunk-0: {list_chunks[0]}") # content
```

### Demostración de principio a fin

Consulte nuestra guía de demostración completa [Guía de demostración de extremo a extremo de la Búsqueda de vectores de IA de Oracle](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.md) para construir una canalización RAG de extremo a extremo con la ayuda de la Búsqueda de vectores de IA de Oracle.
