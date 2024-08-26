---
sidebar_label: Astra DB
translated: true
---

# Astra DB

DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) es una base de datos sin servidor capaz de vectores construida sobre Cassandra y puesta a disposición de manera conveniente a través de una API JSON fácil de usar.

`AstraDBStore` y `AstraDBByteStore` necesitan que se instale el paquete `astrapy`:

```python
%pip install --upgrade --quiet  astrapy
```

La tienda toma los siguientes parámetros:

* `api_endpoint`: Punto final de la API de Astra DB. Se ve como `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`
* `token`: Token de Astra DB. Se ve como `AstraCS:6gBhNmsk135....`
* `collection_name`: Nombre de la colección de Astra DB
* `namespace`: (Opcional) Espacio de nombres de Astra DB

## AstraDBStore

`AstraDBStore` es una implementación de `BaseStore` que almacena todo en tu instancia de DataStax Astra DB.
Las claves de la tienda deben ser cadenas y se asignarán al campo `_id` del documento de Astra DB.
Los valores de la tienda pueden ser cualquier objeto que pueda serializarse mediante `json.dumps`.
En la base de datos, las entradas tendrán la forma:

```json
{
  "_id": "<key>",
  "value": <value>
}
```

```python
from langchain_community.storage import AstraDBStore
```

```python
from getpass import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```python
store = AstraDBStore(
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    collection_name="my_store",
)
```

```python
store.mset([("k1", "v1"), ("k2", [0.1, 0.2, 0.3])])
print(store.mget(["k1", "k2"]))
```

```output
['v1', [0.1, 0.2, 0.3]]
```

### Uso con CacheBackedEmbeddings

Puede usar `AstraDBStore` junto con un [`CacheBackedEmbeddings`](/docs/modules/data_connection/text_embedding/caching_embeddings) para almacenar en caché el resultado de los cálculos de incrustaciones.
Tenga en cuenta que `AstraDBStore` almacena las incrustaciones como una lista de flotantes sin convertirlas primero a bytes, por lo que no usamos `fromByteStore` allí.

```python
from langchain.embeddings import CacheBackedEmbeddings, OpenAIEmbeddings

embeddings = CacheBackedEmbeddings(
    underlying_embeddings=OpenAIEmbeddings(), document_embedding_store=store
)
```

## AstraDBByteStore

`AstraDBByteStore` es una implementación de `ByteStore` que almacena todo en tu instancia de DataStax Astra DB.
Las claves de la tienda deben ser cadenas y se asignarán al campo `_id` del documento de Astra DB.
Los valores `bytes` de la tienda se convierten en cadenas base64 para su almacenamiento en Astra DB.
En la base de datos, las entradas tendrán la forma:

```json
{
  "_id": "<key>",
  "value": "bytes encoded in base 64"
}
```

```python
from langchain_community.storage import AstraDBByteStore
```

```python
from getpass import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```python
store = AstraDBByteStore(
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    collection_name="my_store",
)
```

```python
store.mset([("k1", b"v1"), ("k2", b"v2")])
print(store.mget(["k1", "k2"]))
```

```output
[b'v1', b'v2']
```
