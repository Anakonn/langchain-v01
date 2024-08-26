---
translated: true
---

# AstraDB

DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html)는 Cassandra를 기반으로 구축된 서버리스 벡터 기능 데이터베이스로, 사용하기 쉬운 JSON API를 통해 편리하게 제공됩니다.

## 개요

AstraDB 문서 로더는 AstraDB 데이터베이스에서 Langchain 문서 목록을 반환합니다.

로더는 다음과 같은 매개변수를 사용합니다:

* `api_endpoint`: AstraDB API 엔드포인트. `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com` 형식입니다.

* `token`: AstraDB 토큰. `AstraCS:6gBhNmsk135....` 형식입니다.

* `collection_name`: AstraDB 컬렉션 이름

* `namespace`: (선택 사항) AstraDB 네임스페이스

* `filter_criteria`: (선택 사항) 찾기 쿼리에 사용되는 필터

* `projection`: (선택 사항) 찾기 쿼리에 사용되는 프로젝션

* `find_options`: (선택 사항) 찾기 쿼리에 사용되는 옵션

* `nb_prefetched`: (선택 사항) 로더가 미리 가져오는 문서 수

* `extraction_function`: (선택 사항) AstraDB 문서를 LangChain `page_content` 문자열로 변환하는 함수. 기본값은 `json.dumps`입니다.

다음과 같은 메타데이터가 LangChain 문서 메타데이터 출력에 설정됩니다:

```python
{
    metadata : {
        "namespace": "...", 
        "api_endpoint": "...", 
        "collection": "..."
    }
}
```

## 문서 로더로 문서 로드하기

```python
from langchain_community.document_loaders import AstraDBLoader
```  

```python
from getpass import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```  

```python
loader = AstraDBLoader(
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    collection_name="movie_reviews",
    projection={"title": 1, "reviewtext": 1},
    find_options={"limit": 10},
)
```  

```python
docs = loader.load()
```  

```python
docs[0]
```  

```output
Document(page_content='{"_id": "659bdffa16cbc4586b11a423", "title": "Dangerous Men", "reviewtext": "\\"Dangerous Men,\\" the picture\'s production notes inform, took 26 years to reach the big screen. After having seen it, I wonder: What was the rush?"}', metadata={'namespace': 'default_keyspace', 'api_endpoint': 'https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com', 'collection': 'movie_reviews'})
```

