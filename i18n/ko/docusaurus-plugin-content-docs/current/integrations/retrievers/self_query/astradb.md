---
translated: true
---

# Astra DB (Cassandra)

>[DataStax Astra DB](https://docs.datastax.com/en/astra/home/astra.html)는 `Cassandra`를 기반으로 하는 서버리스 벡터 지원 데이터베이스이며, 사용하기 쉬운 JSON API를 통해 편리하게 제공됩니다.

이 연습에서는 `Astra DB` 벡터 스토어와 함께 `SelfQueryRetriever`를 데모할 것입니다.

## Astra DB 벡터 스토어 생성하기

먼저 Astra DB VectorStore를 생성하고 일부 데이터로 채워 보겠습니다. 영화 요약이 포함된 작은 데모 문서 세트를 만들었습니다.

참고: self-query retriever를 사용하려면 `lark`를 설치해야 합니다(`pip install lark`). `astrapy` 패키지도 필요합니다.

```python
%pip install --upgrade --quiet lark astrapy langchain-openai
```

`OpenAIEmbeddings`를 사용하려면 OpenAI API 키를 얻어야 합니다.

```python
import os
from getpass import getpass

from langchain_openai.embeddings import OpenAIEmbeddings

os.environ["OPENAI_API_KEY"] = getpass("OpenAI API Key:")

embeddings = OpenAIEmbeddings()
```

Astra DB VectorStore를 생성합니다:

- API 엔드포인트는 `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`과 같습니다.
- 토큰은 `AstraCS:6gBhNmsk135....`와 같습니다.

```python
ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```python
from langchain.vectorstores import AstraDB
from langchain_core.documents import Document

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

vectorstore = AstraDB.from_documents(
    docs,
    embeddings,
    collection_name="astra_self_query_demo",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
)
```

## 자체 쿼리 검색기 생성하기

이제 검색기를 인스턴스화할 수 있습니다. 이를 위해서는 문서의 메타데이터 필드와 문서 내용에 대한 간단한 설명을 미리 제공해야 합니다.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.llms import OpenAI
from langchain.retrievers.self_query.base import SelfQueryRetriever

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

## 테스트해 보기

이제 실제로 검색기를 사용해 볼 수 있습니다!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs?")
```

```python
# This example specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```python
# This example only specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5), science fiction movie ?")
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie about toys after 1990 but before 2005, and is animated"
)
```

## k 필터링

자체 쿼리 검색기를 사용하여 `k`(검색할 문서 수)를 지정할 수도 있습니다.

생성자에 `enable_limit=True`를 전달하면 이 기능을 사용할 수 있습니다.

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    verbose=True,
    enable_limit=True,
)
```

```python
# This example only specifies a relevant query
retriever.invoke("What are two movies about dinosaurs?")
```

## 정리

Astra DB 인스턴스에서 컬렉션을 완전히 삭제하려면 다음을 실행하세요.

_(저장된 데이터가 모두 삭제됩니다.)_

```python
vectorstore.delete_collection()
```
