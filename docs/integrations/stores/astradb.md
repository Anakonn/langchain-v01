---
canonical: https://python.langchain.com/v0.1/docs/integrations/stores/astradb
sidebar_label: Astra DB
translated: false
---

# Astra DB

DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) is a serverless vector-capable database built on Cassandra and made conveniently available through an easy-to-use JSON API.

`AstraDBStore` and `AstraDBByteStore` need the `astrapy` package to be installed:

```python
%pip install --upgrade --quiet  astrapy
```

The Store takes the following parameters:

* `api_endpoint`: Astra DB API endpoint. Looks like `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`
* `token`: Astra DB token. Looks like `AstraCS:6gBhNmsk135....`
* `collection_name` : Astra DB collection name
* `namespace`: (Optional) Astra DB namespace

## AstraDBStore

The `AstraDBStore` is an implementation of `BaseStore` that stores everything in your DataStax Astra DB instance.
The store keys must be strings and will be mapped to the `_id` field of the Astra DB document.
The store values can be any object that can be serialized by `json.dumps`.
In the database, entries will have the form:

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

### Usage with CacheBackedEmbeddings

You may use the `AstraDBStore` in conjunction with a [`CacheBackedEmbeddings`](/docs/modules/data_connection/text_embedding/caching_embeddings) to cache the result of embeddings computations.
Note that `AstraDBStore` stores the embeddings as a list of floats without converting them first to bytes so we don't use `fromByteStore` there.

```python
from langchain.embeddings import CacheBackedEmbeddings, OpenAIEmbeddings

embeddings = CacheBackedEmbeddings(
    underlying_embeddings=OpenAIEmbeddings(), document_embedding_store=store
)
```

## AstraDBByteStore

The `AstraDBByteStore` is an implementation of `ByteStore` that stores everything in your DataStax Astra DB instance.
The store keys must be strings and will be mapped to the `_id` field of the Astra DB document.
The store `bytes` values are converted to base64 strings for storage into Astra DB.
In the database, entries will have the form:

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