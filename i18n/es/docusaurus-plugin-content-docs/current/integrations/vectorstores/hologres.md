---
translated: true
---

# Hologres

>[Hologres](https://www.alibabacloud.com/help/en/hologres/latest/introduction) es un servicio de almacenamiento de datos en tiempo real unificado desarrollado por Alibaba Cloud. Puede usar Hologres para escribir, actualizar, procesar y analizar grandes cantidades de datos en tiempo real.
>Hologres admite la sintaxis SQL estándar, es compatible con PostgreSQL y admite la mayoría de las funciones de PostgreSQL. Hologres admite el procesamiento analítico en línea (OLAP) y el análisis ad hoc de hasta petabytes de datos, y proporciona servicios de datos en línea de alta concurrencia y baja latencia.

>Hologres proporciona funcionalidad de **base de datos vectorial** al adoptar [Proxima](https://www.alibabacloud.com/help/en/hologres/latest/vector-processing).
>Proxima es una biblioteca de software de alto rendimiento desarrollada por Alibaba DAMO Academy. Le permite buscar los vecinos más cercanos de los vectores. Proxima proporciona una mayor estabilidad y rendimiento que el software de código abierto similar como Faiss. Proxima le permite buscar incrustaciones de texto o imagen similares con un alto rendimiento y baja latencia. Hologres está profundamente integrado con Proxima para proporcionar un servicio de búsqueda vectorial de alto rendimiento.

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos vectorial `Hologres Proxima`.
Haga clic [aquí](https://www.alibabacloud.com/zh/product/hologres) para implementar rápidamente una instancia de nube Hologres.

```python
%pip install --upgrade --quiet  hologres-vector
```

```python
from langchain_community.vectorstores import Hologres
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

Dividir documentos y obtener incrustaciones llamando a la API de OpenAI

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

Conectarse a Hologres estableciendo los ENTORNOS relacionados.

```bash
export PG_HOST={host}
export PG_PORT={port} # Optional, default is 80
export PG_DATABASE={db_name} # Optional, default is postgres
export PG_USER={username}
export PG_PASSWORD={password}
```

Luego almacene sus incrustaciones y documentos en Hologres

```python
import os

connection_string = Hologres.connection_string_from_db_params(
    host=os.environ.get("PGHOST", "localhost"),
    port=int(os.environ.get("PGPORT", "80")),
    database=os.environ.get("PGDATABASE", "postgres"),
    user=os.environ.get("PGUSER", "postgres"),
    password=os.environ.get("PGPASSWORD", "postgres"),
)

vector_db = Hologres.from_documents(
    docs,
    embeddings,
    connection_string=connection_string,
    table_name="langchain_example_embeddings",
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
