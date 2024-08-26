---
translated: true
---

# Elasticsearch

> [Elasticsearch](https://www.elastic.co/elasticsearch/) est un moteur de recherche et d'analyse distribué et RESTful.
> Il fournit un moteur de recherche en texte intégral distribué, multi-locataire avec une interface Web HTTP et des documents JSON sans schéma.

Dans ce notebook, nous allons démontrer le `SelfQueryRetriever` avec un magasin de vecteurs `Elasticsearch`.

## Création d'un magasin de vecteurs Elasticsearch

Tout d'abord, nous voulons créer un magasin de vecteurs `Elasticsearch` et le remplir avec quelques données. Nous avons créé un petit ensemble de documents de démonstration contenant des résumés de films.

**Remarque :** Le récupérateur d'auto-requête nécessite que vous ayez `lark` installé (`pip install lark`). Nous avons également besoin du package `elasticsearch`.

```python
%pip install --upgrade --quiet  U lark langchain langchain-elasticsearch
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3 is available.
You should consider upgrading via the '/Users/joe/projects/elastic/langchain/libs/langchain/.venv/bin/python3 -m pip install --upgrade pip' command.[0m[33m
[0m
```

```python
import getpass
import os

from langchain_core.documents import Document
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")

embeddings = OpenAIEmbeddings()
```

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "science fiction"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "year": 1979,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
            "rating": 9.9,
        },
    ),
]
vectorstore = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    index_name="elasticsearch-self-query-demo",
    es_url="http://localhost:9200",
)
```

## Création de notre récupérateur d'auto-requête

Maintenant, nous pouvons instancier notre récupérateur. Pour ce faire, nous devrons fournir des informations préalables sur les champs de métadonnées que nos documents prennent en charge et une brève description du contenu des documents.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string or list[string]",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="director",
        description="The name of the movie director",
        type="string",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## Essayons-le

Et maintenant, nous pouvons essayer d'utiliser réellement notre récupérateur !

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.7, 'genre': 'science fiction'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'rating': 9.9, 'director': 'Andrei Tarkovsky', 'genre': 'science fiction'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'director': 'Satoshi Kon', 'rating': 8.6})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'director': 'Greta Gerwig', 'rating': 8.3})]
```

## Filtrer k

Nous pouvons également utiliser le récupérateur d'auto-requête pour spécifier `k` : le nombre de documents à récupérer.

Nous pouvons le faire en passant `enable_limit=True` au constructeur.

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

```python
# This example only specifies a relevant query
retriever.invoke("what are two movies about dinosaurs")
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.7, 'genre': 'science fiction'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

## Des requêtes complexes en action !

Nous avons essayé quelques requêtes simples, mais que dire des requêtes plus complexes ? Essayons quelques autres requêtes plus complexes qui utilisent toute la puissance d'Elasticsearch.

```python
retriever.invoke(
    "what animated or comedy movies have been released in the last 30 years about animated toys?"
)
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

```python
vectorstore.client.indices.delete(index="elasticsearch-self-query-demo")
```
