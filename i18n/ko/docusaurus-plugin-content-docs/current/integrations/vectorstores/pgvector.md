---
translated: true
---

# PGVector

> `postgres`를 백엔드로 사용하고 `pgvector` 확장을 활용하여 LangChain 벡터스토어 추상화를 구현한 것입니다.

코드는 [langchain_postgres](https://github.com/langchain-ai/langchain-postgres/)라는 통합 패키지에 있습니다.

다음 명령어를 실행하여 `pgvector` 확장이 포함된 postgres 컨테이너를 실행할 수 있습니다:

```shell
docker run --name pgvector-container -e POSTGRES_USER=langchain -e POSTGRES_PASSWORD=langchain -e POSTGRES_DB=langchain -p 6024:5432 -d pgvector/pgvector:pg16
```

## 상태

이 코드는 `langchain_community`에서 `langchain-postgres`라는 전용 패키지로 이식되었습니다. 다음과 같은 변경 사항이 있습니다:

* langchain_postgres는 psycopg3만 작동합니다. 연결 문자열을 `postgresql+psycopg2://...`에서 `postgresql+psycopg://langchain:langchain@...`로 업데이트하세요(드라이버 이름은 `psycopg3`가 아닌 `psycopg`입니다).
* 임베딩 저장소와 컬렉션의 스키마가 사용자 지정 ID로 add_documents가 올바르게 작동하도록 변경되었습니다.
* 이제 명시적인 연결 객체를 전달해야 합니다.

현재 스키마 변경에 대한 쉬운 데이터 마이그레이션 메커니즘이 **없습니다**. 따라서 벡터스토어의 스키마 변경은 사용자가 테이블을 다시 만들고 문서를 다시 추가해야 합니다.
이것이 문제라면 다른 벡터스토어를 사용하세요. 그렇지 않다면 이 구현이 사용 사례에 적합할 것입니다.

## 종속성 설치

여기서는 임베딩을 위해 `langchain_cohere`를 사용하지만, 다른 임베딩 공급자를 사용할 수 있습니다.

```python
!pip install --quiet -U langchain_cohere
!pip install --quiet -U langchain_postgres
```

## 벡터스토어 초기화

```python
from langchain_cohere import CohereEmbeddings
from langchain_core.documents import Document
from langchain_postgres import PGVector
from langchain_postgres.vectorstores import PGVector

# See docker command above to launch a postgres instance with pgvector enabled.
connection = "postgresql+psycopg://langchain:langchain@localhost:6024/langchain"  # Uses psycopg3!
collection_name = "my_docs"
embeddings = CohereEmbeddings()

vectorstore = PGVector(
    embeddings=embeddings,
    collection_name=collection_name,
    connection=connection,
    use_jsonb=True,
)
```

## 테이블 삭제

테이블을 삭제해야 하는 경우(예: 임베딩 차원을 변경하거나 임베딩 공급자를 업데이트하는 경우):

```python
vectorstore.drop_tables()
```

## 문서 추가

벡터스토어에 문서 추가

```python
docs = [
    Document(
        page_content="there are cats in the pond",
        metadata={"id": 1, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="ducks are also found in the pond",
        metadata={"id": 2, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="fresh apples are available at the market",
        metadata={"id": 3, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the market also sells fresh oranges",
        metadata={"id": 4, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the new art exhibit is fascinating",
        metadata={"id": 5, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a sculpture exhibit is also at the museum",
        metadata={"id": 6, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a new coffee shop opened on Main Street",
        metadata={"id": 7, "location": "Main Street", "topic": "food"},
    ),
    Document(
        page_content="the book club meets at the library",
        metadata={"id": 8, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="the library hosts a weekly story time for kids",
        metadata={"id": 9, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="a cooking class for beginners is offered at the community center",
        metadata={"id": 10, "location": "community center", "topic": "classes"},
    ),
]
```

```python
vectorstore.add_documents(docs, ids=[doc.metadata["id"] for doc in docs])
```

```output
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

```python
vectorstore.similarity_search("kitty", k=10)
```

```output
[Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the book club meets at the library', metadata={'id': 8, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the market also sells fresh oranges', metadata={'id': 4, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a cooking class for beginners is offered at the community center', metadata={'id': 10, 'topic': 'classes', 'location': 'community center'}),
 Document(page_content='fresh apples are available at the market', metadata={'id': 3, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a sculpture exhibit is also at the museum', metadata={'id': 6, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='a new coffee shop opened on Main Street', metadata={'id': 7, 'topic': 'food', 'location': 'Main Street'})]
```

ID로 문서를 추가하면 해당 ID와 일치하는 기존 문서가 덮어쓰기됩니다.

```python
docs = [
    Document(
        page_content="there are cats in the pond",
        metadata={"id": 1, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="ducks are also found in the pond",
        metadata={"id": 2, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="fresh apples are available at the market",
        metadata={"id": 3, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the market also sells fresh oranges",
        metadata={"id": 4, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the new art exhibit is fascinating",
        metadata={"id": 5, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a sculpture exhibit is also at the museum",
        metadata={"id": 6, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a new coffee shop opened on Main Street",
        metadata={"id": 7, "location": "Main Street", "topic": "food"},
    ),
    Document(
        page_content="the book club meets at the library",
        metadata={"id": 8, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="the library hosts a weekly story time for kids",
        metadata={"id": 9, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="a cooking class for beginners is offered at the community center",
        metadata={"id": 10, "location": "community center", "topic": "classes"},
    ),
]
```

## 필터링 지원

벡터스토어는 문서의 메타데이터 필드에 대해 적용할 수 있는 일련의 필터를 지원합니다.

| 연산자 | 의미/범주        |
|----------|-------------------------|
| \$eq      | 동등 (==)           |
| \$ne      | 부등 (!=)         |
| \$lt      | 미만 (<)           |
| \$lte     | 이하 (<=) |
| \$gt      | 초과 (>)        |
| \$gte     | 이상 (>=) |
| \$in      | 특수 처리 (in)      |
| \$nin     | 특수 처리 (not in)  |
| \$between | 특수 처리 (between) |
| \$like    | 텍스트 (like)             |
| \$ilike   | 텍스트 (대소문자 구분 없는 like) |
| \$and     | 논리 (and)           |
| \$or      | 논리 (or)            |

```python
vectorstore.similarity_search("kitty", k=10, filter={"id": {"$in": [1, 5, 2, 9]}})
```

```output
[Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'})]
```

여러 필드가 포함된 dict를 제공하지만 연산자가 없는 경우, 최상위 수준이 논리적 **AND** 필터로 해석됩니다.

```python
vectorstore.similarity_search(
    "ducks",
    k=10,
    filter={"id": {"$in": [1, 5, 2, 9]}, "location": {"$in": ["pond", "market"]}},
)
```

```output
[Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'})]
```

```python
vectorstore.similarity_search(
    "ducks",
    k=10,
    filter={
        "$and": [
            {"id": {"$in": [1, 5, 2, 9]}},
            {"location": {"$in": ["pond", "market"]}},
        ]
    },
)
```

```output
[Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'})]
```

```python
vectorstore.similarity_search("bird", k=10, filter={"location": {"$ne": "pond"}})
```

```output
[Document(page_content='the book club meets at the library', metadata={'id': 8, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='a sculpture exhibit is also at the museum', metadata={'id': 6, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='the market also sells fresh oranges', metadata={'id': 4, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a cooking class for beginners is offered at the community center', metadata={'id': 10, 'topic': 'classes', 'location': 'community center'}),
 Document(page_content='a new coffee shop opened on Main Street', metadata={'id': 7, 'topic': 'food', 'location': 'Main Street'}),
 Document(page_content='fresh apples are available at the market', metadata={'id': 3, 'topic': 'food', 'location': 'market'})]
```
