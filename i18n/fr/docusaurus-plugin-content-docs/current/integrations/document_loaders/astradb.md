---
translated: true
---

# AstraDB

DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) est une base de données serverless capable de traiter des vecteurs, construite sur Cassandra et rendue facilement accessible via une API JSON simple d'utilisation.

## Aperçu

Le chargeur de documents AstraDB renvoie une liste de documents Langchain à partir d'une base de données AstraDB.

Le chargeur prend les paramètres suivants :

* `api_endpoint` : point de terminaison de l'API AstraDB. Ressemble à `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`
* `token` : jeton AstraDB. Ressemble à `AstraCS:6gBhNmsk135....`
* `collection_name` : nom de la collection AstraDB
* `namespace` : (Facultatif) espace de noms AstraDB
* `filter_criteria` : (Facultatif) Filtre utilisé dans la requête de recherche
* `projection` : (Facultatif) Projection utilisée dans la requête de recherche
* `find_options` : (Facultatif) Options utilisées dans la requête de recherche
* `nb_prefetched` : (Facultatif) Nombre de documents pré-récupérés par le chargeur
* `extraction_function` : (Facultatif) Une fonction pour convertir le document AstraDB en chaîne `page_content` de LangChain. Par défaut, `json.dumps`

Les métadonnées suivantes sont définies dans la sortie des documents LangChain :

```python
{
    metadata : {
        "namespace": "...",
        "api_endpoint": "...",
        "collection": "..."
    }
}
```

## Charger des documents avec le chargeur de documents

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
