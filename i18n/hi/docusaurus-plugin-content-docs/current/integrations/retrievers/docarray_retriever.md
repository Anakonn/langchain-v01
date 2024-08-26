---
translated: true
---

# DocArray

>[DocArray](https://github.com/docarray/docarray) एक बहुमुखी, ओपन-सोर्स टूल है जो आपके बहु-मोडल डेटा को प्रबंधित करने में मदद करता है। यह आपको अपने डेटा को जैसा चाहें बना लेने देता है, और विभिन्न दस्तावेज़ इंडेक्स बैकएंड का उपयोग करके इसे संग्रहित और खोजने की लचीलापन प्रदान करता है। और यह और भी बेहतर हो जाता है - आप अपने `DocArray` दस्तावेज़ इंडेक्स का उपयोग करके एक `DocArrayRetriever` बना सकते हैं, और शानदार Langchain ऐप बना सकते हैं!

यह नोटबुक दो खंडों में विभाजित है। [पहला खंड](#document-index-backends) सभी पांच समर्थित दस्तावेज़ इंडेक्स बैकएंड का परिचय देता है। यह प्रत्येक बैकएंड को सेट अप और इंडेक्स करने के लिए मार्गदर्शन प्रदान करता है और आपको `DocArrayRetriever` बनाने के बारे में भी बताता है जिससे प्रासंगिक दस्तावेज़ ढूंढे जा सकें।
[दूसरे खंड](#movie-retrieval-using-hnswdocumentindex) में, हम इन बैकएंड में से एक का चयन करेंगे और एक मूल उदाहरण के माध्यम से इसका उपयोग करना दिखाएंगे।

## Document Index Backends

```python
import random

from docarray import BaseDoc
from docarray.typing import NdArray
from langchain_community.embeddings import FakeEmbeddings
from langchain_community.retrievers import DocArrayRetriever

embeddings = FakeEmbeddings(size=32)
```

इंडेक्स बनाने से पहले, यह महत्वपूर्ण है कि आप अपने दस्तावेज़ स्कीमा को परिभाषित करें। यह निर्धारित करता है कि आपके दस्तावेज़ में कौन से फ़ील्ड होंगे और प्रत्येक फ़ील्ड में कौन सा डेटा प्रकार होगा।

इस प्रदर्शन के लिए, हम कुछ रैंडम स्कीमा बनाएंगे जिसमें 'title' (str), 'title_embedding' (numpy array), 'year' (int), और 'color' (str) शामिल हैं।

```python
class MyDoc(BaseDoc):
    title: str
    title_embedding: NdArray[32]
    year: int
    color: str
```

### InMemoryExactNNIndex

`InMemoryExactNNIndex` सभी दस्तावेज़ों को मेमोरी में संग्रहित करता है। यह छोटे डेटासेट के लिए एक शानदार शुरुआती बिंदु है, जहां आप किसी डेटाबेस सर्वर को लॉन्च करना नहीं चाहते।

अधिक जानकारी यहां पर: https://docs.docarray.org/user_guide/storing/index_in_memory/

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

`HnswDocumentIndex` एक हल्का दस्तावेज़ इंडेक्स कार्यान्वयन है जो पूरी तरह से स्थानीय रूप से चलता है और छोटे से मध्यम आकार के डेटासेट के लिए सबसे उपयुक्त है। यह [hnswlib](https://github.com/nmslib/hnswlib) में वेक्टर को डिस्क पर संग्रहित करता है, और अन्य सभी डेटा को [SQLite](https://www.sqlite.org/index.html) में संग्रहित करता है।

अधिक जानकारी यहां पर: https://docs.docarray.org/user_guide/storing/index_hnswlib/

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

`WeaviateDocumentIndex` एक दस्तावेज़ इंडेक्स है जो [Weaviate](https://weaviate.io/) वेक्टर डेटाबेस पर बनाया गया है।

अधिक जानकारी यहां पर: https://docs.docarray.org/user_guide/storing/index_weaviate/

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

`ElasticDocIndex` एक दस्तावेज़ इंडेक्स है जो [ElasticSearch](https://github.com/elastic/elasticsearch) पर बनाया गया है।

अधिक जानकारी [यहां](https://docs.docarray.org/user_guide/storing/index_elastic/) पर।

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

`QdrantDocumentIndex` एक दस्तावेज़ इंडेक्स है जो [Qdrant](https://qdrant.tech/) वेक्टर डेटाबेस पर बनाया गया है।

अधिक जानकारी [यहां](https://docs.docarray.org/user_guide/storing/index_qdrant/) पर।

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

## HnswDocumentIndex का उपयोग करके मूवी पुनर्प्राप्ति

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

### सामान्य Retriever

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

### फ़िल्टर के साथ Retriever

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

### MMR खोज के साथ Retriever

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
