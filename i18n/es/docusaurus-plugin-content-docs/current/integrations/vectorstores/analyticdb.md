---
translated: true
---

# AnalyticDB

>[AnalyticDB for PostgreSQL](https://www.alibabacloud.com/help/en/analyticdb-for-postgresql/latest/product-introduction-overview) es un servicio de almacenamiento de datos de procesamiento masivo en paralelo (MPP) que está diseñado para analizar grandes volúmenes de datos en línea.

>`AnalyticDB for PostgreSQL` se desarrolla basado en el proyecto de código abierto `Greenplum Database` y se mejora con extensiones en profundidad por `Alibaba Cloud`. AnalyticDB for PostgreSQL es compatible con la sintaxis ANSI SQL 2003 y los ecosistemas de las bases de datos PostgreSQL y Oracle. AnalyticDB for PostgreSQL también soporta almacenamiento en filas y almacenamiento en columnas. AnalyticDB for PostgreSQL procesa petabytes de datos fuera de línea a un alto nivel de rendimiento y soporta consultas en línea altamente concurrentes.

Este cuaderno muestra cómo usar funcionalidad relacionada con la base de datos vectorial `AnalyticDB`.
Para ejecutarlo, debe tener una instancia de [AnalyticDB](https://www.alibabacloud.com/help/en/analyticdb-for-postgresql/latest/product-introduction-overview) en funcionamiento:
- Usando [AnalyticDB Cloud Vector Database](https://www.alibabacloud.com/product/hybriddb-postgresql). Haga clic aquí para implementarlo rápidamente.

```python
from langchain_community.vectorstores import AnalyticDB
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

Divida documentos y obtenga embeddings llamando a la API de OpenAI

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

Conéctese a AnalyticDB configurando los AMBIENTES relacionados.

```bash
export PG_HOST={your_analyticdb_hostname}
export PG_PORT={your_analyticdb_port} # Optional, default is 5432
export PG_DATABASE={your_database} # Optional, default is postgres
export PG_USER={database_username}
export PG_PASSWORD={database_password}
```

Luego almacene sus embeddings y documentos en AnalyticDB

```python
import os

connection_string = AnalyticDB.connection_string_from_db_params(
    driver=os.environ.get("PG_DRIVER", "psycopg2cffi"),
    host=os.environ.get("PG_HOST", "localhost"),
    port=int(os.environ.get("PG_PORT", "5432")),
    database=os.environ.get("PG_DATABASE", "postgres"),
    user=os.environ.get("PG_USER", "postgres"),
    password=os.environ.get("PG_PASSWORD", "postgres"),
)

vector_db = AnalyticDB.from_documents(
    docs,
    embeddings,
    connection_string=connection_string,
)
```

Consultar y recuperar datos

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
