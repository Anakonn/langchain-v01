---
translated: true
---

# Tencent Cloud VectorDB

> [Tencent Cloud VectorDB](https://cloud.tencent.com/document/product/1709)는 다차원 벡터 데이터를 저장, 검색 및 분석하기 위해 설계된 완전 관리형, 자체 개발, 엔터프라이즈 수준의 분산 데이터베이스 서비스입니다.

이 연습에서는 Tencent Cloud VectorDB와 함께 `SelfQueryRetriever`를 데모할 것입니다.

## TencentVectorDB 인스턴스 생성

먼저 TencentVectorDB를 생성하고 일부 데이터로 채워 보겠습니다. 영화 요약이 포함된 작은 데모 세트의 문서를 만들었습니다.

**참고:** self-query retriever를 사용하려면 `lark`(`pip install lark`)와 통합 관련 요구 사항이 설치되어 있어야 합니다.

```python
%pip install --upgrade --quiet tcvectordb langchain-openai tiktoken lark
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m24.0[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```

`OpenAIEmbeddings`를 사용하려면 OpenAI API 키를 얻어야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

TencentVectorDB 인스턴스를 생성하고 일부 데이터로 채웁니다:

```python
from langchain_community.vectorstores.tencentvectordb import (
    ConnectionParams,
    MetaField,
    TencentVectorDB,
)
from langchain_core.documents import Document
from tcvectordb.model.enum import FieldType

meta_fields = [
    MetaField(name="year", data_type="uint64", index=True),
    MetaField(name="rating", data_type="string", index=False),
    MetaField(name="genre", data_type=FieldType.String, index=True),
    MetaField(name="director", data_type=FieldType.String, index=True),
]

docs = [
    Document(
        page_content="The Shawshank Redemption is a 1994 American drama film written and directed by Frank Darabont.",
        metadata={
            "year": 1994,
            "rating": "9.3",
            "genre": "drama",
            "director": "Frank Darabont",
        },
    ),
    Document(
        page_content="The Godfather is a 1972 American crime film directed by Francis Ford Coppola.",
        metadata={
            "year": 1972,
            "rating": "9.2",
            "genre": "crime",
            "director": "Francis Ford Coppola",
        },
    ),
    Document(
        page_content="The Dark Knight is a 2008 superhero film directed by Christopher Nolan.",
        metadata={
            "year": 2008,
            "rating": "9.0",
            "genre": "science fiction",
            "director": "Christopher Nolan",
        },
    ),
    Document(
        page_content="Inception is a 2010 science fiction action film written and directed by Christopher Nolan.",
        metadata={
            "year": 2010,
            "rating": "8.8",
            "genre": "science fiction",
            "director": "Christopher Nolan",
        },
    ),
    Document(
        page_content="The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.",
        metadata={
            "year": 2012,
            "rating": "8.0",
            "genre": "science fiction",
            "director": "Joss Whedon",
        },
    ),
    Document(
        page_content="Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name.",
        metadata={
            "year": 2018,
            "rating": "7.3",
            "genre": "science fiction",
            "director": "Ryan Coogler",
        },
    ),
]

vector_db = TencentVectorDB.from_documents(
    docs,
    None,
    connection_params=ConnectionParams(
        url="http://10.0.X.X",
        key="eC4bLRy2va******************************",
        username="root",
        timeout=20,
    ),
    collection_name="self_query_movies",
    meta_fields=meta_fields,
    drop_old=True,
)
```

## self-querying retriever 생성

이제 retriever를 인스턴스화할 수 있습니다. 이를 위해서는 문서에서 지원하는 메타데이터 필드에 대한 정보와 문서 내용에 대한 간단한 설명을 제공해야 합니다.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import ChatOpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string",
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
        name="rating", description="A 1-10 rating for the movie", type="string"
    ),
]
document_content_description = "Brief summary of a movie"
```

```python
llm = ChatOpenAI(temperature=0, model="gpt-4", max_tokens=4069)
retriever = SelfQueryRetriever.from_llm(
    llm, vector_db, document_content_description, metadata_field_info, verbose=True
)
```

## 테스트해 보기

이제 실제로 retriever를 사용해 볼 수 있습니다!

```python
# This example only specifies a relevant query
retriever.invoke("movies about a superhero")
```

```output
[Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'science fiction', 'director': 'Christopher Nolan'}),
 Document(page_content='The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.', metadata={'year': 2012, 'rating': '8.0', 'genre': 'science fiction', 'director': 'Joss Whedon'}),
 Document(page_content='Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name.', metadata={'year': 2018, 'rating': '7.3', 'genre': 'science fiction', 'director': 'Ryan Coogler'}),
 Document(page_content='The Godfather is a 1972 American crime film directed by Francis Ford Coppola.', metadata={'year': 1972, 'rating': '9.2', 'genre': 'crime', 'director': 'Francis Ford Coppola'})]
```

```python
# This example only specifies a filter
retriever.invoke("movies that were released after 2010")
```

```output
[Document(page_content='The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.', metadata={'year': 2012, 'rating': '8.0', 'genre': 'science fiction', 'director': 'Joss Whedon'}),
 Document(page_content='Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name.', metadata={'year': 2018, 'rating': '7.3', 'genre': 'science fiction', 'director': 'Ryan Coogler'})]
```

```python
# This example specifies both a relevant query and a filter
retriever.invoke("movies about a superhero which were released after 2010")
```

```output
[Document(page_content='The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.', metadata={'year': 2012, 'rating': '8.0', 'genre': 'science fiction', 'director': 'Joss Whedon'}),
 Document(page_content='Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name.', metadata={'year': 2018, 'rating': '7.3', 'genre': 'science fiction', 'director': 'Ryan Coogler'})]
```

## k 필터링

self-query retriever를 사용하여 `k`(검색할 문서 수)를 지정할 수도 있습니다.

생성자에 `enable_limit=True`를 전달하여 이를 수행할 수 있습니다.

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vector_db,
    document_content_description,
    metadata_field_info,
    verbose=True,
    enable_limit=True,
)
```

```python
retriever.invoke("what are two movies about a superhero")
```

```output
[Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'science fiction', 'director': 'Christopher Nolan'}),
 Document(page_content='The Avengers is a 2012 American superhero film based on the Marvel Comics superhero team of the same name.', metadata={'year': 2012, 'rating': '8.0', 'genre': 'science fiction', 'director': 'Joss Whedon'})]
```
