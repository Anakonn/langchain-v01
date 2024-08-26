---
translated: true
---

# Inserción de Postgres

> [Inserción de Postgres](https://github.com/neondatabase/pg_embedding) es una búsqueda de similitud de vectores de código abierto para `Postgres` que utiliza `Hierarchical Navigable Small Worlds (HNSW)` para la búsqueda de vecinos más cercanos aproximados.

>Soporta:
>- búsqueda de vecinos más cercanos exacta y aproximada usando HNSW
>- distancia L2

Este cuaderno muestra cómo usar la base de datos de vectores de Postgres (`PGEmbedding`).

> La integración de PGEmbedding crea la extensión pg_embedding para ti, pero ejecuta la siguiente consulta de Postgres para añadirla:

```sql
CREATE EXTENSION embedding;
```

```python
# Pip install necessary package
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  psycopg2-binary
%pip install --upgrade --quiet  tiktoken
```

Añade la clave API de OpenAI a las variables de entorno para usar `OpenAIEmbeddings`.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
## Loading Environment Variables
from typing import List, Tuple
```

```python
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import PGEmbedding
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
os.environ["DATABASE_URL"] = getpass.getpass("Database Url:")
```

```output
Database Url:········
```

```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
connection_string = os.environ.get("DATABASE_URL")
collection_name = "state_of_the_union"
```

```python
db = PGEmbedding.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=collection_name,
    connection_string=connection_string,
)

query = "What did the president say about Ketanji Brown Jackson"
docs_with_score: List[Tuple[Document, float]] = db.similarity_search_with_score(query)
```

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

## Trabajando con vectorstore en Postgres

### Subiendo un vectorstore en PG

```python
db = PGEmbedding.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=collection_name,
    connection_string=connection_string,
    pre_delete_collection=False,
)
```

### Crear índice HNSW

Por defecto, la extensión realiza una búsqueda de escaneo secuencial, con un 100% de recall. Podrías considerar crear un índice HNSW para la búsqueda de vecinos más cercanos aproximados (ANN) para acelerar el tiempo de ejecución de `similarity_search_with_score`. Para crear el índice HNSW en tu columna de vectores, utiliza una función `create_hnsw_index`:

```python
PGEmbedding.create_hnsw_index(
    max_elements=10000, dims=1536, m=8, ef_construction=16, ef_search=16
)
```

La función anterior es equivalente a ejecutar la siguiente consulta SQL:

```sql
CREATE INDEX ON vectors USING hnsw(vec) WITH (maxelements=10000, dims=1536, m=3, efconstruction=16, efsearch=16);
```

Las opciones del índice HNSW utilizadas en la declaración anterior incluyen:

- maxelements: Define el número máximo de elementos indexados. Este es un parámetro requerido. El ejemplo mostrado arriba tiene un valor de 3. Un ejemplo del mundo real tendría un valor mucho mayor, como 1000000. Un "elemento" se refiere a un punto de datos (un vector) en el conjunto de datos, que se representa como un nodo en el gráfico HNSW. Típicamente, establecerías esta opción a un valor capaz de acomodar el número de filas en tu conjunto de datos.
- dims: Define el número de dimensiones en tus datos vectoriales. Este es un parámetro requerido. Un valor pequeño se usa en el ejemplo anterior. Si estás almacenando datos generados usando el modelo text-embedding-ada-002 de OpenAI, que soporta 1536 dimensiones, definirías un valor de 1536, por ejemplo.
- m: Define el número máximo de enlaces bidireccionales (también referidos como "aristas") creados para cada nodo durante la construcción del gráfico.
Las siguientes opciones adicionales de índice son soportadas:

- efConstruction: Define el número de vecinos más cercanos considerados durante la construcción del índice. El valor por defecto es 32.
- efsearch: Define el número de vecinos más cercanos considerados durante la búsqueda del índice. El valor por defecto es 32.
Para obtener información sobre cómo puedes configurar estas opciones para influir en el algoritmo HNSW, consulta [Ajuste del algoritmo HNSW](https://neon.tech/docs/extensions/pg_embedding#tuning-the-hnsw-algorithm).

### Recuperando un vectorstore en PG

```python
store = PGEmbedding(
    connection_string=connection_string,
    embedding_function=embeddings,
    collection_name=collection_name,
)

retriever = store.as_retriever()
```

```python
retriever
```

```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.pghnsw.HNSWVectoreStore object at 0x121d3c8b0>, search_type='similarity', search_kwargs={})
```

```python
db1 = PGEmbedding.from_existing_index(
    embedding=embeddings,
    collection_name=collection_name,
    pre_delete_collection=False,
    connection_string=connection_string,
)

query = "What did the president say about Ketanji Brown Jackson"
docs_with_score: List[Tuple[Document, float]] = db1.similarity_search_with_score(query)
```

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```
