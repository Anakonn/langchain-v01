---
translated: true
---

# LLM 캐싱 통합

이 노트북에서는 다양한 캐시를 사용하여 개별 LLM 호출의 결과를 캐싱하는 방법을 다룹니다.

```python
from langchain.globals import set_llm_cache
from langchain_openai import OpenAI

# To make the caching really obvious, lets use a slower model.
llm = OpenAI(model_name="gpt-3.5-turbo-instruct", n=2, best_of=2)
```

## `In Memory` 캐시

```python
from langchain.cache import InMemoryCache

set_llm_cache(InMemoryCache())
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 52.2 ms, sys: 15.2 ms, total: 67.4 ms
Wall time: 1.19 s
```

```output
"\n\nWhy couldn't the bicycle stand up by itself? Because it was...two tired!"
```

```python
%%time
# The second time it is, so it goes faster
llm("Tell me a joke")
```

```output
CPU times: user 191 µs, sys: 11 µs, total: 202 µs
Wall time: 205 µs
```

```output
"\n\nWhy couldn't the bicycle stand up by itself? Because it was...two tired!"
```

## `SQLite` 캐시

```python
!rm .langchain.db
```

```python
# We can do the same thing with a SQLite cache
from langchain.cache import SQLiteCache

set_llm_cache(SQLiteCache(database_path=".langchain.db"))
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 33.2 ms, sys: 18.1 ms, total: 51.2 ms
Wall time: 667 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side.'
```

```python
%%time
# The second time it is, so it goes faster
llm("Tell me a joke")
```

```output
CPU times: user 4.86 ms, sys: 1.97 ms, total: 6.83 ms
Wall time: 5.79 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side.'
```

## `Upstash Redis` 캐시

### 표준 캐시

[Upstash Redis](https://upstash.com)를 사용하여 프롬프트와 응답을 캐싱하고 서버리스 HTTP API로 액세스합니다.

```python
import langchain
from langchain.cache import UpstashRedisCache
from upstash_redis import Redis

URL = "<UPSTASH_REDIS_REST_URL>"
TOKEN = "<UPSTASH_REDIS_REST_TOKEN>"

langchain.llm_cache = UpstashRedisCache(redis_=Redis(url=URL, token=TOKEN))
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 7.56 ms, sys: 2.98 ms, total: 10.5 ms
Wall time: 1.14 s
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

```python
%%time
# The second time it is, so it goes faster
llm("Tell me a joke")
```

```output
CPU times: user 2.78 ms, sys: 1.95 ms, total: 4.73 ms
Wall time: 82.9 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

## `Redis` 캐시

### 표준 캐시

[Redis](/docs/integrations/providers/redis)를 사용하여 프롬프트와 응답을 캐싱합니다.

```python
# We can do the same thing with a Redis cache
# (make sure your local Redis instance is running first before running this example)
from langchain.cache import RedisCache
from redis import Redis

set_llm_cache(RedisCache(redis_=Redis()))
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 6.88 ms, sys: 8.75 ms, total: 15.6 ms
Wall time: 1.04 s
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

```python
%%time
# The second time it is, so it goes faster
llm("Tell me a joke")
```

```output
CPU times: user 1.59 ms, sys: 610 µs, total: 2.2 ms
Wall time: 5.58 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

### 시맨틱 캐시

[Redis](/docs/integrations/providers/redis)를 사용하여 프롬프트와 응답을 캐싱하고 시맨틱 유사성을 기반으로 히트를 평가합니다.

```python
from langchain.cache import RedisSemanticCache
from langchain_openai import OpenAIEmbeddings

set_llm_cache(
    RedisSemanticCache(redis_url="redis://localhost:6379", embedding=OpenAIEmbeddings())
)
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 351 ms, sys: 156 ms, total: 507 ms
Wall time: 3.37 s
```

```output
"\n\nWhy don't scientists trust atoms?\nBecause they make up everything."
```

```python
%%time
# The second time, while not a direct hit, the question is semantically similar to the original question,
# so it uses the cached result!
llm("Tell me one joke")
```

```output
CPU times: user 6.25 ms, sys: 2.72 ms, total: 8.97 ms
Wall time: 262 ms
```

```output
"\n\nWhy don't scientists trust atoms?\nBecause they make up everything."
```

## `GPTCache`

[GPTCache](https://github.com/zilliztech/GPTCache)를 사용하여 정확한 일치 캐싱 또는 시맨틱 유사성 기반 캐싱을 할 수 있습니다.

먼저 정확한 일치 캐싱 예제를 살펴보겠습니다.

```python
import hashlib

from gptcache import Cache
from gptcache.manager.factory import manager_factory
from gptcache.processor.pre import get_prompt
from langchain.cache import GPTCache


def get_hashed_name(name):
    return hashlib.sha256(name.encode()).hexdigest()


def init_gptcache(cache_obj: Cache, llm: str):
    hashed_llm = get_hashed_name(llm)
    cache_obj.init(
        pre_embedding_func=get_prompt,
        data_manager=manager_factory(manager="map", data_dir=f"map_cache_{hashed_llm}"),
    )


set_llm_cache(GPTCache(init_gptcache))
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 21.5 ms, sys: 21.3 ms, total: 42.8 ms
Wall time: 6.2 s
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

```python
%%time
# The second time it is, so it goes faster
llm("Tell me a joke")
```

```output
CPU times: user 571 µs, sys: 43 µs, total: 614 µs
Wall time: 635 µs
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

이제 유사성 캐싱 예제를 보여드리겠습니다.

```python
import hashlib

from gptcache import Cache
from gptcache.adapter.api import init_similar_cache
from langchain.cache import GPTCache


def get_hashed_name(name):
    return hashlib.sha256(name.encode()).hexdigest()


def init_gptcache(cache_obj: Cache, llm: str):
    hashed_llm = get_hashed_name(llm)
    init_similar_cache(cache_obj=cache_obj, data_dir=f"similar_cache_{hashed_llm}")


set_llm_cache(GPTCache(init_gptcache))
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 1.42 s, sys: 279 ms, total: 1.7 s
Wall time: 8.44 s
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side.'
```

```python
%%time
# This is an exact match, so it finds it in the cache
llm("Tell me a joke")
```

```output
CPU times: user 866 ms, sys: 20 ms, total: 886 ms
Wall time: 226 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side.'
```

```python
%%time
# This is not an exact match, but semantically within distance so it hits!
llm("Tell me joke")
```

```output
CPU times: user 853 ms, sys: 14.8 ms, total: 868 ms
Wall time: 224 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side.'
```

## `Momento` 캐시

[Momento](/docs/integrations/providers/momento)를 사용하여 프롬프트와 응답을 캐싱합니다.

Momento를 사용하려면 아래 코드를 실행하여 설치해야 합니다:

```python
%pip install --upgrade --quiet  momento
```

Momento 인증 토큰이 필요합니다. 이는 `momento.CacheClient`를 직접 인스턴스화하는 경우 `auth_token` 매개변수로 전달하거나, `MomentoChatMessageHistory.from_client_params`에 전달할 수 있습니다. 또는 환경 변수 `MOMENTO_AUTH_TOKEN`로 설정할 수 있습니다.

```python
from datetime import timedelta

from langchain.cache import MomentoCache

cache_name = "langchain"
ttl = timedelta(days=1)
set_llm_cache(MomentoCache.from_client_params(cache_name, ttl))
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 40.7 ms, sys: 16.5 ms, total: 57.2 ms
Wall time: 1.73 s
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

```python
%%time
# The second time it is, so it goes faster
# When run in the same region as the cache, latencies are single digit ms
llm("Tell me a joke")
```

```output
CPU times: user 3.16 ms, sys: 2.98 ms, total: 6.14 ms
Wall time: 57.9 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

## `SQLAlchemy` 캐시

`SQLAlchemyCache`를 사용하여 `SQLAlchemy`가 지원하는 모든 SQL 데이터베이스에서 캐싱할 수 있습니다.

```python
# from langchain.cache import SQLAlchemyCache
# from sqlalchemy import create_engine

# engine = create_engine("postgresql://postgres:postgres@localhost:5432/postgres")
# set_llm_cache(SQLAlchemyCache(engine))
```

### 사용자 정의 SQLAlchemy 스키마

```python
# You can define your own declarative SQLAlchemyCache child class to customize the schema used for caching. For example, to support high-speed fulltext prompt indexing with Postgres, use:

from langchain.cache import SQLAlchemyCache
from sqlalchemy import Column, Computed, Index, Integer, Sequence, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy_utils import TSVectorType

Base = declarative_base()


class FulltextLLMCache(Base):  # type: ignore
    """Postgres table for fulltext-indexed LLM Cache"""

    __tablename__ = "llm_cache_fulltext"
    id = Column(Integer, Sequence("cache_id"), primary_key=True)
    prompt = Column(String, nullable=False)
    llm = Column(String, nullable=False)
    idx = Column(Integer)
    response = Column(String)
    prompt_tsv = Column(
        TSVectorType(),
        Computed("to_tsvector('english', llm || ' ' || prompt)", persisted=True),
    )
    __table_args__ = (
        Index("idx_fulltext_prompt_tsv", prompt_tsv, postgresql_using="gin"),
    )


engine = create_engine("postgresql://postgres:postgres@localhost:5432/postgres")
set_llm_cache(SQLAlchemyCache(engine, FulltextLLMCache))
```

## `Cassandra` 캐시

Cassandra/Astra DB의 CQL을 통해 LLM 응답을 캐싱할 수 있습니다. 정확한 일치 `CassandraCache`와 (벡터 유사성 기반) `CassandraSemanticCache`를 선택할 수 있습니다.

다음 셀에서 두 가지 방식을 모두 살펴보겠습니다.

#### DB 연결하기

먼저 DB에 대한 `Session`을 설정하고 캐시 테이블에 대한 _keyspace_를 지정해야 합니다. 다음 코드는 CQL을 통해 Astra DB에 연결하는 방법을 보여줍니다(다른 백엔드와 연결 옵션은 [여기](https://cassio.org/start_here/#vector-database)를 참고하세요).

```python
import getpass

keyspace = input("\nKeyspace name? ")
ASTRA_DB_APPLICATION_TOKEN = getpass.getpass('\nAstra DB Token ("AstraCS:...") ')
ASTRA_DB_SECURE_BUNDLE_PATH = input("Full path to your Secure Connect Bundle? ")
```

```output

Keyspace name? my_keyspace

Astra DB Token ("AstraCS:...") ········
Full path to your Secure Connect Bundle? /path/to/secure-connect-databasename.zip
```

```python
from cassandra.auth import PlainTextAuthProvider
from cassandra.cluster import Cluster

cluster = Cluster(
    cloud={
        "secure_connect_bundle": ASTRA_DB_SECURE_BUNDLE_PATH,
    },
    auth_provider=PlainTextAuthProvider("token", ASTRA_DB_APPLICATION_TOKEN),
)
session = cluster.connect()
```

### 정확한 캐시

이 캐시는 제공된 프롬프트가 이전에 이미 만난 것과 _정확히_ 같은 경우 LLM을 호출하지 않습니다:

```python
from langchain.cache import CassandraCache
from langchain.globals import set_llm_cache

set_llm_cache(CassandraCache(session=session, keyspace=keyspace))
```

```python
%%time

print(llm.invoke("Why is the Moon always showing the same side?"))
```

```output


The Moon always shows the same side because it is tidally locked to Earth.
CPU times: user 41.7 ms, sys: 153 µs, total: 41.8 ms
Wall time: 1.96 s
```

```python
%%time

print(llm.invoke("Why is the Moon always showing the same side?"))
```

```output


The Moon always shows the same side because it is tidally locked to Earth.
CPU times: user 4.09 ms, sys: 0 ns, total: 4.09 ms
Wall time: 119 ms
```

### 시맨틱 캐시

이 캐시는 시맨틱 유사성 검색을 수행하고 충분히 유사한 캐시된 항목을 찾으면 히트를 반환합니다. 이를 위해 선택한 `Embeddings` 인스턴스를 제공해야 합니다.

```python
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
```

```python
from langchain.cache import CassandraSemanticCache

set_llm_cache(
    CassandraSemanticCache(
        session=session,
        keyspace=keyspace,
        embedding=embedding,
        table_name="cass_sem_cache",
    )
)
```

```python
%%time

print(llm.invoke("Why is the Moon always showing the same side?"))
```

```output


The Moon always shows the same side because it is tidally locked with Earth. This means that the same side of the Moon always faces Earth.
CPU times: user 21.3 ms, sys: 177 µs, total: 21.4 ms
Wall time: 3.09 s
```

```python
%%time

print(llm.invoke("How come we always see one face of the moon?"))
```

```output


The Moon always shows the same side because it is tidally locked with Earth. This means that the same side of the Moon always faces Earth.
CPU times: user 10.9 ms, sys: 17 µs, total: 10.9 ms
Wall time: 461 ms
```

#### 출처 표시

>Apache Cassandra, Cassandra 및 Apache는 [Apache Software Foundation](http://www.apache.org/)에서 미국 및/또는 기타 국가에 등록된 상표 또는 상표입니다.

## `Astra DB` 캐시

[Astra DB](https://docs.datastax.com/en/astra/home/astra.html)를 "정확한" 또는 "의미 기반" 캐시로 사용할 수 있습니다.

실행 중인 데이터베이스(Semantic 캐시를 사용하려면 Vector 활성화 데이터베이스여야 함)가 있고 Astra 대시보드에서 필요한 자격 증명을 가져오세요:

- API 엔드포인트는 `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`과 같습니다.
- 토큰은 `AstraCS:6gBhNmsk135....`와 같습니다.

```python
import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass.getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```output
ASTRA_DB_API_ENDPOINT =  https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN =  ········
```

### Astra DB 정확한 LLM 캐시

이렇게 하면 제공된 프롬프트가 이미 만난 것과 _정확히_ 같은 경우 LLM을 호출하지 않습니다:

```python
from langchain.cache import AstraDBCache
from langchain.globals import set_llm_cache

set_llm_cache(
    AstraDBCache(
        api_endpoint=ASTRA_DB_API_ENDPOINT,
        token=ASTRA_DB_APPLICATION_TOKEN,
    )
)
```

```python
%%time

print(llm.invoke("Is a true fakery the same as a fake truth?"))
```

```output


There is no definitive answer to this question as it depends on the interpretation of the terms "true fakery" and "fake truth". However, one possible interpretation is that a true fakery is a counterfeit or imitation that is intended to deceive, whereas a fake truth is a false statement that is presented as if it were true.
CPU times: user 70.8 ms, sys: 4.13 ms, total: 74.9 ms
Wall time: 2.06 s
```

```python
%%time

print(llm.invoke("Is a true fakery the same as a fake truth?"))
```

```output


There is no definitive answer to this question as it depends on the interpretation of the terms "true fakery" and "fake truth". However, one possible interpretation is that a true fakery is a counterfeit or imitation that is intended to deceive, whereas a fake truth is a false statement that is presented as if it were true.
CPU times: user 15.1 ms, sys: 3.7 ms, total: 18.8 ms
Wall time: 531 ms
```

### Astra DB Semantic 캐시

이 캐시는 의미 유사성 검색을 수행하고 충분히 유사한 캐시된 항목을 찾으면 결과를 반환합니다. 이를 위해 선택한 `Embeddings` 인스턴스를 제공해야 합니다.

```python
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
```

```python
from langchain.cache import AstraDBSemanticCache

set_llm_cache(
    AstraDBSemanticCache(
        api_endpoint=ASTRA_DB_API_ENDPOINT,
        token=ASTRA_DB_APPLICATION_TOKEN,
        embedding=embedding,
        collection_name="demo_semantic_cache",
    )
)
```

```python
%%time

print(llm.invoke("Are there truths that are false?"))
```

```output


There is no definitive answer to this question since it presupposes a great deal about the nature of truth itself, which is a matter of considerable philosophical debate. It is possible, however, to construct scenarios in which something could be considered true despite being false, such as if someone sincerely believes something to be true even though it is not.
CPU times: user 65.6 ms, sys: 15.3 ms, total: 80.9 ms
Wall time: 2.72 s
```

```python
%%time

print(llm.invoke("Is is possible that something false can be also true?"))
```

```output


There is no definitive answer to this question since it presupposes a great deal about the nature of truth itself, which is a matter of considerable philosophical debate. It is possible, however, to construct scenarios in which something could be considered true despite being false, such as if someone sincerely believes something to be true even though it is not.
CPU times: user 29.3 ms, sys: 6.21 ms, total: 35.5 ms
Wall time: 1.03 s
```

## Azure Cosmos DB Semantic 캐시

이 통합 [벡터 데이터베이스](https://learn.microsoft.com/en-us/azure/cosmos-db/vector-database)를 캐싱에 사용할 수 있습니다.

```python
from langchain_community.cache import AzureCosmosDBSemanticCache
from langchain_community.vectorstores.azure_cosmos_db import (
    CosmosDBSimilarityType,
    CosmosDBVectorSearchType,
)
from langchain_openai import OpenAIEmbeddings

# Read more about Azure CosmosDB Mongo vCore vector search here https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/vector-search

NAMESPACE = "langchain_test_db.langchain_test_collection"
CONNECTION_STRING = (
    "Please provide your azure cosmos mongo vCore vector db connection string"
)

DB_NAME, COLLECTION_NAME = NAMESPACE.split(".")

# Default value for these params
num_lists = 3
dimensions = 1536
similarity_algorithm = CosmosDBSimilarityType.COS
kind = CosmosDBVectorSearchType.VECTOR_IVF
m = 16
ef_construction = 64
ef_search = 40
score_threshold = 0.9
application_name = "LANGCHAIN_CACHING_PYTHON"


set_llm_cache(
    AzureCosmosDBSemanticCache(
        cosmosdb_connection_string=CONNECTION_STRING,
        cosmosdb_client=None,
        embedding=OpenAIEmbeddings(),
        database_name=DB_NAME,
        collection_name=COLLECTION_NAME,
        num_lists=num_lists,
        similarity=similarity_algorithm,
        kind=kind,
        dimensions=dimensions,
        m=m,
        ef_construction=ef_construction,
        ef_search=ef_search,
        score_threshold=score_threshold,
        application_name=application_name,
    )
)
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 45.6 ms, sys: 19.7 ms, total: 65.3 ms
Wall time: 2.29 s
```

```output
'\n\nWhy was the math book sad? Because it had too many problems.'
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 9.61 ms, sys: 3.42 ms, total: 13 ms
Wall time: 474 ms
```

```output
'\n\nWhy was the math book sad? Because it had too many problems.'
```

## `Elasticsearch` 캐시

LLM에 대한 캐싱 계층을 제공하는 Elasticsearch입니다.

먼저 Elasticsearch와의 LangChain 통합을 설치하세요.

```python
%pip install -U langchain-elasticsearch
```

`ElasticsearchCache` 클래스를 사용하세요.

간단한 예:

```python
from elasticsearch import Elasticsearch
from langchain.globals import set_llm_cache
from langchain_elasticsearch import ElasticsearchCache

es_client = Elasticsearch(hosts="http://localhost:9200")
set_llm_cache(
    ElasticsearchCache(
        es_connection=es_client,
        index_name="llm-chat-cache",
        metadata={"project": "my_chatgpt_project"},
    )
)
```

`index_name` 매개변수는 별칭도 허용합니다. 이를 통해 [ILM: 인덱스 수명 주기 관리](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-lifecycle-management.html)를 사용할 수 있습니다. 이는 보존을 관리하고 캐시 성장을 제어하는 데 도움이 될 수 있습니다.

모든 매개변수에 대한 클래스 docstring을 참조하세요.

### 생성된 텍스트 인덱싱

기본적으로 캐시된 데이터는 검색할 수 없습니다.
개발자는 Elasticsearch 문서 구축을 사용자 정의하여 LLM에 의해 생성된 텍스트 필드를 인덱싱할 수 있습니다.

이는 하위 클래스화하고 메서드를 재정의하여 수행할 수 있습니다.
새 캐시 클래스는 기존 캐시 인덱스에도 적용할 수 있습니다:

```python
import json
from typing import Any, Dict, List

from elasticsearch import Elasticsearch
from langchain.globals import set_llm_cache
from langchain_core.caches import RETURN_VAL_TYPE
from langchain_elasticsearch import ElasticsearchCache


class SearchableElasticsearchCache(ElasticsearchCache):
    @property
    def mapping(self) -> Dict[str, Any]:
        mapping = super().mapping
        mapping["mappings"]["properties"]["parsed_llm_output"] = {
            "type": "text",
            "analyzer": "english",
        }
        return mapping

    def build_document(
        self, prompt: str, llm_string: str, return_val: RETURN_VAL_TYPE
    ) -> Dict[str, Any]:
        body = super().build_document(prompt, llm_string, return_val)
        body["parsed_llm_output"] = self._parse_output(body["llm_output"])
        return body

    @staticmethod
    def _parse_output(data: List[str]) -> List[str]:
        return [
            json.loads(output)["kwargs"]["message"]["kwargs"]["content"]
            for output in data
        ]


es_client = Elasticsearch(hosts="http://localhost:9200")
set_llm_cache(
    SearchableElasticsearchCache(es_connection=es_client, index_name="llm-chat-cache")
)
```

매핑 및 문서 구축을 재정의할 때는 기본 매핑을 유지하면서 추가적인 수정만 수행하세요.

## 선택적 캐싱

특정 LLM에 대해 캐싱을 끌 수도 있습니다. 아래 예에서는 전역 캐싱이 활성화되어 있지만 특정 LLM에 대해 비활성화됩니다.

```python
llm = OpenAI(model_name="gpt-3.5-turbo-instruct", n=2, best_of=2, cache=False)
```

```python
%%time
llm("Tell me a joke")
```

```output
CPU times: user 5.8 ms, sys: 2.71 ms, total: 8.51 ms
Wall time: 745 ms
```

```output
'\n\nWhy did the chicken cross the road?\n\nTo get to the other side!'
```

```python
%%time
llm("Tell me a joke")
```

```output
CPU times: user 4.91 ms, sys: 2.64 ms, total: 7.55 ms
Wall time: 623 ms
```

```output
'\n\nTwo guys stole a calendar. They got six months each.'
```

## 체인의 선택적 캐싱

체인의 특정 노드에 대해 캐싱을 끌 수도 있습니다. 특정 인터페이스로 인해 체인을 먼저 구성하고 나서 LLM을 편집하는 것이 더 쉬운 경우가 많습니다.

예를 들어, 요약기 맵-리듀스 체인을 로드할 것입니다. 맵 단계에 대한 결과를 캐시하지만 결합 단계에 대해서는 캐시하지 않습니다.

```python
llm = OpenAI(model_name="gpt-3.5-turbo-instruct")
no_cache_llm = OpenAI(model_name="gpt-3.5-turbo-instruct", cache=False)
```

```python
from langchain_text_splitters import CharacterTextSplitter

text_splitter = CharacterTextSplitter()
```

```python
with open("../../modules/state_of_the_union.txt") as f:
    state_of_the_union = f.read()
texts = text_splitter.split_text(state_of_the_union)
```

```python
from langchain_community.docstore.document import Document

docs = [Document(page_content=t) for t in texts[:3]]
from langchain.chains.summarize import load_summarize_chain
```

```python
chain = load_summarize_chain(llm, chain_type="map_reduce", reduce_llm=no_cache_llm)
```

```python
%%time
chain.run(docs)
```

```output
CPU times: user 452 ms, sys: 60.3 ms, total: 512 ms
Wall time: 5.09 s
```

```output
'\n\nPresident Biden is discussing the American Rescue Plan and the Bipartisan Infrastructure Law, which will create jobs and help Americans. He also talks about his vision for America, which includes investing in education and infrastructure. In response to Russian aggression in Ukraine, the United States is joining with European allies to impose sanctions and isolate Russia. American forces are being mobilized to protect NATO countries in the event that Putin decides to keep moving west. The Ukrainians are bravely fighting back, but the next few weeks will be hard for them. Putin will pay a high price for his actions in the long run. Americans should not be alarmed, as the United States is taking action to protect its interests and allies.'
```

다시 실행하면 실행 속도가 크게 향상되지만 최종 답변이 다릅니다. 이는 맵 단계에서는 캐싱되지만 리듀스 단계에서는 캐싱되지 않기 때문입니다.

```python
%%time
chain.run(docs)
```

```output
CPU times: user 11.5 ms, sys: 4.33 ms, total: 15.8 ms
Wall time: 1.04 s
```

```output
'\n\nPresident Biden is discussing the American Rescue Plan and the Bipartisan Infrastructure Law, which will create jobs and help Americans. He also talks about his vision for America, which includes investing in education and infrastructure.'
```

```python
!rm .langchain.db sqlite.db
```

## OpenSearch Semantic 캐시

[OpenSearch](https://python.langchain.com/docs/integrations/vectorstores/opensearch/)를 의미 기반 캐시로 사용하여 프롬프트와 응답을 캐시하고 의미 유사성을 기반으로 적중률을 평가할 수 있습니다.

```python
from langchain_community.cache import OpenSearchSemanticCache
from langchain_openai import OpenAIEmbeddings

set_llm_cache(
    OpenSearchSemanticCache(
        opensearch_url="http://localhost:9200", embedding=OpenAIEmbeddings()
    )
)
```

```python
%%time
# The first time, it is not yet in cache, so it should take longer
llm("Tell me a joke")
```

```output
CPU times: user 39.4 ms, sys: 11.8 ms, total: 51.2 ms
Wall time: 1.55 s
```

```output
"\n\nWhy don't scientists trust atoms?\n\nBecause they make up everything."
```

```python
%%time
# The second time, while not a direct hit, the question is semantically similar to the original question,
# so it uses the cached result!
llm("Tell me one joke")
```

```output
CPU times: user 4.66 ms, sys: 1.1 ms, total: 5.76 ms
Wall time: 113 ms
```

```output
"\n\nWhy don't scientists trust atoms?\n\nBecause they make up everything."
```
