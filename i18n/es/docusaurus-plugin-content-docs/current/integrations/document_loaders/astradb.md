---
translated: true
---

# AstraDB

DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) es una base de datos sin servidor con capacidad vectorial construida sobre Cassandra y puesta a disposición de manera conveniente a través de una API JSON fácil de usar.

## Resumen

El cargador de documentos AstraDB devuelve una lista de documentos de Langchain de una base de datos AstraDB.

El cargador toma los siguientes parámetros:

* `api_endpoint`: punto final de la API de AstraDB. Se ve como `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`
* `token`: token de AstraDB. Se ve como `AstraCS:6gBhNmsk135....`
* `collection_name`: nombre de la colección de AstraDB
* `namespace`: (Opcional) espacio de nombres de AstraDB
* `filter_criteria`: (Opcional) Filtro utilizado en la consulta de búsqueda
* `projection`: (Opcional) Proyección utilizada en la consulta de búsqueda
* `find_options`: (Opcional) Opciones utilizadas en la consulta de búsqueda
* `nb_prefetched`: (Opcional) Número de documentos pre-recuperados por el cargador
* `extraction_function`: (Opcional) Una función para convertir el documento de AstraDB a la cadena `page_content` de LangChain. Por defecto es `json.dumps`

Los siguientes metadatos se establecen en la salida de metadatos de los documentos de LangChain:

```python
{
    metadata : {
        "namespace": "...",
        "api_endpoint": "...",
        "collection": "..."
    }
}
```

## Cargar documentos con el cargador de documentos

```python
from langchain_community.document_loaders import AstraDBLoader
```

```python
from getpass import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```python
loader = AstraDBLoader(
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    collection_name="movie_reviews",
    projection={"title": 1, "reviewtext": 1},
    find_options={"limit": 10},
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

```output
Document(page_content='{"_id": "659bdffa16cbc4586b11a423", "title": "Dangerous Men", "reviewtext": "\\"Dangerous Men,\\" the picture\'s production notes inform, took 26 years to reach the big screen. After having seen it, I wonder: What was the rush?"}', metadata={'namespace': 'default_keyspace', 'api_endpoint': 'https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com', 'collection': 'movie_reviews'})
```
