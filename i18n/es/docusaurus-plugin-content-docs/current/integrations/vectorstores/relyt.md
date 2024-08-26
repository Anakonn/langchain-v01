---
translated: true
---

# Relyt

>[Relyt](https://docs.relyt.cn/docs/vector-engine/use/) es un servicio de almacenamiento de datos en la nube diseñado para analizar grandes volúmenes de datos en línea.

>`Relyt` es compatible con la sintaxis ANSI SQL 2003 y los ecosistemas de bases de datos PostgreSQL y Oracle. Relyt también admite almacenamiento de filas y almacenamiento de columnas. Relyt procesa petabytes de datos sin conexión a un alto nivel de rendimiento y admite consultas en línea altamente concurrentes.

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos vectorial `Relyt`.
Para ejecutar, debe tener una instancia de [Relyt](https://docs.relyt.cn/) en ejecución:
- Usando [Relyt Vector Database](https://docs.relyt.cn/docs/vector-engine/use/). Haga clic aquí para implementarlo rápidamente.

```python
%pip install "pgvecto_rs[sdk]"
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import Relyt
from langchain_text_splitters import CharacterTextSplitter
```

Dividir documentos y obtener incrustaciones llamando a la API de la comunidad

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = FakeEmbeddings(size=1536)
```

Conéctese a Relyt estableciendo los ENTORNOS relacionados.

```bash
export PG_HOST={your_relyt_hostname}
export PG_PORT={your_relyt_port} # Optional, default is 5432
export PG_DATABASE={your_database} # Optional, default is postgres
export PG_USER={database_username}
export PG_PASSWORD={database_password}
```

Luego almacene sus incrustaciones y documentos en Relyt

```python
import os

connection_string = Relyt.connection_string_from_db_params(
    driver=os.environ.get("PG_DRIVER", "psycopg2cffi"),
    host=os.environ.get("PG_HOST", "localhost"),
    port=int(os.environ.get("PG_PORT", "5432")),
    database=os.environ.get("PG_DATABASE", "postgres"),
    user=os.environ.get("PG_USER", "postgres"),
    password=os.environ.get("PG_PASSWORD", "postgres"),
)

vector_db = Relyt.from_documents(
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
