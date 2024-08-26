---
translated: true
---

# Cassandra

[Cassandra](https://cassandra.apache.org/) est une base de données NoSQL, orientée ligne, hautement évolutive et hautement disponible. À partir de la version 5.0, la base de données est livrée avec des [capacités de recherche vectorielle](https://cassandra.apache.org/doc/trunk/cassandra/vector-search/overview.html).

## Aperçu

Le chargeur de documents Cassandra renvoie une liste de documents Langchain à partir d'une base de données Cassandra.

Vous devez fournir une requête CQL ou un nom de table pour récupérer les documents.
Le chargeur prend les paramètres suivants :

* table : (Facultatif) La table à charger les données.
* session : (Facultatif) La session du pilote Cassandra. S'il n'est pas fourni, la session résolue de cassio sera utilisée.
* keyspace : (Facultatif) L'espace de clés de la table. S'il n'est pas fourni, l'espace de clés résolu de cassio sera utilisé.
* query : (Facultatif) La requête utilisée pour charger les données.
* page_content_mapper : (Facultatif) une fonction pour convertir une ligne en contenu de page sous forme de chaîne. Par défaut, il convertit la ligne en JSON.
* metadata_mapper : (Facultatif) une fonction pour convertir une ligne en dictionnaire de métadonnées.
* query_parameters : (Facultatif) Les paramètres de requête utilisés lors de l'appel de `session.execute`.
* query_timeout : (Facultatif) Le délai d'attente de la requête utilisé lors de l'appel de `session.execute`.
* query_custom_payload : (Facultatif) Le `custom_payload` de la requête utilisé lors de l'appel de `session.execute`.
* query_execution_profile : (Facultatif) Le `execution_profile` de la requête utilisé lors de l'appel de `session.execute`.
* query_host : (Facultatif) L'hôte de la requête utilisé lors de l'appel de `session.execute`.
* query_execute_as : (Facultatif) Le `execute_as` de la requête utilisé lors de l'appel de `session.execute`.

## Charger des documents avec le chargeur de documents

```python
from langchain_community.document_loaders import CassandraLoader
```

### Initialiser à partir d'une session de pilote Cassandra

Vous devez créer un objet `cassandra.cluster.Session`, comme décrit dans la [documentation du pilote Cassandra](https://docs.datastax.com/en/developer/python-driver/latest/api/cassandra/cluster/#module-cassandra.cluster). Les détails varient (par exemple avec les paramètres réseau et l'authentification), mais cela pourrait ressembler à quelque chose comme :

```python
from cassandra.cluster import Cluster

cluster = Cluster()
session = cluster.connect()
```

Vous devez fournir le nom d'un espace de clés existant de l'instance Cassandra :

```python
CASSANDRA_KEYSPACE = input("CASSANDRA_KEYSPACE = ")
```

Création du chargeur de documents :

```python
loader = CassandraLoader(
    table="movie_reviews",
    session=session,
    keyspace=CASSANDRA_KEYSPACE,
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

```output
Document(page_content='Row(_id=\'659bdffa16cbc4586b11a423\', title=\'Dangerous Men\', reviewtext=\'"Dangerous Men,"  the picture\\\'s production notes inform, took 26 years to reach the big screen. After having seen it, I wonder: What was the rush?\')', metadata={'table': 'movie_reviews', 'keyspace': 'default_keyspace'})
```

### Initialiser à partir de cassio

Il est également possible d'utiliser cassio pour configurer la session et l'espace de clés.

```python
import cassio

cassio.init(contact_points="127.0.0.1", keyspace=CASSANDRA_KEYSPACE)

loader = CassandraLoader(
    table="movie_reviews",
)

docs = loader.load()
```

#### Déclaration d'attribution

> Apache Cassandra, Cassandra et Apache sont soit des marques déposées, soit des marques commerciales de l' [Apache Software Foundation](http://www.apache.org/) aux États-Unis et/ou dans d'autres pays.
