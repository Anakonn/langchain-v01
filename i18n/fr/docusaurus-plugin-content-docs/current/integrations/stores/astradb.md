---
sidebar_label: Astra DB
translated: true
---

# Astra DB

DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) est une base de données serverless capable de traiter des vecteurs, construite sur Cassandra et rendue facilement accessible via une API JSON simple d'utilisation.

`AstraDBStore` et `AstraDBByteStore` nécessitent l'installation du package `astrapy` :

```python
%pip install --upgrade --quiet  astrapy
```

Le Store prend les paramètres suivants :

* `api_endpoint` : point de terminaison de l'API Astra DB. Ressemble à `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`
* `token` : jeton Astra DB. Ressemble à `AstraCS:6gBhNmsk135....`
* `collection_name` : nom de la collection Astra DB
* `namespace` : (Facultatif) espace de nommage Astra DB

## AstraDBStore

`AstraDBStore` est une implémentation de `BaseStore` qui stocke tout dans votre instance DataStax Astra DB.
Les clés du magasin doivent être des chaînes de caractères et seront mappées au champ `_id` du document Astra DB.
Les valeurs du magasin peuvent être n'importe quel objet pouvant être sérialisé par `json.dumps`.
Dans la base de données, les entrées auront la forme :

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

### Utilisation avec CacheBackedEmbeddings

Vous pouvez utiliser `AstraDBStore` conjointement avec un [`CacheBackedEmbeddings`](/docs/modules/data_connection/text_embedding/caching_embeddings) pour mettre en cache le résultat des calculs d'embeddings.
Notez que `AstraDBStore` stocke les embeddings sous forme de liste de flottants sans les convertir en octets, donc nous n'utilisons pas `fromByteStore` ici.

```python
from langchain.embeddings import CacheBackedEmbeddings, OpenAIEmbeddings

embeddings = CacheBackedEmbeddings(
    underlying_embeddings=OpenAIEmbeddings(), document_embedding_store=store
)
```

## AstraDBByteStore

`AstraDBByteStore` est une implémentation de `ByteStore` qui stocke tout dans votre instance DataStax Astra DB.
Les clés du magasin doivent être des chaînes de caractères et seront mappées au champ `_id` du document Astra DB.
Les valeurs `bytes` du magasin sont converties en chaînes base64 pour le stockage dans Astra DB.
Dans la base de données, les entrées auront la forme :

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
