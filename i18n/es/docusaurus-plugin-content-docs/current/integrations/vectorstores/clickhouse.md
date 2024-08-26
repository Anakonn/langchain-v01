---
translated: true
---

# ClickHouse

> [ClickHouse](https://clickhouse.com/) es la base de datos de código abierto más rápida y eficiente en el uso de recursos para aplicaciones en tiempo real y análisis con soporte completo de SQL y una amplia gama de funciones para ayudar a los usuarios a escribir consultas analíticas. Las estructuras de datos y las funciones de búsqueda de distancia (como `L2Distance`) recientemente agregadas, así como los [índices de búsqueda aproximada de vecinos más cercanos](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/annindexes), permiten que ClickHouse se utilice como una base de datos vectorial de alto rendimiento y escalable para almacenar y buscar vectores con SQL.

Este cuaderno muestra cómo usar la funcionalidad relacionada con la búsqueda de vectores `ClickHouse`.

## Configuración de entornos

Configuración del servidor local de clickhouse con docker (opcional)

```python
! docker run -d -p 8123:8123 -p9000:9000 --name langchain-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server:23.4.2.11
```

Configuración del controlador del cliente clickhouse

```python
%pip install --upgrade --quiet  clickhouse-connect
```

Queremos usar OpenAIEmbeddings, así que tenemos que obtener la clave API de OpenAI.

```python
import getpass
import os

if not os.environ["OPENAI_API_KEY"]:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.vectorstores import Clickhouse, ClickhouseSettings
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
for d in docs:
    d.metadata = {"some": "metadata"}
settings = ClickhouseSettings(table="clickhouse_vector_search_example")
docsearch = Clickhouse.from_documents(docs, embeddings, config=settings)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:00<00:00, 2801.49it/s]
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

## Obtener información de conexión y esquema de datos

```python
print(str(docsearch))
```

```output
[92m[1mdefault.clickhouse_vector_search_example @ localhost:8123[0m

[1musername: None[0m

Table Schema:
---------------------------------------------------
|[94mid                      [0m|[96mNullable(String)        [0m|
|[94mdocument                [0m|[96mNullable(String)        [0m|
|[94membedding               [0m|[96mArray(Float32)          [0m|
|[94mmetadata                [0m|[96mObject('json')          [0m|
|[94muuid                    [0m|[96mUUID                    [0m|
---------------------------------------------------
```

### Esquema de tabla de Clickhouse

> La tabla de Clickhouse se creará automáticamente si no existe de forma predeterminada. Los usuarios avanzados podrían pre-crear la tabla con configuraciones optimizadas. Para un clúster distribuido de Clickhouse con particionamiento, el motor de tabla debe configurarse como `Distributed`.

```python
print(f"Clickhouse Table DDL:\n\n{docsearch.schema}")
```

```output
Clickhouse Table DDL:

CREATE TABLE IF NOT EXISTS default.clickhouse_vector_search_example(
    id Nullable(String),
    document Nullable(String),
    embedding Array(Float32),
    metadata JSON,
    uuid UUID DEFAULT generateUUIDv4(),
    CONSTRAINT cons_vec_len CHECK length(embedding) = 1536,
    INDEX vec_idx embedding TYPE annoy(100,'L2Distance') GRANULARITY 1000
) ENGINE = MergeTree ORDER BY uuid SETTINGS index_granularity = 8192
```

## Filtrado

Puede tener acceso directo a la declaración SQL de ClickHouse donde. Puede escribir cláusulas `WHERE` siguiendo el estándar SQL.

**NOTA**: Tenga cuidado con la inyección SQL, esta interfaz no debe ser llamada directamente por el usuario final.

Si personalizó su `column_map` en su configuración, puede buscar con un filtro así:

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Clickhouse, ClickhouseSettings

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

for i, d in enumerate(docs):
    d.metadata = {"doc_id": i}

docsearch = Clickhouse.from_documents(docs, embeddings)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:00<00:00, 6939.56it/s]
```

```python
meta = docsearch.metadata_column
output = docsearch.similarity_search_with_relevance_scores(
    "What did the president say about Ketanji Brown Jackson?",
    k=4,
    where_str=f"{meta}.doc_id<10",
)
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")
```

```output
0.6779101415357189 {'doc_id': 0} Madam Speaker, Madam...
0.6997970363474885 {'doc_id': 8} And so many families...
0.7044504914336727 {'doc_id': 1} Groups of citizens b...
0.7053558702165094 {'doc_id': 6} And I’m taking robus...
```

## Eliminando tus datos

```python
docsearch.drop()
```
