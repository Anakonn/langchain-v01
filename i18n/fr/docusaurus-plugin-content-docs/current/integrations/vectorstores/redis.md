---
translated: true
---

# Redis

>[Redis vector database](https://redis.io/docs/get-started/vector-database/) introduction et guide d'intégration langchain.

## Qu'est-ce que Redis ?

La plupart des développeurs ayant une expérience des services web connaissent `Redis`. Au cœur, `Redis` est un magasin de valeurs-clés open-source utilisé comme cache, courtier de messages et base de données. Les développeurs choisissent `Redis` parce qu'il est rapide, dispose d'un large écosystème de bibliothèques clientes, et a été déployé par de grandes entreprises depuis des années.

En plus de ces cas d'utilisation traditionnels, `Redis` offre des capacités supplémentaires comme la capacité de Recherche et de Requête qui permet aux utilisateurs de créer des structures d'index secondaires au sein de `Redis`. Cela permet à `Redis` d'être une base de données vectorielle, à la vitesse d'un cache.

## Redis en tant que base de données vectorielle

`Redis` utilise des index inversés compressés pour un indexage rapide avec une empreinte mémoire réduite. Il prend également en charge un certain nombre de fonctionnalités avancées telles que :

* Indexation de plusieurs champs dans les hachages Redis et `JSON`
* Recherche de similarité vectorielle (avec `HNSW` (ANN) ou `FLAT` (KNN))
* Recherche de plage vectorielle (par exemple, trouver tous les vecteurs dans un rayon autour d'un vecteur de requête)
* Indexation incrémentale sans perte de performance
* Classement des documents (en utilisant [tf-idf](https://en.wikipedia.org/wiki/Tf%E2%80%93idf), avec des poids fournis par l'utilisateur en option)
* Pondération des champs
* Requêtes booléennes complexes avec les opérateurs `ET`, `OU` et `NON`
* Correspondance de préfixe, correspondance floue et requêtes de phrases exactes
* Support pour [double-metaphone phonetic matching](https://redis.io/docs/stack/search/reference/phonetic_matching/)
* Suggestions de saisie semi-automatique (avec suggestions de préfixe floues)
* Expansion de requête basée sur la racinisation dans [de nombreuses langues](https://redis.io/docs/stack/search/reference/stemming/) (en utilisant [Snowball](http://snowballstem.org/)))
* Support pour la tokenisation et les requêtes en langue chinoise (en utilisant [Friso](https://github.com/lionsoul2014/friso)))
* Filtres et plages numériques
* Recherches géospatiales utilisant l'indexation géospatiale de Redis
* Un moteur d'agrégation puissant
* Supporte tous les textes encodés en `utf-8`
* Récupérer des documents complets, des champs sélectionnés ou uniquement les identifiants des documents
* Trier les résultats (par exemple, par date de création)

## Clients

Puisque `Redis` est bien plus qu'une simple base de données vectorielle, il existe souvent des cas d'utilisation qui nécessitent l'utilisation d'un client `Redis` en plus de l'intégration `LangChain`. Vous pouvez utiliser n'importe quelle bibliothèque cliente `Redis` standard pour exécuter les commandes de Recherche et de Requête, mais il est plus facile d'utiliser une bibliothèque qui enveloppe l'API de Recherche et de Requête. Voici quelques exemples, mais vous pouvez trouver plus de bibliothèques clientes [ici](https://redis.io/resources/clients/).

| Projet | Langue | Licence | Auteur | Étoiles |
|----------|---------|--------|---------|-------|
| [jedis][jedis-url] | Java | MIT | [Redis][redis-url] | ![Stars][jedis-stars] |
| [redisvl][redisvl-url] | Python | MIT | [Redis][redis-url] | ![Stars][redisvl-stars] |
| [redis-py][redis-py-url] | Python | MIT | [Redis][redis-url] | ![Stars][redis-py-stars] |
| [node-redis][node-redis-url] | Node.js | MIT | [Redis][redis-url] | ![Stars][node-redis-stars] |
| [nredisstack][nredisstack-url] | .NET | MIT | [Redis][redis-url] | ![Stars][nredisstack-stars] |

[redis-url]: https://redis.com

[redisvl-url]: https://github.com/RedisVentures/redisvl
[redisvl-stars]: https://img.shields.io/github/stars/RedisVentures/redisvl.svg?style=social&amp;label=Star&amp;maxAge=2592000
[redisvl-package]: https://pypi.python.org/pypi/redisvl

[redis-py-url]: https://github.com/redis/redis-py
[redis-py-stars]: https://img.shields.io/github/stars/redis/redis-py.svg?style=social&amp;label=Star&amp;maxAge=2592000
[redis-py-package]: https://pypi.python.org/pypi/redis

[jedis-url]: https://github.com/redis/jedis
[jedis-stars]: https://img.shields.io/github/stars/redis/jedis.svg?style=social&amp;label=Star&amp;maxAge=2592000
[Jedis-package]: https://search.maven.org/artifact/redis.clients/jedis

[nredisstack-url]: https://github.com/redis/nredisstack
[nredisstack-stars]: https://img.shields.io/github/stars/redis/nredisstack.svg?style=social&amp;label=Star&amp;maxAge=2592000
[nredisstack-package]: https://www.nuget.org/packages/nredisstack/

[node-redis-url]: https://github.com/redis/node-redis
[node-redis-stars]: https://img.shields.io/github/stars/redis/node-redis.svg?style=social&amp;label=Star&amp;maxAge=2592000
[node-redis-package]: https://www.npmjs.com/package/redis

[redis-om-python-url]: https://github.com/redis/redis-om-python
[redis-om-python-author]: https://redis.com
[redis-om-python-stars]: https://img.shields.io/github/stars/redis/redis-om-python.svg?style=social&amp;label=Star&amp;maxAge=2592000

[redisearch-go-url]: https://github.com/RediSearch/redisearch-go
[redisearch-go-author]: https://redis.com
[redisearch-go-stars]: https://img.shields.io/github/stars/RediSearch/redisearch-go.svg?style=social&amp;label=Star&amp;maxAge=2592000

[redisearch-api-rs-url]: https://github.com/RediSearch/redisearch-api-rs
[redisearch-api-rs-author]: https://redis.com
[redisearch-api-rs-stars]: https://img.shields.io/github/stars/RediSearch/redisearch-api-rs.svg?style=social&amp;label=Star&amp;maxAge=2592000

## Options de déploiement

Il existe de nombreuses façons de déployer Redis avec RediSearch. La façon la plus simple de commencer est d'utiliser Docker, mais il existe de nombreuses options de déploiement potentielles telles que

- [Redis Cloud](https://redis.com/redis-enterprise-cloud/overview/)
- [Docker (Redis Stack)](https://hub.docker.com/r/redis/redis-stack)
- Marketplaces Cloud : [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-e6y7ork67pjwg?sr=0-2&ref_=beagle&applicationId=AWSMPContessa), [Google Marketplace](https://console.cloud.google.com/marketplace/details/redislabs-public/redis-enterprise?pli=1), ou [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/garantiadata.redis_enterprise_1sp_public_preview?tab=Overview)
- Sur site : [Redis Enterprise Software](https://redis.com/redis-enterprise-software/overview/)
- Kubernetes : [Redis Enterprise Software on Kubernetes](https://docs.redis.com/latest/kubernetes/)

## Exemples supplémentaires

De nombreux exemples peuvent être trouvés dans le [GitHub de l'équipe Redis AI](https://github.com/RedisVentures/)

- [Ressources Awesome Redis AI](https://github.com/RedisVentures/redis-ai-resources) - Liste d'exemples d'utilisation de Redis dans les charges de travail d'IA
- [Azure OpenAI Embeddings Q&A](https://github.com/ruoccofabrizio/azure-open-ai-embeddings-qna) - OpenAI et Redis en tant que service de questions-réponses sur Azure.
- [Recherche de papiers ArXiv](https://github.com/RedisVentures/redis-arXiv-search) - Recherche sémantique sur les papiers académiques ArXiv
- [Recherche vectorielle sur Azure](https://learn.microsoft.com/azure/azure-cache-for-redis/cache-tutorial-vector-similarity) - Recherche vectorielle sur Azure utilisant Azure Cache pour Redis et Azure OpenAI

## Plus de ressources

Pour plus d'informations sur l'utilisation de Redis en tant que base de données vectorielle, consultez les ressources suivantes :

- [Documentation RedisVL](https://redisvl.com) - Documentation pour le client Redis Vector Library
- [Docs de similarité vectorielle Redis](https://redis.io/docs/stack/search/reference/vectors/) - Docs officiels de Redis pour la recherche vectorielle.
- [Docs de recherche Redis-py](https://redis.readthedocs.io/en/latest/redismodules.html#redisearch-commands) - Documentation pour la bibliothèque cliente redis-py
- [Recherche de similarité vectorielle : des bases à la production](https://mlops.community/vector-similarity-search-from-basics-to-production/) - Article de blog introductif sur VSS et Redis en tant que VectorDB.

## Configuration

### Installer le client Python Redis

`Redis-py` est le client officiellement supporté par Redis. Récemment, le client `RedisVL` a été publié, spécialement conçu pour les cas d'utilisation de base de données vectorielle. Les deux peuvent être installés avec pip.

```python
%pip install --upgrade --quiet  redis redisvl langchain-openai tiktoken
```

Nous voulons utiliser `OpenAIEmbeddings` donc nous devons obtenir la clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

### Déployer Redis localement

Pour déployer Redis localement, exécutez :

```console
docker run -d -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

Si tout fonctionne correctement, vous devriez voir une belle interface utilisateur Redis à `http://localhost:8001`. Voir la section [Options de déploiement](#options-de-déploiement) ci-dessus pour d'autres façons de déployer.

### Schémas d'URL de connexion Redis

Les schémas d'URL Redis valides sont :
1. `redis://`  - Connexion à Redis autonome, non crypté
2. `rediss://` - Connexion à Redis autonome, avec chiffrement TLS
3. `redis+sentinel://`  - Connexion au serveur Redis via Redis Sentinel, non crypté
4. `rediss+sentinel://` - Connexion au serveur Redis via Redis Sentinel, les deux connexions avec chiffrement TLS

Plus d'informations sur les paramètres de connexion supplémentaires peuvent être trouvées dans la [documentation redis-py](https://redis-py.readthedocs.io/en/stable/connections.html).

```python
# connection to redis standalone at localhost, db 0, no password
redis_url = "redis://localhost:6379"
# connection to host "redis" port 7379 with db 2 and password "secret" (old style authentication scheme without username / pre 6.x)
redis_url = "redis://:secret@redis:7379/2"
# connection to host redis on default port with user "joe", pass "secret" using redis version 6+ ACLs
redis_url = "redis://joe:secret@redis/0"

# connection to sentinel at localhost with default group mymaster and db 0, no password
redis_url = "redis+sentinel://localhost:26379"
# connection to sentinel at host redis with default port 26379 and user "joe" with password "secret" with default group mymaster and db 0
redis_url = "redis+sentinel://joe:secret@redis"
# connection to sentinel, no auth with sentinel monitoring group "zone-1" and database 2
redis_url = "redis+sentinel://redis:26379/zone-1/2"

# connection to redis standalone at localhost, db 0, no password but with TLS support
redis_url = "rediss://localhost:6379"
# connection to redis sentinel at localhost and default port, db 0, no password
# but with TLS support for booth Sentinel and Redis server
redis_url = "rediss+sentinel://localhost"
```

### Données d'exemple

Tout d'abord, nous décrirons quelques données d'exemple afin de démontrer les différents attributs du magasin de vecteurs Redis.

```python
metadata = [
    {
        "user": "john",
        "age": 18,
        "job": "engineer",
        "credit_score": "high",
    },
    {
        "user": "derrick",
        "age": 45,
        "job": "doctor",
        "credit_score": "low",
    },
    {
        "user": "nancy",
        "age": 94,
        "job": "doctor",
        "credit_score": "high",
    },
    {
        "user": "tyler",
        "age": 100,
        "job": "engineer",
        "credit_score": "high",
    },
    {
        "user": "joe",
        "age": 35,
        "job": "dentist",
        "credit_score": "medium",
    },
]
texts = ["foo", "foo", "foo", "bar", "bar"]
```

### Créer un magasin de vecteurs Redis

L'instance Redis VectorStore peut être initialisée de plusieurs manières. Il existe plusieurs méthodes de classe qui peuvent être utilisées pour initialiser une instance Redis VectorStore.

- ``Redis.__init__`` - Initialiser directement
- ``Redis.from_documents`` - Initialiser à partir d'une liste d'objets ``Langchain.docstore.Document``
- ``Redis.from_texts`` - Initialiser à partir d'une liste de textes (éventuellement avec des métadonnées)
- ``Redis.from_texts_return_keys`` - Initialiser à partir d'une liste de textes (éventuellement avec des métadonnées) et retourner les clés
- ``Redis.from_existing_index`` - Initialiser à partir d'un index Redis existant

Ci-dessous, nous utiliserons la méthode ``Redis.from_texts``.

```python
from langchain_community.vectorstores.redis import Redis

rds = Redis.from_texts(
    texts,
    embeddings,
    metadatas=metadata,
    redis_url="redis://localhost:6379",
    index_name="users",
)
```

```python
rds.index_name
```

```output
'users'
```

## Inspection de l'Index créé

Une fois l'objet ``Redis`` VectorStore construit, un index aura été créé dans Redis s'il n'existait pas déjà. L'index peut être inspecté à la fois avec l'outil en ligne de commande ``rvl`` et ``redis-cli``. Si vous avez installé ``redisvl`` ci-dessus, vous pouvez utiliser l'outil en ligne de commande ``rvl`` pour inspecter l'index.

```python
# assumes you're running Redis locally (use --host, --port, --password, --username, to change this)
!rvl index listall
```

```output
[32m16:58:26[0m [34m[RedisVL][0m [1;30mINFO[0m   Indices:
[32m16:58:26[0m [34m[RedisVL][0m [1;30mINFO[0m   1. users
```

L'implémentation ``Redis`` VectorStore tentera de générer un schéma d'index (champs pour le filtrage) pour toutes les métadonnées passées via les méthodes ``from_texts``, ``from_texts_return_keys`` et ``from_documents``. De cette manière, toutes les métadonnées passées seront indexées dans l'index de recherche Redis permettant de filtrer sur ces champs.

Ci-dessous, nous montrons quels champs ont été créés à partir des métadonnées que nous avons définies ci-dessus

```python
!rvl index info -i users
```

```output


Index Information:
╭──────────────┬────────────────┬───────────────┬─────────────────┬────────────╮
│ Index Name   │ Storage Type   │ Prefixes      │ Index Options   │   Indexing │
├──────────────┼────────────────┼───────────────┼─────────────────┼────────────┤
│ users        │ HASH           │ ['doc:users'] │ []              │          0 │
╰──────────────┴────────────────┴───────────────┴─────────────────┴────────────╯
Index Fields:
╭────────────────┬────────────────┬─────────┬────────────────┬────────────────╮
│ Name           │ Attribute      │ Type    │ Field Option   │   Option Value │
├────────────────┼────────────────┼─────────┼────────────────┼────────────────┤
│ user           │ user           │ TEXT    │ WEIGHT         │              1 │
│ job            │ job            │ TEXT    │ WEIGHT         │              1 │
│ credit_score   │ credit_score   │ TEXT    │ WEIGHT         │              1 │
│ content        │ content        │ TEXT    │ WEIGHT         │              1 │
│ age            │ age            │ NUMERIC │                │                │
│ content_vector │ content_vector │ VECTOR  │                │                │
╰────────────────┴────────────────┴─────────┴────────────────┴────────────────╯
```

```python
!rvl stats -i users
```

```output

Statistics:
╭─────────────────────────────┬─────────────╮
│ Stat Key                    │ Value       │
├─────────────────────────────┼─────────────┤
│ num_docs                    │ 5           │
│ num_terms                   │ 15          │
│ max_doc_id                  │ 5           │
│ num_records                 │ 33          │
│ percent_indexed             │ 1           │
│ hash_indexing_failures      │ 0           │
│ number_of_uses              │ 4           │
│ bytes_per_record_avg        │ 4.60606     │
│ doc_table_size_mb           │ 0.000524521 │
│ inverted_sz_mb              │ 0.000144958 │
│ key_table_size_mb           │ 0.000193596 │
│ offset_bits_per_record_avg  │ 8           │
│ offset_vectors_sz_mb        │ 2.19345e-05 │
│ offsets_per_term_avg        │ 0.69697     │
│ records_per_doc_avg         │ 6.6         │
│ sortable_values_size_mb     │ 0           │
│ total_indexing_time         │ 0.32        │
│ total_inverted_index_blocks │ 16          │
│ vector_index_sz_mb          │ 6.0126      │
╰─────────────────────────────┴─────────────╯
```

Il est important de noter que nous n'avons pas spécifié que l'``utilisateur``, le ``métier``, le ``score_de_crédit`` et l'``âge`` dans les métadonnées devraient être des champs dans l'index, c'est parce que l'objet ``Redis`` VectorStore génère automatiquement le schéma d'index à partir des métadonnées passées. Pour plus d'informations sur la génération des champs d'index, consultez la documentation de l'API.

## Interroger

Il existe plusieurs façons d'interroger l'implémentation ``Redis`` VectorStore en fonction de l'utilisation que vous en avez :

- ``similarity_search``: Trouver les vecteurs les plus similaires à un vecteur donné.
- ``similarity_search_with_score``: Trouver les vecteurs les plus similaires à un vecteur donné et retourner la distance du vecteur
- ``similarity_search_limit_score``: Trouver les vecteurs les plus similaires à un vecteur donné et limiter le nombre de résultats au ``score_threshold``
- ``similarity_search_with_relevance_scores``: Trouver les vecteurs les plus similaires à un vecteur donné et retourner les similarités des vecteurs
- ``max_marginal_relevance_search``: Trouver les vecteurs les plus similaires à un vecteur donné tout en optimisant également la diversité

```python
results = rds.similarity_search("foo")
print(results[0].page_content)
```

```output
foo
```

```python
# return metadata
results = rds.similarity_search("foo", k=3)
meta = results[1].metadata
print("Key of the document in Redis: ", meta.pop("id"))
print("Metadata of the document: ", meta)
```

```output
Key of the document in Redis:  doc:users:a70ca43b3a4e4168bae57c78753a200f
Metadata of the document:  {'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}
```

```python
# with scores (distances)
results = rds.similarity_search_with_score("foo", k=5)
for result in results:
    print(f"Content: {result[0].page_content} --- Score: {result[1]}")
```

```output
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: bar --- Score: 0.1566
Content: bar --- Score: 0.1566
```

```python
# limit the vector distance that can be returned
results = rds.similarity_search_with_score("foo", k=5, distance_threshold=0.1)
for result in results:
    print(f"Content: {result[0].page_content} --- Score: {result[1]}")
```

```output
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
```

```python
# with scores
results = rds.similarity_search_with_relevance_scores("foo", k=5)
for result in results:
    print(f"Content: {result[0].page_content} --- Similiarity: {result[1]}")
```

```output
Content: foo --- Similiarity: 1.0
Content: foo --- Similiarity: 1.0
Content: foo --- Similiarity: 1.0
Content: bar --- Similiarity: 0.8434
Content: bar --- Similiarity: 0.8434
```

```python
# limit scores (similarities have to be over .9)
results = rds.similarity_search_with_relevance_scores("foo", k=5, score_threshold=0.9)
for result in results:
    print(f"Content: {result[0].page_content} --- Similarity: {result[1]}")
```

```output
Content: foo --- Similarity: 1.0
Content: foo --- Similarity: 1.0
Content: foo --- Similarity: 1.0
```

```python
# you can also add new documents as follows
new_document = ["baz"]
new_metadata = [{"user": "sam", "age": 50, "job": "janitor", "credit_score": "high"}]
# both the document and metadata must be lists
rds.add_texts(new_document, new_metadata)
```

```output
['doc:users:b9c71d62a0a34241a37950b448dafd38']
```

```python
# now query the new document
results = rds.similarity_search("baz", k=3)
print(results[0].metadata)
```

```output
{'id': 'doc:users:b9c71d62a0a34241a37950b448dafd38', 'user': 'sam', 'job': 'janitor', 'credit_score': 'high', 'age': '50'}
```

```python
# use maximal marginal relevance search to diversify results
results = rds.max_marginal_relevance_search("foo")
```

```python
# the lambda_mult parameter controls the diversity of the results, the lower the more diverse
results = rds.max_marginal_relevance_search("foo", lambda_mult=0.1)
```

## Connecter à un index existant

Afin d'avoir les mêmes métadonnées indexées lors de l'utilisation du ``Redis`` VectorStore. Vous devrez avoir le même ``index_schema`` passé soit comme un chemin vers un fichier YAML, soit comme un dictionnaire. Ce qui suit montre comment obtenir le schéma d'un index et se connecter à un index existant.

```python
# write the schema to a yaml file
rds.write_schema("redis_schema.yaml")
```

Le fichier de schéma pour cet exemple devrait ressembler à ceci :

```yaml
numeric:
- name: age
  no_index: false
  sortable: false
text:
- name: user
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: job
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: credit_score
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: content
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
vector:
- algorithm: FLAT
  block_size: 1000
  datatype: FLOAT32
  dims: 1536
  distance_metric: COSINE
  initial_cap: 20000
  name: content_vector
```

**Remarque**, cela inclut **tous** les champs possibles pour le schéma. Vous pouvez supprimer tous les champs dont vous n'avez pas besoin.

```python
# now we can connect to our existing index as follows

new_rds = Redis.from_existing_index(
    embeddings,
    index_name="users",
    redis_url="redis://localhost:6379",
    schema="redis_schema.yaml",
)
results = new_rds.similarity_search("foo", k=3)
print(results[0].metadata)
```

```output
{'id': 'doc:users:8484c48a032d4c4cbe3cc2ed6845fabb', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}
```

```python
# see the schemas are the same
new_rds.schema == rds.schema
```

```output
True
```

## Indexation des métadonnées personnalisées

Dans certains cas, vous pouvez vouloir contrôler à quels champs les métadonnées sont mappées. Par exemple, vous pouvez vouloir que le champ ``score_de_crédit`` soit un champ catégorique au lieu d'un champ texte (ce qui est le comportement par défaut pour tous les champs de type chaîne). Dans ce cas, vous pouvez utiliser le paramètre ``index_schema`` dans chacune des méthodes d'initialisation ci-dessus pour spécifier le schéma pour l'index. Le schéma d'index personnalisé peut être passé soit comme un dictionnaire, soit comme un chemin vers un fichier YAML.

Tous les arguments dans le schéma ont des valeurs par défaut à l'exception du nom, vous pouvez donc spécifier uniquement les champs que vous souhaitez modifier. Tous les noms correspondent aux versions snake/lowercase des arguments que vous utiliseriez en ligne de commande avec ``redis-cli`` ou dans ``redis-py``. Pour plus d'informations sur les arguments pour chaque champ, consultez la [documentation](https://redis.io/docs/interact/search-and-query/basic-constructs/field-and-type-options/)

L'exemple ci-dessous montre comment spécifier le schéma pour le champ ``score_de_crédit`` comme un champ Tag (catégorique) au lieu d'un champ texte.

```yaml
# index_schema.yml
tag:
    - name: credit_score
text:
    - name: user
    - name: job
numeric:
    - name: age
```

En Python, cela ressemblerait à ceci :

```python

index_schema = {
    "tag": [{"name": "credit_score"}],
    "text": [{"name": "user"}, {"name": "job"}],
    "numeric": [{"name": "age"}],
}

```

Notez que seul le champ ``name`` doit être spécifié. Tous les autres champs ont des valeurs par défaut.

```python
# create a new index with the new schema defined above
index_schema = {
    "tag": [{"name": "credit_score"}],
    "text": [{"name": "user"}, {"name": "job"}],
    "numeric": [{"name": "age"}],
}

rds, keys = Redis.from_texts_return_keys(
    texts,
    embeddings,
    metadatas=metadata,
    redis_url="redis://localhost:6379",
    index_name="users_modified",
    index_schema=index_schema,  # pass in the new index schema
)
```

```output
`index_schema` does not match generated metadata schema.
If you meant to manually override the schema, please ignore this message.
index_schema: {'tag': [{'name': 'credit_score'}], 'text': [{'name': 'user'}, {'name': 'job'}], 'numeric': [{'name': 'age'}]}
generated_schema: {'text': [{'name': 'user'}, {'name': 'job'}, {'name': 'credit_score'}], 'numeric': [{'name': 'age'}], 'tag': []}
```

L'avertissement ci-dessus est destiné à notifier les utilisateurs lorsqu'ils remplacent le comportement par défaut. Ignorez-le si vous remplacez intentionnellement le comportement.

## Filtrage hybride

Avec le langage d'expression de filtrage Redis intégré à LangChain, vous pouvez créer des chaînes de filtres hybrides arbitrairement longues qui peuvent être utilisées pour filtrer vos résultats de recherche. Le langage d'expression est dérivé de la [RedisVL Expression Syntax](https://redisvl.com) et est conçu pour être facile à utiliser et à comprendre.

Les types de filtres disponibles sont les suivants :
- ``RedisText``: Filtrer par recherche en texte intégral sur les champs de métadonnées. Prend en charge la correspondance exacte, floue et par joker.
- ``RedisNum``: Filtrer par plage numérique sur les champs de métadonnées.
- ``RedisTag``: Filtrer par correspondance exacte sur les champs de métadonnées catégorielles basées sur des chaînes. Plusieurs tags peuvent être spécifiés comme "tag1,tag2,tag3".

Les exemples suivants montrent l'utilisation de ces filtres.

```python

from langchain_community.vectorstores.redis import RedisText, RedisNum, RedisTag

# exact matching
has_high_credit = RedisTag("credit_score") == "high"
does_not_have_high_credit = RedisTag("credit_score") != "low"

# fuzzy matching
job_starts_with_eng = RedisText("job") % "eng*"
job_is_engineer = RedisText("job") == "engineer"
job_is_not_engineer = RedisText("job") != "engineer"

# numeric filtering
age_is_18 = RedisNum("age") == 18
age_is_not_18 = RedisNum("age") != 18
age_is_greater_than_18 = RedisNum("age") > 18
age_is_less_than_18 = RedisNum("age") < 18
age_is_greater_than_or_equal_to_18 = RedisNum("age") >= 18
age_is_less_than_or_equal_to_18 = RedisNum("age") <= 18

```

La classe ``RedisFilter`` peut être utilisée pour simplifier l'importation de ces filtres comme suit

```python

from langchain_community.vectorstores.redis import RedisFilter

# same examples as above
has_high_credit = RedisFilter.tag("credit_score") == "high"
does_not_have_high_credit = RedisFilter.num("age") > 8
job_starts_with_eng = RedisFilter.text("job") % "eng*"
```

Les exemples suivants montrent l'utilisation d'un filtre hybride pour la recherche

```python
from langchain_community.vectorstores.redis import RedisText

is_engineer = RedisText("job") == "engineer"
results = rds.similarity_search("foo", k=3, filter=is_engineer)

print("Job:", results[0].metadata["job"])
print("Engineers in the dataset:", len(results))
```

```output
Job: engineer
Engineers in the dataset: 2
```

```python
# fuzzy match
starts_with_doc = RedisText("job") % "doc*"
results = rds.similarity_search("foo", k=3, filter=starts_with_doc)

for result in results:
    print("Job:", result.metadata["job"])
print("Jobs in dataset that start with 'doc':", len(results))
```

```output
Job: doctor
Job: doctor
Jobs in dataset that start with 'doc': 2
```

```python
from langchain_community.vectorstores.redis import RedisNum

is_over_18 = RedisNum("age") > 18
is_under_99 = RedisNum("age") < 99
age_range = is_over_18 & is_under_99
results = rds.similarity_search("foo", filter=age_range)

for result in results:
    print("User:", result.metadata["user"], "is", result.metadata["age"])
```

```output
User: derrick is 45
User: nancy is 94
User: joe is 35
```

```python
# make sure to use parenthesis around FilterExpressions
# if initializing them while constructing them
age_range = (RedisNum("age") > 18) & (RedisNum("age") < 99)
results = rds.similarity_search("foo", filter=age_range)

for result in results:
    print("User:", result.metadata["user"], "is", result.metadata["age"])
```

```output
User: derrick is 45
User: nancy is 94
User: joe is 35
```

## Redis en tant que Retriever

Voici un aperçu des différentes options pour utiliser le magasin de vecteurs comme retriever.

Il existe trois méthodes de recherche différentes que nous pouvons utiliser pour effectuer une récupération. Par défaut, il utilisera la similarité sémantique.

```python
query = "foo"
results = rds.similarity_search_with_score(query, k=3, return_metadata=True)

for result in results:
    print("Content:", result[0].page_content, " --- Score: ", result[1])
```

```output
Content: foo  --- Score:  0.0
Content: foo  --- Score:  0.0
Content: foo  --- Score:  0.0
```

```python
retriever = rds.as_retriever(search_type="similarity", search_kwargs={"k": 4})
```

```python
docs = retriever.invoke(query)
docs
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'}),
 Document(page_content='bar', metadata={'id': 'doc:users_modified:01ef6caac12b42c28ad870aefe574253', 'user': 'tyler', 'job': 'engineer', 'credit_score': 'high', 'age': '100'})]
```

Il existe également le `similarity_distance_threshold` retriever qui permet à l'utilisateur de spécifier la distance du vecteur

```python
retriever = rds.as_retriever(
    search_type="similarity_distance_threshold",
    search_kwargs={"k": 4, "distance_threshold": 0.1},
)
```

```python
docs = retriever.invoke(query)
docs
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'})]
```

Enfin, le ``similarity_score_threshold`` permet à l'utilisateur de définir le score minimum pour les documents similaires

```python
retriever = rds.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.9, "k": 10},
)
```

```python
retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'})]
```

```python
retriever = rds.as_retriever(
    search_type="mmr", search_kwargs={"fetch_k": 20, "k": 4, "lambda_mult": 0.1}
)
```

```python
retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users:8f6b673b390647809d510112cde01a27', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='bar', metadata={'id': 'doc:users:93521560735d42328b48c9c6f6418d6a', 'user': 'tyler', 'job': 'engineer', 'credit_score': 'high', 'age': '100'}),
 Document(page_content='foo', metadata={'id': 'doc:users:125ecd39d07845eabf1a699d44134a5b', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'}),
 Document(page_content='foo', metadata={'id': 'doc:users:d6200ab3764c466082fde3eaab972a2a', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'})]
```

## Supprimer des clés et l'index

Pour supprimer vos entrées, vous devez les adresser par leurs clés.

```python
Redis.delete(keys, redis_url="redis://localhost:6379")
```

```output
True
```

```python
# delete the indices too
Redis.drop_index(
    index_name="users", delete_documents=True, redis_url="redis://localhost:6379"
)
Redis.drop_index(
    index_name="users_modified",
    delete_documents=True,
    redis_url="redis://localhost:6379",
)
```

```output
True
```
