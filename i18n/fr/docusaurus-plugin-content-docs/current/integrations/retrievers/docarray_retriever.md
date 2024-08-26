---
translated: true
---

# DocArray

>[DocArray](https://github.com/docarray/docarray) est un outil polyvalent et open-source pour gérer vos données multimodales. Il vous permet de façonner vos données comme vous le souhaitez et offre la flexibilité de les stocker et de les rechercher à l'aide de différents backends d'index de documents. Et ce n'est pas tout - vous pouvez utiliser l'index de documents de votre `DocArray` pour créer un `DocArrayRetriever` et construire de superbes applications Langchain !

Ce notebook est divisé en deux sections. La [première section](#document-index-backends) propose une introduction à tous les cinq backends d'index de documents pris en charge. Elle fournit des conseils sur la configuration et l'indexation de chaque backend et vous indique également comment construire un `DocArrayRetriever` pour trouver les documents pertinents.
Dans la [deuxième section](#movie-retrieval-using-hnswdocumentindex), nous sélectionnerons l'un de ces backends et illustrerons son utilisation à travers un exemple de base.

## Backends d'index de documents

```python
import random

from docarray import BaseDoc
from docarray.typing import NdArray
from langchain_community.embeddings import FakeEmbeddings
from langchain_community.retrievers import DocArrayRetriever

embeddings = FakeEmbeddings(size=32)
```

Avant de commencer à construire l'index, il est important de définir le schéma de vos documents. Cela détermine les champs que vos documents auront et le type de données que chaque champ contiendra.

Pour cette démonstration, nous allons créer un schéma quelque peu aléatoire contenant 'title' (str), 'title_embedding' (numpy array), 'year' (int) et 'color' (str)

```python
class MyDoc(BaseDoc):
    title: str
    title_embedding: NdArray[32]
    year: int
    color: str
```

### InMemoryExactNNIndex

`InMemoryExactNNIndex` stocke tous les Documents en mémoire. C'est un bon point de départ pour les petits jeux de données, lorsque vous ne souhaitez pas lancer un serveur de base de données.

En savoir plus ici : https://docs.docarray.org/user_guide/storing/index_in_memory/

```python
from docarray.index import InMemoryExactNNIndex

# initialize the index
db = InMemoryExactNNIndex[MyDoc]()
# index data
db.index(
    [
        MyDoc(
            title=f"My document {i}",
            title_embedding=embeddings.embed_query(f"query {i}"),
            year=i,
            color=random.choice(["red", "green", "blue"]),
        )
        for i in range(100)
    ]
)
# optionally, you can create a filter query
filter_query = {"year": {"$lte": 90}}
```

```python
# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="title_embedding",
    content_field="title",
    filters=filter_query,
)

# find the relevant document
doc = retriever.invoke("some query")
print(doc)
```

```output
[Document(page_content='My document 56', metadata={'id': '1f33e58b6468ab722f3786b96b20afe6', 'year': 56, 'color': 'red'})]
```

### HnswDocumentIndex

`HnswDocumentIndex` est une implémentation légère d'index de documents qui s'exécute entièrement en local et convient le mieux aux jeux de données de petite à moyenne taille. Il stocke les vecteurs sur le disque dans [hnswlib](https://github.com/nmslib/hnswlib) et stocke toutes les autres données dans [SQLite](https://www.sqlite.org/index.html).

En savoir plus ici : https://docs.docarray.org/user_guide/storing/index_hnswlib/

```python
from docarray.index import HnswDocumentIndex

# initialize the index
db = HnswDocumentIndex[MyDoc](work_dir="hnsw_index")

# index data
db.index(
    [
        MyDoc(
            title=f"My document {i}",
            title_embedding=embeddings.embed_query(f"query {i}"),
            year=i,
            color=random.choice(["red", "green", "blue"]),
        )
        for i in range(100)
    ]
)
# optionally, you can create a filter query
filter_query = {"year": {"$lte": 90}}
```

```python
# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="title_embedding",
    content_field="title",
    filters=filter_query,
)

# find the relevant document
doc = retriever.invoke("some query")
print(doc)
```

```output
[Document(page_content='My document 28', metadata={'id': 'ca9f3f4268eec7c97a7d6e77f541cb82', 'year': 28, 'color': 'red'})]
```

### WeaviateDocumentIndex

`WeaviateDocumentIndex` est un index de documents qui est construit sur la base de la base de données vectorielle [Weaviate](https://weaviate.io/).

En savoir plus ici : https://docs.docarray.org/user_guide/storing/index_weaviate/

```python
# There's a small difference with the Weaviate backend compared to the others.
# Here, you need to 'mark' the field used for vector search with 'is_embedding=True'.
# So, let's create a new schema for Weaviate that takes care of this requirement.

from pydantic import Field


class WeaviateDoc(BaseDoc):
    title: str
    title_embedding: NdArray[32] = Field(is_embedding=True)
    year: int
    color: str
```

```python
from docarray.index import WeaviateDocumentIndex

# initialize the index
dbconfig = WeaviateDocumentIndex.DBConfig(host="http://localhost:8080")
db = WeaviateDocumentIndex[WeaviateDoc](db_config=dbconfig)

# index data
db.index(
    [
        MyDoc(
            title=f"My document {i}",
            title_embedding=embeddings.embed_query(f"query {i}"),
            year=i,
            color=random.choice(["red", "green", "blue"]),
        )
        for i in range(100)
    ]
)
# optionally, you can create a filter query
filter_query = {"path": ["year"], "operator": "LessThanEqual", "valueInt": "90"}
```

```python
# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="title_embedding",
    content_field="title",
    filters=filter_query,
)

# find the relevant document
doc = retriever.invoke("some query")
print(doc)
```

```output
[Document(page_content='My document 17', metadata={'id': '3a5b76e85f0d0a01785dc8f9d965ce40', 'year': 17, 'color': 'red'})]
```

### ElasticDocIndex

`ElasticDocIndex` est un index de documents qui est construit sur la base d'[ElasticSearch](https://github.com/elastic/elasticsearch)

En savoir plus [ici](https://docs.docarray.org/user_guide/storing/index_elastic/)

```python
from docarray.index import ElasticDocIndex

# initialize the index
db = ElasticDocIndex[MyDoc](
    hosts="http://localhost:9200", index_name="docarray_retriever"
)

# index data
db.index(
    [
        MyDoc(
            title=f"My document {i}",
            title_embedding=embeddings.embed_query(f"query {i}"),
            year=i,
            color=random.choice(["red", "green", "blue"]),
        )
        for i in range(100)
    ]
)
# optionally, you can create a filter query
filter_query = {"range": {"year": {"lte": 90}}}
```

```python
# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="title_embedding",
    content_field="title",
    filters=filter_query,
)

# find the relevant document
doc = retriever.invoke("some query")
print(doc)
```

```output
[Document(page_content='My document 46', metadata={'id': 'edbc721bac1c2ad323414ad1301528a4', 'year': 46, 'color': 'green'})]
```

### QdrantDocumentIndex

`QdrantDocumentIndex` est un index de documents qui est construit sur la base de la base de données vectorielle [Qdrant](https://qdrant.tech/)

En savoir plus [ici](https://docs.docarray.org/user_guide/storing/index_qdrant/)

```python
from docarray.index import QdrantDocumentIndex
from qdrant_client.http import models as rest

# initialize the index
qdrant_config = QdrantDocumentIndex.DBConfig(path=":memory:")
db = QdrantDocumentIndex[MyDoc](qdrant_config)

# index data
db.index(
    [
        MyDoc(
            title=f"My document {i}",
            title_embedding=embeddings.embed_query(f"query {i}"),
            year=i,
            color=random.choice(["red", "green", "blue"]),
        )
        for i in range(100)
    ]
)
# optionally, you can create a filter query
filter_query = rest.Filter(
    must=[
        rest.FieldCondition(
            key="year",
            range=rest.Range(
                gte=10,
                lt=90,
            ),
        )
    ]
)
```

```output
WARNING:root:Payload indexes have no effect in the local Qdrant. Please use server Qdrant if you need payload indexes.
```

```python
# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="title_embedding",
    content_field="title",
    filters=filter_query,
)

# find the relevant document
doc = retriever.invoke("some query")
print(doc)
```

```output
[Document(page_content='My document 80', metadata={'id': '97465f98d0810f1f330e4ecc29b13d20', 'year': 80, 'color': 'blue'})]
```

## Récupération de films à l'aide de HnswDocumentIndex

```python
movies = [
    {
        "title": "Inception",
        "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the task of planting an idea into the mind of a CEO.",
        "director": "Christopher Nolan",
        "rating": 8.8,
    },
    {
        "title": "The Dark Knight",
        "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        "director": "Christopher Nolan",
        "rating": 9.0,
    },
    {
        "title": "Interstellar",
        "description": "Interstellar explores the boundaries of human exploration as a group of astronauts venture through a wormhole in space. In their quest to ensure the survival of humanity, they confront the vastness of space-time and grapple with love and sacrifice.",
        "director": "Christopher Nolan",
        "rating": 8.6,
    },
    {
        "title": "Pulp Fiction",
        "description": "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        "director": "Quentin Tarantino",
        "rating": 8.9,
    },
    {
        "title": "Reservoir Dogs",
        "description": "When a simple jewelry heist goes horribly wrong, the surviving criminals begin to suspect that one of them is a police informant.",
        "director": "Quentin Tarantino",
        "rating": 8.3,
    },
    {
        "title": "The Godfather",
        "description": "An aging patriarch of an organized crime dynasty transfers control of his empire to his reluctant son.",
        "director": "Francis Ford Coppola",
        "rating": 9.2,
    },
]
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key: ········
```

```python
from docarray import BaseDoc, DocList
from docarray.typing import NdArray
from langchain_openai import OpenAIEmbeddings


# define schema for your movie documents
class MyDoc(BaseDoc):
    title: str
    description: str
    description_embedding: NdArray[1536]
    rating: float
    director: str


embeddings = OpenAIEmbeddings()


# get "description" embeddings, and create documents
docs = DocList[MyDoc](
    [
        MyDoc(
            description_embedding=embeddings.embed_query(movie["description"]), **movie
        )
        for movie in movies
    ]
)
```

```python
from docarray.index import HnswDocumentIndex

# initialize the index
db = HnswDocumentIndex[MyDoc](work_dir="movie_search")

# add data
db.index(docs)
```

### Récupérateur normal

```python
from langchain.retrievers import DocArrayRetriever

# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="description_embedding",
    content_field="description",
)

# find the relevant document
doc = retriever.invoke("movie about dreams")
print(doc)
```

```output
[Document(page_content='A thief who steals corporate secrets through the use of dream-sharing technology is given the task of planting an idea into the mind of a CEO.', metadata={'id': 'f1649d5b6776db04fec9a116bbb6bbe5', 'title': 'Inception', 'rating': 8.8, 'director': 'Christopher Nolan'})]
```

### Récupérateur avec filtres

```python
from langchain.retrievers import DocArrayRetriever

# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="description_embedding",
    content_field="description",
    filters={"director": {"$eq": "Christopher Nolan"}},
    top_k=2,
)

# find relevant documents
docs = retriever.invoke("space travel")
print(docs)
```

```output
[Document(page_content='Interstellar explores the boundaries of human exploration as a group of astronauts venture through a wormhole in space. In their quest to ensure the survival of humanity, they confront the vastness of space-time and grapple with love and sacrifice.', metadata={'id': 'ab704cc7ae8573dc617f9a5e25df022a', 'title': 'Interstellar', 'rating': 8.6, 'director': 'Christopher Nolan'}), Document(page_content='A thief who steals corporate secrets through the use of dream-sharing technology is given the task of planting an idea into the mind of a CEO.', metadata={'id': 'f1649d5b6776db04fec9a116bbb6bbe5', 'title': 'Inception', 'rating': 8.8, 'director': 'Christopher Nolan'})]
```

### Récupérateur avec recherche MMR

```python
from langchain.retrievers import DocArrayRetriever

# create a retriever
retriever = DocArrayRetriever(
    index=db,
    embeddings=embeddings,
    search_field="description_embedding",
    content_field="description",
    filters={"rating": {"$gte": 8.7}},
    search_type="mmr",
    top_k=3,
)

# find relevant documents
docs = retriever.invoke("action movies")
print(docs)
```

```output
[Document(page_content="The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.", metadata={'id': 'e6aa313bbde514e23fbc80ab34511afd', 'title': 'Pulp Fiction', 'rating': 8.9, 'director': 'Quentin Tarantino'}), Document(page_content='A thief who steals corporate secrets through the use of dream-sharing technology is given the task of planting an idea into the mind of a CEO.', metadata={'id': 'f1649d5b6776db04fec9a116bbb6bbe5', 'title': 'Inception', 'rating': 8.8, 'director': 'Christopher Nolan'}), Document(page_content='When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', metadata={'id': '91dec17d4272041b669fd113333a65f7', 'title': 'The Dark Knight', 'rating': 9.0, 'director': 'Christopher Nolan'})]
```
