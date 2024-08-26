---
translated: true
---

# Couchbase

[Couchbase](http://couchbase.com/)는 클라우드, 모바일, AI, 엣지 컴퓨팅 애플리케이션을 위한 탁월한 다재다능성, 성능, 확장성 및 재무적 가치를 제공하는 수상 경력이 있는 분산 NoSQL 클라우드 데이터베이스입니다. Couchbase는 개발자를 위한 코딩 지원과 애플리케이션을 위한 벡터 검색을 통해 AI를 포용합니다.

벡터 검색은 Couchbase의 [Full Text Search Service](https://docs.couchbase.com/server/current/learn/services-and-indexes/services/search-service.html)(Search Service)의 일부입니다.

이 자습서에서는 Couchbase에서 벡터 검색을 사용하는 방법을 설명합니다. [Couchbase Capella](https://www.couchbase.com/products/capella/)와 자체 관리 Couchbase Server를 모두 사용할 수 있습니다.

## 설치

```python
%pip install --upgrade --quiet langchain langchain-openai couchbase
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## 벡터 저장소 및 임베딩 가져오기

```python
from langchain_community.vectorstores import CouchbaseVectorStore
from langchain_openai import OpenAIEmbeddings
```

## Couchbase 연결 객체 생성

먼저 Couchbase 클러스터에 연결을 생성한 다음 클러스터 객체를 벡터 저장소에 전달합니다.

여기서는 사용자 이름과 비밀번호를 사용하여 연결하고 있습니다. 클러스터에 연결하는 다른 지원되는 방법을 사용할 수도 있습니다.

Couchbase 클러스터에 연결하는 방법에 대한 자세한 내용은 [Python SDK 문서](https://docs.couchbase.com/python-sdk/current/hello-world/start-using-sdk.html#connect)를 참조하십시오.

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

이제 벡터 검색에 사용할 Couchbase 클러스터의 버킷, 범위 및 컬렉션 이름을 설정하겠습니다.

이 예에서는 기본 범위와 컬렉션을 사용하고 있습니다.

```python
BUCKET_NAME = "testing"
SCOPE_NAME = "_default"
COLLECTION_NAME = "_default"
SEARCH_INDEX_NAME = "vector-index"
```

이 자습서에서는 OpenAI 임베딩을 사용할 것입니다.

```python
embeddings = OpenAIEmbeddings()
```

## 검색 인덱스 생성

현재 검색 인덱스는 Couchbase Capella 또는 Server UI에서 또는 REST 인터페이스를 사용하여 생성해야 합니다.

`vector-index`라는 이름의 검색 인덱스를 testing 버킷에 정의해 보겠습니다.

이 예에서는 Search Service의 Import Index 기능을 사용할 것입니다.

`testing` 버킷의 `_default` 범위에 있는 `_default` 컬렉션에 대해 `embedding` 필드를 1536 차원으로 설정하고 `text` 필드를 정의하는 인덱스를 정의하고 있습니다. 또한 문서 구조의 변화에 대응하기 위해 `metadata` 아래의 모든 필드를 인덱싱하고 저장하는 동적 매핑을 정의하고 있습니다. 유사성 메트릭은 `dot_product`로 설정됩니다.

### Full Text Search 서비스에 인덱스를 가져오는 방법은 다음과 같습니다.

 - [Couchbase Server](https://docs.couchbase.com/server/current/search/import-search-index.html)
     - Search -> Add Index -> Import를 클릭합니다.
     - 다음 인덱스 정의를 Import 화면에 복사합니다.
     - Create Index를 클릭하여 인덱스를 생성합니다.
 - [Couchbase Capella](https://docs.couchbase.com/cloud/search/import-search-index.html)
     - 인덱스 정의를 `index.json`이라는 새 파일에 복사합니다.
     - 문서에 설명된 지침을 사용하여 Capella에 파일을 가져옵니다.
     - Create Index를 클릭하여 인덱스를 생성합니다.

### 인덱스 정의

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

벡터 필드 지원을 포함하는 검색 인덱스 생성에 대한 자세한 내용은 다음 문서를 참조하십시오.

- [Couchbase Capella](https://docs.couchbase.com/cloud/vector-search/create-vector-search-index-ui.html)

- [Couchbase Server](https://docs.couchbase.com/server/current/vector-search/create-vector-search-index-ui.html)

## 벡터 저장소 생성

클러스터 정보와 검색 인덱스 이름으로 벡터 저장소 객체를 생성합니다.

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

### 텍스트 및 임베딩 필드 지정

`text_key` 및 `embedding_key` 필드를 사용하여 문서의 텍스트 및 임베딩 필드를 선택적으로 지정할 수 있습니다.

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

## 기본 벡터 검색 예제

이 예에서는 "state_of_the_union.txt" 파일을 TextLoader를 통해 로드하고, 텍스트를 500자 청크로 나누되 겹치지 않게 하여 모든 청크를 Couchbase에 인덱싱할 것입니다.

데이터가 인덱싱된 후에는 "What did president say about Ketanji Brown Jackson"이라는 쿼리와 유사한 상위 4개 청크를 찾는 간단한 쿼리를 수행합니다.

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

## 유사도 검색 및 점수

`similarity_search_with_score` 메서드를 호출하여 결과의 점수를 가져올 수 있습니다.

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

## 반환할 필드 지정

`fields` 매개변수를 사용하여 문서에서 반환할 필드를 지정할 수 있습니다. 이러한 필드는 반환된 문서의 `metadata` 객체의 일부로 반환됩니다. 검색 인덱스에 저장된 모든 필드를 가져올 수 있습니다. 문서의 `page_content`에는 `text_key`가 반환됩니다.

필드를 지정하지 않으면 인덱스에 저장된 모든 필드가 반환됩니다.

메타데이터의 필드를 가져오려면 `.`을 사용해야 합니다.

예를 들어 메타데이터의 `source` 필드를 가져오려면 `metadata.source`를 지정해야 합니다.

```python
query = "What did president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(query, fields=["metadata.source"])
print(results[0])
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

## 하이브리드 검색

Couchbase를 사용하면 벡터 검색 결과와 문서의 `metadata` 객체와 같은 비벡터 필드에 대한 검색을 결합하는 하이브리드 검색을 수행할 수 있습니다.

번역 결과:

검색 서비스의 결과와 벡터 검색의 결과를 조합하여 최종 결과가 결정됩니다. 각 구성 요소 검색의 점수를 합산하여 최종 결과의 총점을 얻습니다.

하이브리드 검색을 수행하려면 모든 유사성 검색에 `search_options`라는 선택적 매개변수를 전달할 수 있습니다.
`search_options`의 다양한 검색/쿼리 가능성은 [여기](https://docs.couchbase.com/server/current/search/search-request-params.html#query-object)에서 확인할 수 있습니다.

### 하이브리드 검색을 위한 다양한 메타데이터 생성

하이브리드 검색을 시뮬레이션하기 위해 기존 문서에서 임의의 메타데이터를 생성합시다.
메타데이터에 `date`(2010 ~ 2020), `rating`(1 ~ 5), `author`(John Doe 또는 Jane Doe)라는 세 개의 필드를 균일하게 추가합니다.

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

### 예시: 정확한 값으로 검색하기

`metadata` 객체의 텍스트 필드(예: 저자)에 대한 정확한 일치를 검색할 수 있습니다.

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

### 예시: 부분 일치로 검색하기

검색어의 약간의 변형이나 오타를 찾기 위해 퍼지 검색을 지정할 수 있습니다.

여기서 "Jae"는 "Jane"과 유사(퍼지 1)합니다.

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

### 예시: 날짜 범위 쿼리로 검색하기

`metadata.date`와 같은 날짜 필드에 대해 날짜 범위 쿼리로 검색할 수 있습니다.

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

### 예시: 숫자 범위 쿼리로 검색하기

`metadata.rating`과 같은 숫자 필드에 대해 범위 쿼리로 검색할 수 있습니다.

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

### 예시: 다중 검색 쿼리 결합하기

다양한 검색 쿼리를 AND(접속사) 또는 OR(선택사) 연산자를 사용하여 결합할 수 있습니다.

이 예에서는 평점이 3 ~ 4이고 2015 ~ 2018년 사이의 문서를 검색합니다.

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

### 기타 쿼리

마찬가지로 `search_options` 매개변수에서 지원되는 다른 쿼리 메서드(지리 거리, 다각형 검색, 와일드카드, 정규 표현식 등)를 사용할 수 있습니다. 자세한 내용은 문서를 참조하세요.

- [Couchbase Capella](https://docs.couchbase.com/cloud/search/search-request-params.html#query-object)
- [Couchbase Server](https://docs.couchbase.com/server/current/search/search-request-params.html#query-object)

# 자주 묻는 질문

## 질문: CouchbaseVectorStore 객체를 만들기 전에 검색 인덱스를 생성해야 합니까?

네, 현재 `CouchbaseVectorStore` 객체를 만들기 전에 검색 인덱스를 생성해야 합니다.

## 질문: 검색 결과에서 지정한 모든 필드를 보지 못하고 있습니다.

Couchbase에서는 검색 인덱스에 저장된 필드만 반환할 수 있습니다. 검색 결과에서 액세스하려는 필드가 검색 인덱스의 일부인지 확인하세요.

이를 처리하는 한 가지 방법은 문서의 필드를 동적으로 인덱스와 저장하는 것입니다.

- Capella에서는 "고급 모드"로 이동한 다음 화살표 아래 "일반 설정"에서 "[X] 동적 필드 저장" 또는 "[X] 동적 필드 인덱싱"을 선택할 수 있습니다.
- Couchbase Server에서는 인덱스 편집기(빠른 편집기 아님)의 화살표 아래 "고급"에서 "[X] 동적 필드 저장" 또는 "[X] 동적 필드 인덱싱"을 선택할 수 있습니다.

동적 매핑에 대한 자세한 내용은 [문서](https://docs.couchbase.com/cloud/search/customize-index.html)를 참조하세요.

## 질문: 검색 결과에서 metadata 객체를 볼 수 없습니다.

이는 대부분 문서의 `metadata` 필드가 Couchbase 검색 인덱스에 의해 인덱싱 및/또는 저장되지 않았기 때문입니다. `metadata` 필드를 문서에 인덱싱하려면 하위 매핑으로 인덱스에 추가해야 합니다.

매핑에서 모든 필드를 매핑하도록 선택하면 모든 메타데이터 필드를 검색할 수 있습니다. 또는 인덱스를 최적화하기 위해 `metadata` 객체 내부의 특정 필드를 선택적으로 인덱싱할 수 있습니다. 하위 매핑 인덱싱에 대한 자세한 내용은 [문서](https://docs.couchbase.com/cloud/search/customize-index.html)를 참조하세요.

하위 매핑 생성

* [Couchbase Capella](https://docs.couchbase.com/cloud/search/create-child-mapping.html)
* [Couchbase Server](https://docs.couchbase.com/server/current/search/create-child-mapping.html)
