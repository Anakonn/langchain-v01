---
translated: true
---

# DocArray

>[DocArray](https://github.com/docarray/docarray)는 다중 모달 데이터를 관리하기 위한 다재다능한 오픈 소스 도구입니다. 데이터를 원하는 대로 구조화할 수 있으며, 다양한 문서 인덱스 백엔드를 사용하여 저장하고 검색할 수 있는 유연성을 제공합니다. 더 좋은 점은 `DocArray` 문서 인덱스를 사용하여 `DocArrayRetriever`를 만들고 멋진 Langchain 앱을 구축할 수 있다는 것입니다!

이 노트북은 두 개의 섹션으로 나뉩니다. [첫 번째 섹션](#document-index-backends)에서는 지원되는 5가지 문서 인덱스 백엔드에 대한 소개를 제공합니다. 각 백엔드의 설정 및 인덱싱 방법과 관련 문서를 찾는 `DocArrayRetriever`를 구축하는 방법을 안내합니다.
[두 번째 섹션](#movie-retrieval-using-hnswdocumentindex)에서는 이러한 백엔드 중 하나를 선택하고 기본 예제를 통해 사용 방법을 보여줍니다.

## 문서 인덱스 백엔드

```python
import random

from docarray import BaseDoc
from docarray.typing import NdArray
from langchain_community.embeddings import FakeEmbeddings
from langchain_community.retrievers import DocArrayRetriever

embeddings = FakeEmbeddings(size=32)
```

인덱스를 구축하기 전에 문서 스키마를 정의하는 것이 중요합니다. 이를 통해 문서의 필드와 각 필드의 데이터 유형을 결정할 수 있습니다.

이 데모에서는 'title'(str), 'title_embedding'(numpy array), 'year'(int), 'color'(str)로 구성된 약간 임의적인 스키마를 만들겠습니다.

```python
class MyDoc(BaseDoc):
    title: str
    title_embedding: NdArray[32]
    year: int
    color: str
```

### InMemoryExactNNIndex

`InMemoryExactNNIndex`는 모든 문서를 메모리에 저장합니다. 작은 데이터셋에서 데이터베이스 서버를 실행하지 않으려는 경우 좋은 시작점이 됩니다.

자세한 내용은 여기에서 확인하세요: https://docs.docarray.org/user_guide/storing/index_in_memory/

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

`HnswDocumentIndex`는 로컬에서 완전히 실행되는 가벼운 문서 인덱스 구현으로, 소규모에서 중규모 데이터셋에 가장 적합합니다. [hnswlib](https://github.com/nmslib/hnswlib)에 벡터를 디스크에 저장하고 [SQLite](https://www.sqlite.org/index.html)에 다른 모든 데이터를 저장합니다.

자세한 내용은 여기에서 확인하세요: https://docs.docarray.org/user_guide/storing/index_hnswlib/

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

`WeaviateDocumentIndex`는 [Weaviate](https://weaviate.io/) 벡터 데이터베이스를 기반으로 구축된 문서 인덱스입니다.

자세한 내용은 여기에서 확인하세요: https://docs.docarray.org/user_guide/storing/index_weaviate/

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

`ElasticDocIndex`는 [ElasticSearch](https://github.com/elastic/elasticsearch)를 기반으로 구축된 문서 인덱스입니다.

자세한 내용은 [여기](https://docs.docarray.org/user_guide/storing/index_elastic/)에서 확인하세요.

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

`QdrantDocumentIndex`는 [Qdrant](https://qdrant.tech/) 벡터 데이터베이스를 기반으로 구축된 문서 인덱스입니다.

자세한 내용은 [여기](https://docs.docarray.org/user_guide/storing/index_qdrant/)에서 확인하세요.

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

## HnswDocumentIndex를 사용한 영화 검색

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

### 일반 검색기

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

### 필터링 검색기

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

### MMR 검색기

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
