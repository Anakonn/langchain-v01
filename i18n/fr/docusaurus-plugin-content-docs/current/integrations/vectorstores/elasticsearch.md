---
translated: true
---

# Elasticsearch

>[Elasticsearch](https://www.elastic.co/elasticsearch/) est un moteur de recherche et d'analyse distribué et RESTful, capable d'effectuer des recherches vectorielles et lexicales. Il est construit sur la bibliothèque Apache Lucene.

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données `Elasticsearch`.

```python
%pip install --upgrade --quiet langchain-elasticsearch langchain-openai tiktoken langchain
```

## Exécution et connexion à Elasticsearch

Il existe deux principales façons de configurer une instance Elasticsearch pour l'utiliser :

1. Elastic Cloud : Elastic Cloud est un service Elasticsearch géré. Inscrivez-vous à un [essai gratuit](https://cloud.elastic.co/registration?utm_source=langchain&utm_content=documentation).

Pour vous connecter à une instance Elasticsearch qui ne nécessite pas d'informations d'identification de connexion (en démarrant l'instance Docker avec la sécurité activée), transmettez l'URL Elasticsearch et le nom de l'index ainsi que l'objet d'intégration au constructeur.

2. Installation locale d'Elasticsearch : Commencez avec Elasticsearch en l'exécutant localement. Le moyen le plus simple est d'utiliser l'image Docker officielle d'Elasticsearch. Consultez la [documentation Docker d'Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html) pour plus d'informations.

### Exécution d'Elasticsearch via Docker

Exemple : Exécutez une instance Elasticsearch mono-nœud avec la sécurité désactivée. Cela n'est pas recommandé pour une utilisation en production.

```bash
docker run -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "xpack.security.http.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.12.1
```

Une fois l'instance Elasticsearch en cours d'exécution, vous pouvez vous y connecter en utilisant l'URL Elasticsearch et le nom de l'index ainsi que l'objet d'intégration au constructeur.

Exemple :

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    es_url="http://localhost:9200",
    index_name="test_index",
    embedding=embedding
)
```

### Authentification

Pour la production, nous vous recommandons d'exécuter avec la sécurité activée. Pour vous connecter avec des informations d'identification de connexion, vous pouvez utiliser les paramètres `es_api_key` ou `es_user` et `es_password`.

Exemple :

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    es_url="http://localhost:9200",
    index_name="test_index",
    embedding=embedding,
    es_user="elastic",
    es_password="changeme"
)
```

Vous pouvez également utiliser un objet client `Elasticsearch` qui vous offre plus de flexibilité, par exemple pour configurer le nombre maximal de nouvelles tentatives.

Exemple :

```python
import elasticsearch
from langchain_elasticsearch import ElasticsearchStore

es_client= elasticsearch.Elasticsearch(
    hosts=["http://localhost:9200"],
    es_user="elastic",
    es_password="changeme"
    max_retries=10,
)

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    index_name="test_index",
    es_connection=es_client,
    embedding=embedding,
)
```

#### Comment obtenir un mot de passe pour l'utilisateur "elastic" par défaut ?

Pour obtenir le mot de passe de votre Elastic Cloud pour l'utilisateur "elastic" par défaut :
1. Connectez-vous à la console Elastic Cloud sur https://cloud.elastic.co
2. Allez dans "Sécurité" > "Utilisateurs"
3. Localisez l'utilisateur "elastic" et cliquez sur "Modifier"
4. Cliquez sur "Réinitialiser le mot de passe"
5. Suivez les invites pour réinitialiser le mot de passe

#### Comment obtenir une clé API ?

Pour obtenir une clé API :
1. Connectez-vous à la console Elastic Cloud sur https://cloud.elastic.co
2. Ouvrez Kibana et allez dans Gestion de la pile > Clés API
3. Cliquez sur "Créer une clé API"
4. Entrez un nom pour la clé API et cliquez sur "Créer"
5. Copiez la clé API et collez-la dans le paramètre `api_key`

### Elastic Cloud

Pour vous connecter à une instance Elasticsearch sur Elastic Cloud, vous pouvez utiliser soit le paramètre `es_cloud_id`, soit `es_url`.

Exemple :

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    es_cloud_id="<cloud_id>",
    index_name="test_index",
    embedding=embedding,
    es_user="elastic",
    es_password="changeme"
)
```

Pour utiliser les `OpenAIEmbeddings`, nous devons configurer la clé API OpenAI dans l'environnement.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## Exemple de base

Dans cet exemple, nous allons charger "state_of_the_union.txt" via le TextLoader, découper le texte en morceaux de 500 mots, puis indexer chaque morceau dans Elasticsearch.

Une fois les données indexées, nous effectuons une requête simple pour trouver les 4 meilleurs morceaux similaires à la requête "Qu'a dit le président à propos de Ketanji Brown Jackson".

Elasticsearch est en cours d'exécution localement sur localhost:9200 avec [docker](#exécution-d'elasticsearch-via-docker). Pour plus de détails sur la connexion à Elasticsearch depuis Elastic Cloud, voir [connexion avec authentification](#authentification) ci-dessus.

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test-basic",
)

db.client.indices.refresh(index="test-basic")

query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)
print(results)
```

```output
[Document(page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'}), Document(page_content='As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. \n\nWhile it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.', metadata={'source': '../../modules/state_of_the_union.txt'}), Document(page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.', metadata={'source': '../../modules/state_of_the_union.txt'}), Document(page_content='This is personal to me and Jill, to Kamala, and to so many of you. \n\nCancer is the #2 cause of death in America–second only to heart disease. \n\nLast month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago. \n\nOur goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases.  \n\nMore support for patients and families.', metadata={'source': '../../modules/state_of_the_union.txt'})]
```

# Métadonnées

`ElasticsearchStore` prend en charge les métadonnées à stocker avec le document. Cet objet de dictionnaire de métadonnées est stocké dans un champ d'objet de métadonnées dans le document Elasticsearch. En fonction de la valeur des métadonnées, Elasticsearch configurera automatiquement le mappage en déduisant le type de données de la valeur des métadonnées. Par exemple, si la valeur des métadonnées est une chaîne, Elasticsearch configurera le mappage du champ d'objet de métadonnées en tant que type de chaîne.

```python
# Adding metadata to documents
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"{range(2010, 2020)[i % 10]}-01-01"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["John Doe", "Jane Doe"][i % 2]

db = ElasticsearchStore.from_documents(
    docs, embeddings, es_url="http://localhost:9200", index_name="test-metadata"
)

query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2016-01-01', 'rating': 2, 'author': 'John Doe'}
```

## Filtrage des métadonnées

Avec les métadonnées ajoutées aux documents, vous pouvez ajouter un filtrage des métadonnées lors de l'exécution de la requête.

### Exemple : Filtrer par mot-clé exact

Remarque : Nous utilisons le sous-champ de mot-clé qui n'est pas analysé

```python
docs = db.similarity_search(
    query, filter=[{"term": {"metadata.author.keyword": "John Doe"}}]
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2016-01-01', 'rating': 2, 'author': 'John Doe'}
```

### Exemple : Filtrer par correspondance partielle

Cet exemple montre comment filtrer par correspondance partielle. Cela est utile lorsque vous ne connaissez pas la valeur exacte du champ de métadonnées. Par exemple, si vous voulez filtrer par le champ de métadonnées `author` et que vous ne connaissez pas la valeur exacte de l'auteur, vous pouvez utiliser une correspondance partielle pour filtrer par le nom de famille de l'auteur. Le filtrage flou est également pris en charge.

"Jon" correspond à "John Doe" car "Jon" est une correspondance proche de "John".

```python
docs = db.similarity_search(
    query,
    filter=[{"match": {"metadata.author": {"query": "Jon", "fuzziness": "AUTO"}}}],
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2016-01-01', 'rating': 2, 'author': 'John Doe'}
```

### Exemple : Filtrer par plage de dates

```python
docs = db.similarity_search(
    "Any mention about Fred?",
    filter=[{"range": {"metadata.date": {"gte": "2010-01-01"}}}],
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2012-01-01', 'rating': 3, 'author': 'John Doe', 'geo_location': {'lat': 40.12, 'lon': -71.34}}
```

### Exemple : Filtrer par plage numérique

```python
docs = db.similarity_search(
    "Any mention about Fred?", filter=[{"range": {"metadata.rating": {"gte": 2}}}]
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2012-01-01', 'rating': 3, 'author': 'John Doe', 'geo_location': {'lat': 40.12, 'lon': -71.34}}
```

### Exemple : Filtrer par distance géographique

Nécessite un index avec un mappage `geo_point` à déclarer pour `metadata.geo_location`.

```python
docs = db.similarity_search(
    "Any mention about Fred?",
    filter=[
        {
            "geo_distance": {
                "distance": "200km",
                "metadata.geo_location": {"lat": 40, "lon": -70},
            }
        }
    ],
)
print(docs[0].metadata)
```

Le filtrage prend en charge de nombreux autres types de requêtes que ceux ci-dessus.

En savoir plus dans la [documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html).

# Algorithme de similarité de distance

Elasticsearch prend en charge les algorithmes de similarité de vecteur de distance suivants :

- cosinus
- euclidien
- dot_product

L'algorithme de similarité du cosinus est le paramètre par défaut.

Vous pouvez spécifier l'algorithme de similarité nécessaire via le paramètre de similarité.

**REMARQUE**
Selon la stratégie de récupération, l'algorithme de similarité ne peut pas être modifié au moment de la requête. Il doit être défini lors de la création de la cartographie des index pour le champ. Si vous devez changer l'algorithme de similarité, vous devez supprimer l'index et le recréer avec la bonne distance_strategy.

```python

db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    distance_strategy="COSINE"
    # distance_strategy="EUCLIDEAN_DISTANCE"
    # distance_strategy="DOT_PRODUCT"
)

```

# Stratégies de récupération

Elasticsearch présente de grands avantages par rapport aux autres bases de données vectorielles grâce à sa capacité à prendre en charge une large gamme de stratégies de récupération. Dans ce notebook, nous configurerons `ElasticsearchStore` pour prendre en charge certaines des stratégies de récupération les plus courantes.

Par défaut, `ElasticsearchStore` utilise la `ApproxRetrievalStrategy`.

## ApproxRetrievalStrategy

Cela renverra les `k` vecteurs les plus similaires à la requête. Le paramètre `k` est défini lors de l'initialisation de `ElasticsearchStore`. La valeur par défaut est `10`.

```python
db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(),
)

docs = db.similarity_search(
    query="What did the president say about Ketanji Brown Jackson?", k=10
)
```

### Exemple : Approx avec hybride

Cet exemple montrera comment configurer `ElasticsearchStore` pour effectuer une récupération hybride, en utilisant une combinaison de recherche sémantique approximative et de recherche basée sur les mots-clés.

Nous utilisons RRF pour équilibrer les deux scores provenant de différentes méthodes de récupération.

Pour activer la récupération hybride, nous devons définir `hybrid=True` dans le constructeur `ApproxRetrievalStrategy` de `ElasticsearchStore`.

```python

db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(
        hybrid=True,
    )
)
```

Lorsque `hybrid` est activé, la requête effectuée sera une combinaison de recherche sémantique approximative et de recherche basée sur les mots-clés.

Il utilisera `rrf` (Reciprocal Rank Fusion) pour équilibrer les deux scores provenant de différentes méthodes de récupération.

**Remarque** RRF nécessite Elasticsearch 8.9.0 ou supérieur.

```json
{
    "knn": {
        "field": "vector",
        "filter": [],
        "k": 1,
        "num_candidates": 50,
        "query_vector": [1.0, ..., 0.0],
    },
    "query": {
        "bool": {
            "filter": [],
            "must": [{"match": {"text": {"query": "foo"}}}],
        }
    },
    "rank": {"rrf": {}},
}
```

### Exemple : Approx avec le modèle d'intégration dans Elasticsearch

Cet exemple montrera comment configurer `ElasticsearchStore` pour utiliser le modèle d'intégration déployé dans Elasticsearch pour la récupération approximative.

Pour utiliser cela, spécifiez l'identifiant du modèle dans le constructeur `ApproxRetrievalStrategy` de `ElasticsearchStore` via l'argument `query_model_id`.

**REMARQUE** Cela nécessite que le modèle soit déployé et en cours d'exécution dans le nœud ml d'Elasticsearch. Voir [l'exemple de notebook](https://github.com/elastic/elasticsearch-labs/blob/main/notebooks/integrations/hugging-face/loading-model-from-hugging-face.md) sur la façon de déployer le modèle avec eland.

```python
APPROX_SELF_DEPLOYED_INDEX_NAME = "test-approx-self-deployed"

# Note: This does not have an embedding function specified
# Instead, we will use the embedding model deployed in Elasticsearch
db = ElasticsearchStore(
    es_cloud_id="<your cloud id>",
    es_user="elastic",
    es_password="<your password>",
    index_name=APPROX_SELF_DEPLOYED_INDEX_NAME,
    query_field="text_field",
    vector_query_field="vector_query_field.predicted_value",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(
        query_model_id="sentence-transformers__all-minilm-l6-v2"
    ),
)

# Setup a Ingest Pipeline to perform the embedding
# of the text field
db.client.ingest.put_pipeline(
    id="test_pipeline",
    processors=[
        {
            "inference": {
                "model_id": "sentence-transformers__all-minilm-l6-v2",
                "field_map": {"query_field": "text_field"},
                "target_field": "vector_query_field",
            }
        }
    ],
)

# creating a new index with the pipeline,
# not relying on langchain to create the index
db.client.indices.create(
    index=APPROX_SELF_DEPLOYED_INDEX_NAME,
    mappings={
        "properties": {
            "text_field": {"type": "text"},
            "vector_query_field": {
                "properties": {
                    "predicted_value": {
                        "type": "dense_vector",
                        "dims": 384,
                        "index": True,
                        "similarity": "l2_norm",
                    }
                }
            },
        }
    },
    settings={"index": {"default_pipeline": "test_pipeline"}},
)

db.from_texts(
    ["hello world"],
    es_cloud_id="<cloud id>",
    es_user="elastic",
    es_password="<cloud password>",
    index_name=APPROX_SELF_DEPLOYED_INDEX_NAME,
    query_field="text_field",
    vector_query_field="vector_query_field.predicted_value",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(
        query_model_id="sentence-transformers__all-minilm-l6-v2"
    ),
)

# Perform search
db.similarity_search("hello world", k=10)
```

## SparseVectorRetrievalStrategy (ELSER)

Cette stratégie utilise la récupération de vecteurs épars d'Elasticsearch pour récupérer les k premiers résultats. Nous ne prenons en charge que notre propre modèle d'intégration "ELSER" pour le moment.

**REMARQUE** Cela nécessite que le modèle ELSER soit déployé et en cours d'exécution dans le nœud ml d'Elasticsearch.

Pour l'utiliser, spécifiez `SparseVectorRetrievalStrategy` dans le constructeur `ElasticsearchStore`.

```python
# Note that this example doesn't have an embedding function. This is because we infer the tokens at index time and at query time within Elasticsearch.
# This requires the ELSER model to be loaded and running in Elasticsearch.
db = ElasticsearchStore.from_documents(
    docs,
    es_cloud_id="My_deployment:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQ2OGJhMjhmNDc1M2Y0MWVjYTk2NzI2ZWNkMmE5YzRkNyQ3NWI4ODRjNWQ2OTU0MTYzODFjOTkxNmQ1YzYxMGI1Mw==",
    es_user="elastic",
    es_password="GgUPiWKwEzgHIYdHdgPk1Lwi",
    index_name="test-elser",
    strategy=ElasticsearchStore.SparseVectorRetrievalStrategy(),
)

db.client.indices.refresh(index="test-elser")

results = db.similarity_search(
    "What did the president say about Ketanji Brown Jackson", k=4
)
print(results[0])
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

## ExactRetrievalStrategy

Cette stratégie utilise la récupération exacte (également connue sous le nom de force brute) d'Elasticsearch pour récupérer les k premiers résultats.

Pour l'utiliser, spécifiez `ExactRetrievalStrategy` dans le constructeur `ElasticsearchStore`.

```python

db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    strategy=ElasticsearchStore.ExactRetrievalStrategy()
)
```

## BM25RetrievalStrategy

Cette stratégie permet à l'utilisateur d'effectuer des recherches en utilisant uniquement BM25 sans recherche vectorielle.

Pour l'utiliser, spécifiez `BM25RetrievalStrategy` dans le constructeur `ElasticsearchStore`.

Notez que dans l'exemple ci-dessous, l'option d'intégration n'est pas spécifiée, indiquant que la recherche est effectuée sans utiliser d'intégrations.

```python
from langchain_elasticsearch import ElasticsearchStore

db = ElasticsearchStore(
    es_url="http://localhost:9200",
    index_name="test_index",
    strategy=ElasticsearchStore.BM25RetrievalStrategy(),
)

db.add_texts(
    ["foo", "foo bar", "foo bar baz", "bar", "bar baz", "baz"],
)

results = db.similarity_search(query="foo", k=10)
print(results)
```

```output
[Document(page_content='foo'), Document(page_content='foo bar'), Document(page_content='foo bar baz')]
```

## Personnaliser la requête

Avec le paramètre `custom_query` lors de la recherche, vous pouvez ajuster la requête utilisée pour récupérer les documents d'Elasticsearch. Cela est utile si vous voulez utiliser une requête plus complexe, pour prendre en charge le boosting linéaire des champs.

```python
# Example of a custom query thats just doing a BM25 search on the text field.
def custom_query(query_body: dict, query: str):
    """Custom query to be used in Elasticsearch.
    Args:
        query_body (dict): Elasticsearch query body.
        query (str): Query string.
    Returns:
        dict: Elasticsearch query body.
    """
    print("Query Retriever created by the retrieval strategy:")
    print(query_body)
    print()

    new_query_body = {"query": {"match": {"text": query}}}

    print("Query thats actually used in Elasticsearch:")
    print(new_query_body)
    print()

    return new_query_body


results = db.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    k=4,
    custom_query=custom_query,
)
print("Results:")
print(results[0])
```

```output
Query Retriever created by the retrieval strategy:
{'query': {'bool': {'must': [{'text_expansion': {'vector.tokens': {'model_id': '.elser_model_1', 'model_text': 'What did the president say about Ketanji Brown Jackson'}}}], 'filter': []}}}

Query thats actually used in Elasticsearch:
{'query': {'match': {'text': 'What did the president say about Ketanji Brown Jackson'}}}

Results:
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

# Personnaliser le générateur de documents

Avec le paramètre `doc_builder` lors de la recherche, vous pouvez ajuster la façon dont un document est construit à l'aide des données récupérées d'Elasticsearch. Cela est particulièrement utile si vous avez des index qui n'ont pas été créés à l'aide de Langchain.

```python
from typing import Dict

from langchain_core.documents import Document


def custom_document_builder(hit: Dict) -> Document:
    src = hit.get("_source", {})
    return Document(
        page_content=src.get("content", "Missing content!"),
        metadata={
            "page_number": src.get("page_number", -1),
            "original_filename": src.get("original_filename", "Missing filename!"),
        },
    )


results = db.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    k=4,
    doc_builder=custom_document_builder,
)
print("Results:")
print(results[0])
```

# FAQ

## Question : Je reçois des erreurs de délai d'attente lors de l'indexation de documents dans Elasticsearch. Comment puis-je résoudre ce problème ?

Un problème possible est que vos documents peuvent prendre plus de temps à indexer dans Elasticsearch. ElasticsearchStore utilise l'API Elasticsearch bulk qui a quelques paramètres par défaut que vous pouvez ajuster pour réduire les risques d'erreurs de délai d'attente.

C'est également une bonne idée lorsque vous utilisez SparseVectorRetrievalStrategy.

Les paramètres par défaut sont :
- `chunk_size` : 500
- `max_chunk_bytes` : 100 Mo

Pour ajuster ces paramètres, vous pouvez passer les paramètres `chunk_size` et `max_chunk_bytes` à la méthode `add_texts` de ElasticsearchStore.

```python
    vector_store.add_texts(
        texts,
        bulk_kwargs={
            "chunk_size": 50,
            "max_chunk_bytes": 200000000
        }
    )
```

# Mise à niveau vers ElasticsearchStore

Si vous utilisez déjà Elasticsearch dans votre projet basé sur Langchain, vous utilisez peut-être les anciennes implémentations : `ElasticVectorSearch` et `ElasticKNNSearch` qui sont maintenant obsolètes. Nous avons introduit une nouvelle implémentation appelée `ElasticsearchStore` qui est plus flexible et plus facile à utiliser. Ce notebook vous guidera à travers le processus de mise à niveau vers la nouvelle implémentation.

## Quoi de neuf ?

La nouvelle implémentation est maintenant une seule classe appelée `ElasticsearchStore` qui peut être utilisée pour la récupération de recherche approx, exacte et ELSER, via des stratégies.

## J'utilise ElasticKNNSearch

Ancienne implémentation :

```python

from langchain_community.vectorstores.elastic_vector_search import ElasticKNNSearch

db = ElasticKNNSearch(
  elasticsearch_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding
)

```

Nouvelle implémentation :

```python

from langchain_elasticsearch import ElasticsearchStore

db = ElasticsearchStore(
  es_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding,
  # if you use the model_id
  # strategy=ElasticsearchStore.ApproxRetrievalStrategy( query_model_id="test_model" )
  # if you use hybrid search
  # strategy=ElasticsearchStore.ApproxRetrievalStrategy( hybrid=True )
)

```

## J'utilise ElasticVectorSearch

Ancienne implémentation :

```python

from langchain_community.vectorstores.elastic_vector_search import ElasticVectorSearch

db = ElasticVectorSearch(
  elasticsearch_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding
)

```

Nouvelle implémentation :

```python

from langchain_elasticsearch import ElasticsearchStore

db = ElasticsearchStore(
  es_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding,
  strategy=ElasticsearchStore.ExactRetrievalStrategy()
)

```

```python
db.client.indices.delete(
    index="test-metadata, test-elser, test-basic",
    ignore_unavailable=True,
    allow_no_indices=True,
)
```

```output
ObjectApiResponse({'acknowledged': True})
```
