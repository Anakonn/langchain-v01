---
translated: true
---

# MongoDB

[MongoDB](https://www.mongodb.com/)는 동적 스키마를 지원하는 JSON 형식의 문서 지향 NoSQL 데이터베이스입니다.

## 개요

MongoDB 문서 로더는 MongoDB 데이터베이스에서 Langchain 문서 목록을 반환합니다.

로더에는 다음과 같은 매개변수가 필요합니다:

*   MongoDB 연결 문자열
*   MongoDB 데이터베이스 이름
*   MongoDB 컬렉션 이름
*   (선택 사항) 콘텐츠 필터 사전
*   (선택 사항) 출력에 포함할 필드 이름 목록

출력 형식은 다음과 같습니다:

- pageContent= Mongo 문서
- metadata={'database': '[database_name]', 'collection': '[collection_name]'}

## 문서 로더 로드

```python
# add this import for running in jupyter notebook
import nest_asyncio

nest_asyncio.apply()
```

```python
from langchain_community.document_loaders.mongodb import MongodbLoader
```

```python
loader = MongodbLoader(
    connection_string="mongodb://localhost:27017/",
    db_name="sample_restaurants",
    collection_name="restaurants",
    filter_criteria={"borough": "Bronx", "cuisine": "Bakery"},
    field_names=["name", "address"],
)
```

```python
docs = loader.load()

len(docs)
```

```output
71
```

```python
docs[0]
```

```output
Document(page_content="Morris Park Bake Shop {'building': '1007', 'coord': [-73.856077, 40.848447], 'street': 'Morris Park Ave', 'zipcode': '10462'}", metadata={'database': 'sample_restaurants', 'collection': 'restaurants'})
```
