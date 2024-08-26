---
translated: true
---

# Couchbase

[Couchbase](http://couchbase.com/) est une base de données cloud NoSQL distribuée primée qui offre une polyvalence, des performances, une évolutivité et une valeur financière inégalées pour toutes vos applications cloud, mobiles, d'IA et de calcul en périphérie. Couchbase adopte l'IA avec une assistance de codage pour les développeurs et la recherche vectorielle pour leurs applications.

La recherche vectorielle fait partie du [service de recherche en texte intégral](https://docs.couchbase.com/server/current/learn/services-and-indexes/services/search-service.html) (service de recherche) dans Couchbase.

Ce tutoriel explique comment utiliser la recherche vectorielle dans Couchbase. Vous pouvez travailler à la fois avec [Couchbase Capella](https://www.couchbase.com/products/capella/) et votre serveur Couchbase autogéré.

## Installation

```python
%pip install --upgrade --quiet langchain langchain-openai couchbase
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## Importer le magasin vectoriel et les embeddings

```python
from langchain_community.vectorstores import CouchbaseVectorStore
from langchain_openai import OpenAIEmbeddings
```

## Créer un objet de connexion Couchbase

Nous créons d'abord une connexion au cluster Couchbase, puis nous transmettons l'objet cluster au magasin vectoriel.

Ici, nous nous connectons à l'aide du nom d'utilisateur et du mot de passe. Vous pouvez également vous connecter de toute autre manière prise en charge à votre cluster.

Pour plus d'informations sur la connexion au cluster Couchbase, veuillez consulter la [documentation du SDK Python](https://docs.couchbase.com/python-sdk/current/hello-world/start-using-sdk.html#connect).

```python
COUCHBASE_CONNECTION_STRING = (
    "couchbase://localhost"  # or "couchbases://localhost" if using TLS
)
DB_USERNAME = "Administrator"
DB_PASSWORD = "Password"
```

```python
from datetime import timedelta

from couchbase.auth import PasswordAuthenticator
from couchbase.cluster import Cluster
from couchbase.options import ClusterOptions

auth = PasswordAuthenticator(DB_USERNAME, DB_PASSWORD)
options = ClusterOptions(auth)
cluster = Cluster(COUCHBASE_CONNECTION_STRING, options)

# Wait until the cluster is ready for use.
cluster.wait_until_ready(timedelta(seconds=5))
```

Nous allons maintenant définir les noms de seau, de portée et de collection dans le cluster Couchbase que nous voulons utiliser pour la recherche vectorielle.

Pour cet exemple, nous utilisons la portée et les collections par défaut.

```python
BUCKET_NAME = "testing"
SCOPE_NAME = "_default"
COLLECTION_NAME = "_default"
SEARCH_INDEX_NAME = "vector-index"
```

Pour ce tutoriel, nous utiliserons les embeddings OpenAI

```python
embeddings = OpenAIEmbeddings()
```

## Créer l'index de recherche

Actuellement, l'index de recherche doit être créé à partir de l'interface utilisateur de Couchbase Capella ou Server ou en utilisant l'interface REST.

Définissons un index de recherche avec le nom `vector-index` sur le seau de test

Pour cet exemple, utilisons la fonctionnalité d'importation d'index sur le service de recherche dans l'interface utilisateur.

Nous définissons un index sur le seau `testing`, la portée `_default` et la collection `_default` avec le champ vectoriel défini sur `embedding` avec 1536 dimensions et le champ texte défini sur `text`. Nous indexons et stockons également tous les champs sous `metadata` dans le document en tant que mappage dynamique pour tenir compte des structures de document variables. La métrique de similarité est définie sur `dot_product`.

### Comment importer un index dans le service de recherche en texte intégral ?

 - [Couchbase Server](https://docs.couchbase.com/server/current/search/import-search-index.html)
     - Cliquez sur Recherche -> Ajouter un index -> Importer
     - Copiez la définition d'index suivante dans l'écran d'importation
     - Cliquez sur Créer l'index pour créer l'index.
 - [Couchbase Capella](https://docs.couchbase.com/cloud/search/import-search-index.html)
     - Copiez la définition d'index dans un nouveau fichier `index.json`
     - Importez le fichier dans Capella en suivant les instructions de la documentation.
     - Cliquez sur Créer l'index pour créer l'index.

### Définition de l'index

```json
{
 "name": "vector-index",
 "type": "fulltext-index",
 "params": {
  "doc_config": {
   "docid_prefix_delim": "",
   "docid_regexp": "",
   "mode": "type_field",
   "type_field": "type"
  },
  "mapping": {
   "default_analyzer": "standard",
   "default_datetime_parser": "dateTimeOptional",
   "default_field": "_all",
   "default_mapping": {
    "dynamic": true,
    "enabled": true,
    "properties": {
     "metadata": {
      "dynamic": true,
      "enabled": true
     },
     "embedding": {
      "enabled": true,
      "dynamic": false,
      "fields": [
       {
        "dims": 1536,
        "index": true,
        "name": "embedding",
        "similarity": "dot_product",
        "type": "vector",
        "vector_index_optimized_for": "recall"
       }
      ]
     },
     "text": {
      "enabled": true,
      "dynamic": false,
      "fields": [
       {
        "index": true,
        "name": "text",
        "store": true,
        "type": "text"
       }
      ]
     }
    }
   },
   "default_type": "_default",
   "docvalues_dynamic": false,
   "index_dynamic": true,
   "store_dynamic": true,
   "type_field": "_type"
  },
  "store": {
   "indexType": "scorch",
   "segmentVersion": 16
  }
 },
 "sourceType": "gocbcore",
 "sourceName": "testing",
 "sourceParams": {},
 "planParams": {
  "maxPartitionsPerPIndex": 103,
  "indexPartitions": 10,
  "numReplicas": 0
 }
}
```

Pour plus de détails sur la création d'un index de recherche avec prise en charge des champs vectoriels, veuillez consulter la documentation.

- [Couchbase Capella](https://docs.couchbase.com/cloud/vector-search/create-vector-search-index-ui.html)

- [Couchbase Server](https://docs.couchbase.com/server/current/vector-search/create-vector-search-index-ui.html)

## Créer le magasin vectoriel

Nous créons l'objet de magasin vectoriel avec les informations du cluster et le nom de l'index de recherche.

```python
vector_store = CouchbaseVectorStore(
    cluster=cluster,
    bucket_name=BUCKET_NAME,
    scope_name=SCOPE_NAME,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
    index_name=SEARCH_INDEX_NAME,
)
```

### Spécifier les champs Texte et Embeddings

Vous pouvez éventuellement spécifier les champs texte et embeddings du document à l'aide des champs `text_key` et `embedding_key`.

```python
vector_store = CouchbaseVectorStore(
    cluster=cluster,
    bucket_name=BUCKET_NAME,
    scope_name=SCOPE_NAME,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
    index_name=SEARCH_INDEX_NAME,
    text_key="text",
    embedding_key="embedding",
)
```

## Exemple de recherche vectorielle de base

Pour cet exemple, nous allons charger le fichier "state_of_the_union.txt" via le TextLoader, découper le texte en morceaux de 500 caractères sans chevauchement et indexer tous ces morceaux dans Couchbase.

Après l'indexation des données, nous effectuons une requête simple pour trouver les 4 meilleurs morceaux similaires à la requête "Qu'a dit le président à propos de Ketanji Brown Jackson".

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
vector_store = CouchbaseVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    cluster=cluster,
    bucket_name=BUCKET_NAME,
    scope_name=SCOPE_NAME,
    collection_name=COLLECTION_NAME,
    index_name=SEARCH_INDEX_NAME,
)
```

```python
query = "What did president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(query)
print(results[0])
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

## Recherche de similarité avec score

Vous pouvez récupérer les scores des résultats en appelant la méthode `similarity_search_with_score`.

```python
query = "What did president say about Ketanji Brown Jackson"
results = vector_store.similarity_search_with_score(query)
document, score = results[0]
print(document)
print(f"Score: {score}")
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
Score: 0.8211871385574341
```

## Spécifier les champs à renvoyer

Vous pouvez spécifier les champs à renvoyer du document à l'aide du paramètre `fields` dans les recherches. Ces champs sont renvoyés dans l'objet `metadata` du document renvoyé. Vous pouvez récupérer n'importe quel champ stocké dans l'index de recherche. Le `text_key` du document est renvoyé dans le `page_content` du document.

Si vous ne spécifiez pas de champs à récupérer, tous les champs stockés dans l'index sont renvoyés.

Si vous voulez récupérer l'un des champs du metadata, vous devez le spécifier à l'aide de `.`

Par exemple, pour récupérer le champ `source` dans le metadata, vous devez spécifier `metadata.source`.

```python
query = "What did president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(query, fields=["metadata.source"])
print(results[0])
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

## Recherche hybride

Couchbase vous permet d'effectuer des recherches hybrides en combinant les résultats de la recherche vectorielle avec les recherches sur les champs non vectoriels du document comme l'objet `metadata`.

Les résultats seront basés sur la combinaison des résultats de la recherche vectorielle et des recherches prises en charge par le service de recherche. Les scores de chacune des recherches composantes sont additionnés pour obtenir le score total du résultat.

Pour effectuer des recherches hybrides, il y a un paramètre facultatif, `search_options` qui peut être transmis à toutes les recherches de similarité.
Les différentes possibilités de recherche/requête pour `search_options` peuvent être trouvées [ici](https://docs.couchbase.com/server/current/search/search-request-params.html#query-object).

### Créer une métadonnée diversifiée pour la recherche hybride

Afin de simuler la recherche hybride, créons quelques métadonnées aléatoires à partir des documents existants.
Nous ajoutons uniformément trois champs aux métadonnées, `date` entre 2010 et 2020, `rating` entre 1 et 5 et `author` défini sur John Doe ou Jane Doe.

```python
# Adding metadata to documents
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"{range(2010, 2020)[i % 10]}-01-01"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["John Doe", "Jane Doe"][i % 2]

vector_store.add_documents(docs)

query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(query)
print(results[0].metadata)
```

```output
{'author': 'John Doe', 'date': '2016-01-01', 'rating': 2, 'source': '../../modules/state_of_the_union.txt'}
```

### Exemple : Recherche par valeur exacte

Nous pouvons rechercher des correspondances exactes sur un champ textuel comme l'auteur dans l'objet `metadata`.

```python
query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(
    query,
    search_options={"query": {"field": "metadata.author", "match": "John Doe"}},
    fields=["metadata.author"],
)
print(results[0])
```

```output
page_content='This is personal to me and Jill, to Kamala, and to so many of you. \n\nCancer is the #2 cause of death in America–second only to heart disease. \n\nLast month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago. \n\nOur goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases.  \n\nMore support for patients and families.' metadata={'author': 'John Doe'}
```

### Exemple : Recherche par correspondance partielle

Nous pouvons rechercher des correspondances partielles en spécifiant une approximation pour la recherche. Cela est utile lorsque vous voulez rechercher de légères variations ou des fautes d'orthographe d'une requête de recherche.

Ici, "Jae" est proche (approximation de 1) de "Jane".

```python
query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(
    query,
    search_options={
        "query": {"field": "metadata.author", "match": "Jae", "fuzziness": 1}
    },
    fields=["metadata.author"],
)
print(results[0])
```

```output
page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.' metadata={'author': 'Jane Doe'}
```

### Exemple : Recherche par requête de plage de dates

Nous pouvons rechercher des documents qui se situent dans une plage de dates sur un champ de date comme `metadata.date`.

```python
query = "Any mention about independence?"
results = vector_store.similarity_search(
    query,
    search_options={
        "query": {
            "start": "2016-12-31",
            "end": "2017-01-02",
            "inclusive_start": True,
            "inclusive_end": False,
            "field": "metadata.date",
        }
    },
)
print(results[0])
```

```output
page_content='He will never extinguish their love of freedom. He will never weaken the resolve of the free world. \n\nWe meet tonight in an America that has lived through two of the hardest years this nation has ever faced. \n\nThe pandemic has been punishing. \n\nAnd so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand.' metadata={'author': 'Jane Doe', 'date': '2017-01-01', 'rating': 3, 'source': '../../modules/state_of_the_union.txt'}
```

### Exemple : Recherche par requête de plage numérique

Nous pouvons rechercher des documents qui se situent dans une plage pour un champ numérique comme `metadata.rating`.

```python
query = "Any mention about independence?"
results = vector_store.similarity_search_with_score(
    query,
    search_options={
        "query": {
            "min": 3,
            "max": 5,
            "inclusive_min": True,
            "inclusive_max": True,
            "field": "metadata.rating",
        }
    },
)
print(results[0])
```

```output
(Document(page_content='He will never extinguish their love of freedom. He will never weaken the resolve of the free world. \n\nWe meet tonight in an America that has lived through two of the hardest years this nation has ever faced. \n\nThe pandemic has been punishing. \n\nAnd so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand.', metadata={'author': 'Jane Doe', 'date': '2017-01-01', 'rating': 3, 'source': '../../modules/state_of_the_union.txt'}), 0.9000703597577832)
```

### Exemple : Combinaison de plusieurs requêtes de recherche

Différentes requêtes de recherche peuvent être combinées à l'aide des opérateurs ET (conjonctions) ou OU (disjonctions).

Dans cet exemple, nous vérifions les documents avec une note entre 3 et 4 et datés entre 2015 et 2018.

```python
query = "Any mention about independence?"
results = vector_store.similarity_search_with_score(
    query,
    search_options={
        "query": {
            "conjuncts": [
                {"min": 3, "max": 4, "inclusive_max": True, "field": "metadata.rating"},
                {"start": "2016-12-31", "end": "2017-01-02", "field": "metadata.date"},
            ]
        }
    },
)
print(results[0])
```

```output
(Document(page_content='He will never extinguish their love of freedom. He will never weaken the resolve of the free world. \n\nWe meet tonight in an America that has lived through two of the hardest years this nation has ever faced. \n\nThe pandemic has been punishing. \n\nAnd so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand.', metadata={'author': 'Jane Doe', 'date': '2017-01-01', 'rating': 3, 'source': '../../modules/state_of_the_union.txt'}), 1.3598770370389914)
```

### Autres requêtes

De même, vous pouvez utiliser l'une des méthodes de requête prises en charge comme la distance géographique, la recherche de polygone, les caractères génériques, les expressions régulières, etc. dans le paramètre `search_options`. Veuillez vous référer à la documentation pour plus de détails sur les méthodes de requête disponibles et leur syntaxe.

- [Couchbase Capella](https://docs.couchbase.com/cloud/search/search-request-params.html#query-object)
- [Couchbase Server](https://docs.couchbase.com/server/current/search/search-request-params.html#query-object)

# Questions fréquemment posées

## Question : Dois-je créer l'index de recherche avant de créer l'objet CouchbaseVectorStore ?

Oui, actuellement vous devez créer l'index de recherche avant de créer l'objet `CouchbaseVectorStore`.

## Question : Je ne vois pas tous les champs que j'ai spécifiés dans mes résultats de recherche.

Dans Couchbase, nous ne pouvons renvoyer que les champs stockés dans l'index de recherche. Assurez-vous que le champ que vous essayez d'accéder dans les résultats de recherche fait partie de l'index de recherche.

Une façon de gérer cela est d'indexer et de stocker dynamiquement les champs d'un document dans l'index.

- Dans Capella, vous devez aller en "Mode avancé", puis sous le chevron "Paramètres généraux" vous pouvez cocher "[X] Stocker les champs dynamiques" ou "[X] Indexer les champs dynamiques"
- Dans Couchbase Server, dans l'éditeur d'index (pas l'éditeur rapide) sous le chevron "Avancé" vous pouvez cocher "[X] Stocker les champs dynamiques" ou "[X] Indexer les champs dynamiques"

Notez que ces options augmenteront la taille de l'index.

Pour plus de détails sur les mappages dynamiques, veuillez vous référer à la [documentation](https://docs.couchbase.com/cloud/search/customize-index.html).

## Question : Je ne peux pas voir l'objet metadata dans mes résultats de recherche.

Cela est probablement dû au champ `metadata` dans le document qui n'est pas indexé et/ou stocké par l'index de recherche Couchbase. Afin d'indexer le champ `metadata` dans le document, vous devez l'ajouter à l'index en tant que mappage enfant.

Si vous sélectionnez de mapper tous les champs dans le mappage, vous pourrez rechercher tous les champs de métadonnées. Sinon, pour optimiser l'index, vous pouvez sélectionner les champs spécifiques à l'intérieur de l'objet `metadata` à indexer. Vous pouvez vous référer à la [documentation](https://docs.couchbase.com/cloud/search/customize-index.html) pour en savoir plus sur l'indexation des mappages enfants.

Création de mappages enfants

* [Couchbase Capella](https://docs.couchbase.com/cloud/search/create-child-mapping.html)
* [Couchbase Server](https://docs.couchbase.com/server/current/search/create-child-mapping.html)
