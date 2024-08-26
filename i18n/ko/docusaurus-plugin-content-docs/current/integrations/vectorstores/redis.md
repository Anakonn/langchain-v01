---
translated: true
---

# 레디스

>[Redis 벡터 데이터베이스](https://redis.io/docs/get-started/vector-database/) 소개 및 langchain 통합 가이드.

## 레디스란 무엇인가?

대부분의 웹 서비스 배경을 가진 개발자들은 `레디스`를 잘 알고 있습니다. 기본적으로 `레디스`는 오픈 소스 키-값 저장소로, 캐시, 메시지 브로커, 데이터베이스로 사용됩니다. 개발자들은 `레디스`가 빠르고, 클라이언트 라이브러리 생태계가 크며, 주요 기업들에 의해 수년간 배포되어 왔기 때문에 선택합니다.

이러한 전통적인 사용 사례 외에도, `레디스`는 사용자들이 `레디스` 내에서 보조 인덱스 구조를 만들 수 있는 검색 및 쿼리 기능과 같은 추가 기능을 제공합니다. 이를 통해 `레디스`는 캐시 속도로 벡터 데이터베이스가 될 수 있습니다.

## 벡터 데이터베이스로서의 레디스

`레디스`는 빠른 인덱싱을 위해 압축된 역 인덱스를 사용하며, 메모리 사용량이 적습니다. 또한 다음과 같은 여러 고급 기능을 지원합니다:

* Redis 해시 및 `JSON`에서 여러 필드 인덱싱
* 벡터 유사성 검색 (`HNSW` (ANN) 또는 `FLAT` (KNN) 사용)
* 벡터 범위 검색 (예: 쿼리 벡터 반경 내 모든 벡터 찾기)
* 성능 손실 없는 증분 인덱싱
* 문서 랭킹 ([tf-idf](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) 사용, 사용자 제공 가중치 선택 가능)
* 필드 가중치
* `AND`, `OR`, `NOT` 연산자를 사용하는 복합 부울 쿼리
* 접두사 매칭, 퍼지 매칭, 정확한 구문 쿼리
* [double-metaphone 음성 매칭](https://redis.io/docs/stack/search/reference/phonetic_matching/) 지원
* 자동 완성 제안 (퍼지 접두사 제안 포함)
* [여러 언어](https://redis.io/docs/stack/search/reference/stemming/)에서의 스테밍 기반 쿼리 확장 ([Snowball](http://snowballstem.org/)) 사용)
* [중국어 언어 토큰화 및 쿼리](https://github.com/lionsoul2014/friso)) 지원 (using [Friso](https://github.com/lionsoul2014/friso)))
* 숫자 필터 및 범위
* Redis 지리적 인덱싱을 사용한 지리적 검색
* 강력한 집계 엔진
* 모든 `utf-8` 인코딩된 텍스트 지원
* 전체 문서, 선택된 필드 또는 문서 ID만 검색
* 결과 정렬 (예: 생성 날짜 기준)

## 클라이언트

`레디스`는 벡터 데이터베이스 이상의 기능을 제공하기 때문에, 종종 `LangChain` 통합 외에도 `레디스` 클라이언트를 사용하는 경우가 많습니다. 표준 `레디스` 클라이언트 라이브러리를 사용하여 검색 및 쿼리 명령을 실행할 수 있지만, 검색 및 쿼리 API를 래핑하는 라이브러리를 사용하는 것이 가장 쉽습니다. 아래는 몇 가지 예시이며, 더 많은 클라이언트 라이브러리는 [여기](https://redis.io/resources/clients/)에서 찾을 수 있습니다.

| 프로젝트 | 언어 | 라이선스 | 작성자 | 별점 |
|----------|---------|--------|---------|-------|
| [jedis][jedis-url] | 자바 | MIT | [Redis][redis-url] | ![Stars][jedis-stars] |
| [redisvl][redisvl-url] | 파이썬 | MIT | [Redis][redis-url] | ![Stars][redisvl-stars] |
| [redis-py][redis-py-url] | 파이썬 | MIT | [Redis][redis-url] | ![Stars][redis-py-stars] |
| [node-redis][node-redis-url] | Node.js | MIT | [Redis][redis-url] | ![Stars][node-redis-stars] |
| [nredisstack][nredisstack-url] | .NET | MIT | [Redis][redis-url] | ![Stars][nredisstack-stars] |

[redis-url]: https://redis.com

[redisvl-url]: https://github.com/RedisVentures/redisvl
[redisvl-stars]: https://img.shields.io/github/stars/RedisVentures/redisvl.svg?style=social&amp;label=Star&amp;maxAge=2592000
[redisvl-package]: https://pypi.python.org/pypi/redisvl

[redis-py-url]: https://github.com/redis/redis-py
[redis-py-stars]: https://img.shields.io/github/stars/redis/redis-py.svg?style=social&amp;label=Star&amp;maxAge=2592000
[redis-py-package]: https://pypi.python.org/pypi/redis

[jedis-url]: https://github.com/redis/jedis
[jedis-stars]: https://img.shields.io/github/stars/redis/jedis.svg?style=social&amp;label=Star&amp;maxAge=2592000
[Jedis-package]: https://search.maven.org/artifact/redis.clients/jedis

[nredisstack-url]: https://github.com/redis/nredisstack
[nredisstack-stars]: https://img.shields.io/github/stars/redis/nredisstack.svg?style=social&amp;label=Star&amp;maxAge=2592000
[nredisstack-package]: https://www.nuget.org/packages/nredisstack/

[node-redis-url]: https://github.com/redis/node-redis
[node-redis-stars]: https://img.shields.io/github/stars/redis/node-redis.svg?style=social&amp;label=Star&amp;maxAge=2592000
[node-redis-package]: https://www.npmjs.com/package/redis

[redis-om-python-url]: https://github.com/redis/redis-om-python
[redis-om-python-author]: https://redis.com
[redis-om-python-stars]: https://img.shields.io/github/stars/redis/redis-om-python.svg?style=social&amp;label=Star&amp;maxAge=2592000

[redisearch-go-url]: https://github.com/RediSearch/redisearch-go
[redisearch-go-author]: https://redis.com
[redisearch-go-stars]: https://img.shields.io/github/stars/RediSearch/redisearch-go.svg?style=social&amp;label=Star&amp;maxAge=2592000

[redisearch-api-rs-url]: https://github.com/RediSearch/redisearch-api-rs
[redisearch-api-rs-author]: https://redis.com
[redisearch-api-rs-stars]: https://img.shields.io/github/stars/RediSearch/redisearch-api-rs.svg?style=social&amp;label=Star&amp;maxAge=2592000

## 배포 옵션

RediSearch와 함께 Redis를 배포하는 방법은 여러 가지가 있습니다. 가장 쉽게 시작할 수 있는 방법은 Docker를 사용하는 것이지만, 배포를 위한 여러 잠재적 옵션이 있습니다.

- [Redis Cloud](https://redis.com/redis-enterprise-cloud/overview/)
- [Docker (Redis Stack)](https://hub.docker.com/r/redis/redis-stack)
- 클라우드 마켓플레이스: [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-e6y7ork67pjwg?sr=0-2&ref_=beagle&applicationId=AWSMPContessa), [Google Marketplace](https://console.cloud.google.com/marketplace/details/redislabs-public/redis-enterprise?pli=1), 또는 [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/garantiadata.redis_enterprise_1sp_public_preview?tab=Overview)
- 온프레미스: [Redis Enterprise Software](https://redis.com/redis-enterprise-software/overview/)
- 쿠버네티스: [Redis Enterprise Software on Kubernetes](https://docs.redis.com/latest/kubernetes/)

## 추가 예제

많은 예제는 [Redis AI 팀의 GitHub](https://github.com/RedisVentures/)에서 찾을 수 있습니다.

- [멋진 Redis AI 리소스](https://github.com/RedisVentures/redis-ai-resources) - AI 작업에서 Redis를 사용하는 예제 목록
- [Azure OpenAI Embeddings Q&A](https://github.com/ruoccofabrizio/azure-open-ai-embeddings-qna) - Azure에서 Q&A 서비스로 OpenAI와 Redis.
- [ArXiv 논문 검색](https://github.com/RedisVentures/redis-arXiv-search) - ArXiv 학술 논문에 대한 시맨틱 검색
- [Azure에서의 벡터 검색](https://learn.microsoft.com/azure/azure-cache-for-redis/cache-tutorial-vector-similarity) - Azure Cache for Redis와 Azure OpenAI를 사용한 Azure에서의 벡터 검색

## 추가 리소스

벡터 데이터베이스로서 Redis를 사용하는 방법에 대한 자세한 정보는 다음 리소스를 참조하세요:

- [RedisVL 문서](https://redisvl.com) - Redis 벡터 라이브러리 클라이언트 문서
- [Redis 벡터 유사성 문서](https://redis.io/docs/stack/search/reference/vectors/) - 벡터 검색을 위한 Redis 공식 문서.
- [Redis-py 검색 문서](https://redis.readthedocs.io/en/latest/redismodules.html#redisearch-commands) - Redis-py 클라이언트 라이브러리 문서
- [벡터 유사성 검색: 기본부터 프로덕션까지](https://mlops.community/vector-similarity-search-from-basics-to-production/) - VSS와 Redis를 벡터DB로 소개하는 블로그 포스트.

## 설정하기

### Redis Python 클라이언트 설치

`Redis-py`는 Redis에서 공식적으로 지원하는 클라이언트입니다. 최근에는 벡터 데이터베이스 사용 사례에 특화된 `RedisVL` 클라이언트가 출시되었습니다. 둘 다 pip으로 설치할 수 있습니다.

```python
%pip install --upgrade --quiet  redis redisvl langchain-openai tiktoken
```

우리는 `OpenAIEmbeddings`를 사용하고자 하므로 OpenAI API 키를 얻어야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

### 로컬에서 Redis 배포

로컬에서 Redis를 배포하려면 다음을 실행하세요:

```console
docker run -d -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

정상적으로 실행되고 있다면 `http://localhost:8001`에서 멋진 Redis UI를 볼 수 있어야 합니다. 다른 배포 방법은 위의 [배포 옵션](#배포-options) 섹션을 참조하세요.

### Redis 연결 URL 스키마

유효한 Redis URL 스키마는 다음과 같습니다:
1. `redis://`  - Redis 독립형에 연결, 암호화되지 않음
2. `rediss://` - TLS 암호화를 사용하여 Redis 독립형에 연결
3. `redis+sentinel://`  - Redis 센티넬을 통해 Redis 서버에 연결, 암호화되지 않음
4. `rediss+sentinel://` - Redis 센티넬을 통해 Redis 서버에 연결, 둘 다 TLS 암호화 연결

추가 연결 매개변수에 대한 정보는 [redis-py 문서](https://redis-py.readthedocs.io/en/stable/connections.html)에서 찾을 수 있습니다.

```python
# connection to redis standalone at localhost, db 0, no password
redis_url = "redis://localhost:6379"
# connection to host "redis" port 7379 with db 2 and password "secret" (old style authentication scheme without username / pre 6.x)
redis_url = "redis://:secret@redis:7379/2"
# connection to host redis on default port with user "joe", pass "secret" using redis version 6+ ACLs
redis_url = "redis://joe:secret@redis/0"

# connection to sentinel at localhost with default group mymaster and db 0, no password
redis_url = "redis+sentinel://localhost:26379"
# connection to sentinel at host redis with default port 26379 and user "joe" with password "secret" with default group mymaster and db 0
redis_url = "redis+sentinel://joe:secret@redis"
# connection to sentinel, no auth with sentinel monitoring group "zone-1" and database 2
redis_url = "redis+sentinel://redis:26379/zone-1/2"

# connection to redis standalone at localhost, db 0, no password but with TLS support
redis_url = "rediss://localhost:6379"
# connection to redis sentinel at localhost and default port, db 0, no password
# but with TLS support for booth Sentinel and Redis server
redis_url = "rediss+sentinel://localhost"
```

### 샘플 데이터

먼저 Redis 벡터 저장소의 다양한 속성을 시연하기 위해 몇 가지 샘플 데이터를 설명합니다.

```python
metadata = [
    {
        "user": "john",
        "age": 18,
        "job": "engineer",
        "credit_score": "high",
    },
    {
        "user": "derrick",
        "age": 45,
        "job": "doctor",
        "credit_score": "low",
    },
    {
        "user": "nancy",
        "age": 94,
        "job": "doctor",
        "credit_score": "high",
    },
    {
        "user": "tyler",
        "age": 100,
        "job": "engineer",
        "credit_score": "high",
    },
    {
        "user": "joe",
        "age": 35,
        "job": "dentist",
        "credit_score": "medium",
    },
]
texts = ["foo", "foo", "foo", "bar", "bar"]
```

### Redis 벡터 저장소 생성

The Redis VectorStore instance는 여러 가지 방법으로 초기화할 수 있습니다. Redis VectorStore 인스턴스를 초기화하는 데 사용할 수 있는 여러 클래스 메서드가 있습니다.

- ``Redis.__init__`` - 직접 초기화
- ``Redis.from_documents`` - ``Langchain.docstore.Document`` 객체 목록에서 초기화
- ``Redis.from_texts`` - 텍스트 목록에서 초기화 (옵션으로 메타데이터 포함)
- ``Redis.from_texts_return_keys`` - 텍스트 목록에서 초기화 (옵션으로 메타데이터 포함)하고 키 반환
- ``Redis.from_existing_index`` - 기존 Redis 인덱스에서 초기화

아래에서는 ``Redis.from_texts`` 메서드를 사용할 것입니다.

```python
from langchain_community.vectorstores.redis import Redis

rds = Redis.from_texts(
    texts,
    embeddings,
    metadatas=metadata,
    redis_url="redis://localhost:6379",
    index_name="users",
)
```

```python
rds.index_name
```

```output
'users'
```

## 생성된 인덱스 검사

``Redis`` VectorStore 객체가 생성되면, 이미 존재하지 않는 경우 Redis에 인덱스가 생성됩니다. 인덱스는 ``rvl`` 및 ``redis-cli`` 명령줄 도구로 검사할 수 있습니다. 위에서 ``redisvl``을 설치한 경우, ``rvl`` 명령줄 도구를 사용하여 인덱스를 검사할 수 있습니다.

```python
# assumes you're running Redis locally (use --host, --port, --password, --username, to change this)
!rvl index listall
```

```output
[32m16:58:26[0m [34m[RedisVL][0m [1;30mINFO[0m   Indices:
[32m16:58:26[0m [34m[RedisVL][0m [1;30mINFO[0m   1. users
```

``Redis`` VectorStore 구현은 ``from_texts``, ``from_texts_return_keys``, 및 ``from_documents`` 메서드를 통해 전달된 메타데이터에 대해 인덱스 스키마(필터링을 위한 필드)를 생성하려고 시도합니다. 이 방법으로 전달된 모든 메타데이터는 Redis 검색 인덱스에 인덱싱되어 해당 필드에 대한 필터링이 가능합니다.

아래에서는 위에서 정의한 메타데이터에서 생성된 필드를 보여줍니다.

```python
!rvl index info -i users
```

```output


Index Information:
╭──────────────┬────────────────┬───────────────┬─────────────────┬────────────╮
│ Index Name   │ Storage Type   │ Prefixes      │ Index Options   │   Indexing │
├──────────────┼────────────────┼───────────────┼─────────────────┼────────────┤
│ users        │ HASH           │ ['doc:users'] │ []              │          0 │
╰──────────────┴────────────────┴───────────────┴─────────────────┴────────────╯
Index Fields:
╭────────────────┬────────────────┬─────────┬────────────────┬────────────────╮
│ Name           │ Attribute      │ Type    │ Field Option   │   Option Value │
├────────────────┼────────────────┼─────────┼────────────────┼────────────────┤
│ user           │ user           │ TEXT    │ WEIGHT         │              1 │
│ job            │ job            │ TEXT    │ WEIGHT         │              1 │
│ credit_score   │ credit_score   │ TEXT    │ WEIGHT         │              1 │
│ content        │ content        │ TEXT    │ WEIGHT         │              1 │
│ age            │ age            │ NUMERIC │                │                │
│ content_vector │ content_vector │ VECTOR  │                │                │
╰────────────────┴────────────────┴─────────┴────────────────┴────────────────╯
```

```python
!rvl stats -i users
```

```output

Statistics:
╭─────────────────────────────┬─────────────╮
│ Stat Key                    │ Value       │
├─────────────────────────────┼─────────────┤
│ num_docs                    │ 5           │
│ num_terms                   │ 15          │
│ max_doc_id                  │ 5           │
│ num_records                 │ 33          │
│ percent_indexed             │ 1           │
│ hash_indexing_failures      │ 0           │
│ number_of_uses              │ 4           │
│ bytes_per_record_avg        │ 4.60606     │
│ doc_table_size_mb           │ 0.000524521 │
│ inverted_sz_mb              │ 0.000144958 │
│ key_table_size_mb           │ 0.000193596 │
│ offset_bits_per_record_avg  │ 8           │
│ offset_vectors_sz_mb        │ 2.19345e-05 │
│ offsets_per_term_avg        │ 0.69697     │
│ records_per_doc_avg         │ 6.6         │
│ sortable_values_size_mb     │ 0           │
│ total_indexing_time         │ 0.32        │
│ total_inverted_index_blocks │ 16          │
│ vector_index_sz_mb          │ 6.0126      │
╰─────────────────────────────┴─────────────╯
```

메타데이터의 ``user``, ``job``, ``credit_score`` 및 ``age``가 인덱스 내 필드가 되어야 한다고 명시하지 않았다는 점에 주목하십시오. 이는 ``Redis`` VectorStore 객체가 전달된 메타데이터에서 자동으로 인덱스 스키마를 생성하기 때문입니다. 인덱스 필드 생성에 대한 자세한 내용은 API 문서를 참조하십시오.

## 쿼리

사용 사례에 따라 ``Redis`` VectorStore 구현을 쿼리하는 여러 가지 방법이 있습니다:

- ``similarity_search``: 주어진 벡터와 가장 유사한 벡터 찾기.
- ``similarity_search_with_score``: 주어진 벡터와 가장 유사한 벡터를 찾아 벡터 거리를 반환.
- ``similarity_search_limit_score``: 주어진 벡터와 가장 유사한 벡터를 찾아 결과 수를 ``score_threshold``로 제한.
- ``similarity_search_with_relevance_scores``: 주어진 벡터와 가장 유사한 벡터를 찾아 벡터 유사성을 반환.
- ``max_marginal_relevance_search``: 다양성을 최적화하면서 주어진 벡터와 가장 유사한 벡터 찾기.

```python
results = rds.similarity_search("foo")
print(results[0].page_content)
```

```output
foo
```

```python
# return metadata
results = rds.similarity_search("foo", k=3)
meta = results[1].metadata
print("Key of the document in Redis: ", meta.pop("id"))
print("Metadata of the document: ", meta)
```

```output
Key of the document in Redis:  doc:users:a70ca43b3a4e4168bae57c78753a200f
Metadata of the document:  {'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}
```

```python
# with scores (distances)
results = rds.similarity_search_with_score("foo", k=5)
for result in results:
    print(f"Content: {result[0].page_content} --- Score: {result[1]}")
```

```output
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: bar --- Score: 0.1566
Content: bar --- Score: 0.1566
```

```python
# limit the vector distance that can be returned
results = rds.similarity_search_with_score("foo", k=5, distance_threshold=0.1)
for result in results:
    print(f"Content: {result[0].page_content} --- Score: {result[1]}")
```

```output
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
```

```python
# with scores
results = rds.similarity_search_with_relevance_scores("foo", k=5)
for result in results:
    print(f"Content: {result[0].page_content} --- Similiarity: {result[1]}")
```

```output
Content: foo --- Similiarity: 1.0
Content: foo --- Similiarity: 1.0
Content: foo --- Similiarity: 1.0
Content: bar --- Similiarity: 0.8434
Content: bar --- Similiarity: 0.8434
```

```python
# limit scores (similarities have to be over .9)
results = rds.similarity_search_with_relevance_scores("foo", k=5, score_threshold=0.9)
for result in results:
    print(f"Content: {result[0].page_content} --- Similarity: {result[1]}")
```

```output
Content: foo --- Similarity: 1.0
Content: foo --- Similarity: 1.0
Content: foo --- Similarity: 1.0
```

```python
# you can also add new documents as follows
new_document = ["baz"]
new_metadata = [{"user": "sam", "age": 50, "job": "janitor", "credit_score": "high"}]
# both the document and metadata must be lists
rds.add_texts(new_document, new_metadata)
```

```output
['doc:users:b9c71d62a0a34241a37950b448dafd38']
```

```python
# now query the new document
results = rds.similarity_search("baz", k=3)
print(results[0].metadata)
```

```output
{'id': 'doc:users:b9c71d62a0a34241a37950b448dafd38', 'user': 'sam', 'job': 'janitor', 'credit_score': 'high', 'age': '50'}
```

```python
# use maximal marginal relevance search to diversify results
results = rds.max_marginal_relevance_search("foo")
```

```python
# the lambda_mult parameter controls the diversity of the results, the lower the more diverse
results = rds.max_marginal_relevance_search("foo", lambda_mult=0.1)
```

## 기존 인덱스에 연결

``Redis`` VectorStore를 사용할 때 동일한 메타데이터가 인덱싱되도록 하려면, yaml 파일 경로 또는 사전 형식으로 전달된 동일한 ``index_schema``가 필요합니다. 다음은 인덱스에서 스키마를 얻고 기존 인덱스에 연결하는 방법을 보여줍니다.

```python
# write the schema to a yaml file
rds.write_schema("redis_schema.yaml")
```

이 예제의 스키마 파일은 다음과 같아야 합니다:

```yaml
numeric:
- name: age
  no_index: false
  sortable: false
text:
- name: user
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: job
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: credit_score
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: content
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
vector:
- algorithm: FLAT
  block_size: 1000
  datatype: FLOAT32
  dims: 1536
  distance_metric: COSINE
  initial_cap: 20000
  name: content_vector
```

**주의**, 여기에는 스키마의 **모든** 가능한 필드가 포함됩니다. 필요하지 않은 필드는 제거할 수 있습니다.

```python
# now we can connect to our existing index as follows

new_rds = Redis.from_existing_index(
    embeddings,
    index_name="users",
    redis_url="redis://localhost:6379",
    schema="redis_schema.yaml",
)
results = new_rds.similarity_search("foo", k=3)
print(results[0].metadata)
```

```output
{'id': 'doc:users:8484c48a032d4c4cbe3cc2ed6845fabb', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}
```

```python
# see the schemas are the same
new_rds.schema == rds.schema
```

```output
True
```

## 사용자 지정 메타데이터 인덱싱

일부 경우에는 메타데이터가 매핑되는 필드를 제어하려고 할 수 있습니다. 예를 들어, ``credit_score`` 필드를 텍스트 필드 대신 범주형 필드로 지정하고자 할 수 있습니다(모든 문자열 필드에 대한 기본 동작). 이 경우, 위 초기화 메서드 각각에서 ``index_schema`` 매개변수를 사용하여 인덱스 스키마를 지정할 수 있습니다. 사용자 지정 인덱스 스키마는 사전 형식으로 전달하거나 YAML 파일 경로로 전달할 수 있습니다.

스키마의 모든 인수는 이름을 제외하고 기본값이 있으므로 변경하려는 필드만 지정할 수 있습니다. 모든 이름은 ``redis-cli`` 또는 ``redis-py``에서 사용할 명령줄 인수의 스네이크/소문자 버전과 일치합니다. 각 필드에 대한 인수에 대한 자세한 내용은 [문서](https://redis.io/docs/interact/search-and-query/basic-constructs/field-and-type-options/)를 참조하십시오.

아래 예제는 ``credit_score`` 필드를 텍스트 필드 대신 태그(범주형) 필드로 지정하는 방법을 보여줍니다.

```yaml
# index_schema.yml
tag:
    - name: credit_score
text:
    - name: user
    - name: job
numeric:
    - name: age
```

Python에서는 다음과 같습니다:

```python

index_schema = {
    "tag": [{"name": "credit_score"}],
    "text": [{"name": "user"}, {"name": "job"}],
    "numeric": [{"name": "age"}],
}

```

이름 필드만 지정하면 됩니다. 다른 모든 필드는 기본값이 있습니다.

```python
# create a new index with the new schema defined above
index_schema = {
    "tag": [{"name": "credit_score"}],
    "text": [{"name": "user"}, {"name": "job"}],
    "numeric": [{"name": "age"}],
}

rds, keys = Redis.from_texts_return_keys(
    texts,
    embeddings,
    metadatas=metadata,
    redis_url="redis://localhost:6379",
    index_name="users_modified",
    index_schema=index_schema,  # pass in the new index schema
)
```

```output
`index_schema` does not match generated metadata schema.
If you meant to manually override the schema, please ignore this message.
index_schema: {'tag': [{'name': 'credit_score'}], 'text': [{'name': 'user'}, {'name': 'job'}], 'numeric': [{'name': 'age'}]}
generated_schema: {'text': [{'name': 'user'}, {'name': 'job'}, {'name': 'credit_score'}], 'numeric': [{'name': 'age'}], 'tag': []}
```

위 경고는 기본 동작을 재정의할 때 사용자에게 알리기 위한 것입니다. 의도적으로 동작을 재정의하는 경우 무시하십시오.

## 하이브리드 필터링

LangChain에 내장된 Redis Filter Expression 언어를 사용하면 검색 결과를 필터링하는 데 사용할 수 있는 임의의 길이의 하이브리드 필터 체인을 만들 수 있습니다. 표현 언어는 [RedisVL Expression Syntax](https://redisvl.com)에서 파생되었으며 사용 및 이해하기 쉽게 설계되었습니다.

다음은 사용 가능한 필터 유형입니다:
- ``RedisText``: 메타데이터 필드에 대한 전체 텍스트 검색으로 필터링합니다. 정확, 퍼지 및 와일드카드 매칭을 지원합니다.
- ``RedisNum``: 메타데이터 필드에 대한 숫자 범위로 필터링합니다.
- ``RedisTag``: 문자열 기반 범주형 메타데이터 필드에 대해 정확히 일치하는 것으로 필터링합니다. 여러 태그를 "tag1, tag2, tag3"와 같이 지정할 수 있습니다.

다음은 이러한 필터를 활용하는 예입니다.

```python

from langchain_community.vectorstores.redis import RedisText, RedisNum, RedisTag

# exact matching
has_high_credit = RedisTag("credit_score") == "high"
does_not_have_high_credit = RedisTag("credit_score") != "low"

# fuzzy matching
job_starts_with_eng = RedisText("job") % "eng*"
job_is_engineer = RedisText("job") == "engineer"
job_is_not_engineer = RedisText("job") != "engineer"

# numeric filtering
age_is_18 = RedisNum("age") == 18
age_is_not_18 = RedisNum("age") != 18
age_is_greater_than_18 = RedisNum("age") > 18
age_is_less_than_18 = RedisNum("age") < 18
age_is_greater_than_or_equal_to_18 = RedisNum("age") >= 18
age_is_less_than_or_equal_to_18 = RedisNum("age") <= 18

```

``RedisFilter`` 클래스를 사용하여 이러한 필터의 가져오기를 단순화할 수 있습니다.

```python

from langchain_community.vectorstores.redis import RedisFilter

# same examples as above
has_high_credit = RedisFilter.tag("credit_score") == "high"
does_not_have_high_credit = RedisFilter.num("age") > 8
job_starts_with_eng = RedisFilter.text("job") % "eng*"
```

다음은 검색을 위한 하이브리드 필터를 사용하는 예입니다.

```python
from langchain_community.vectorstores.redis import RedisText

is_engineer = RedisText("job") == "engineer"
results = rds.similarity_search("foo", k=3, filter=is_engineer)

print("Job:", results[0].metadata["job"])
print("Engineers in the dataset:", len(results))
```

```output
Job: engineer
Engineers in the dataset: 2
```

```python
# fuzzy match
starts_with_doc = RedisText("job") % "doc*"
results = rds.similarity_search("foo", k=3, filter=starts_with_doc)

for result in results:
    print("Job:", result.metadata["job"])
print("Jobs in dataset that start with 'doc':", len(results))
```

```output
Job: doctor
Job: doctor
Jobs in dataset that start with 'doc': 2
```

```python
from langchain_community.vectorstores.redis import RedisNum

is_over_18 = RedisNum("age") > 18
is_under_99 = RedisNum("age") < 99
age_range = is_over_18 & is_under_99
results = rds.similarity_search("foo", filter=age_range)

for result in results:
    print("User:", result.metadata["user"], "is", result.metadata["age"])
```

```output
User: derrick is 45
User: nancy is 94
User: joe is 35
```

```python
# make sure to use parenthesis around FilterExpressions
# if initializing them while constructing them
age_range = (RedisNum("age") > 18) & (RedisNum("age") < 99)
results = rds.similarity_search("foo", filter=age_range)

for result in results:
    print("User:", result.metadata["user"], "is", result.metadata["age"])
```

```output
User: derrick is 45
User: nancy is 94
User: joe is 35
```

## 검색기로서의 Redis

여기에서는 벡터 저장소를 검색기로 사용하는 다양한 옵션을 다룹니다.

검색을 수행하는 데 사용할 수 있는 세 가지 검색 방법이 있습니다. 기본적으로 의미론적 유사성을 사용합니다.

```python
query = "foo"
results = rds.similarity_search_with_score(query, k=3, return_metadata=True)

for result in results:
    print("Content:", result[0].page_content, " --- Score: ", result[1])
```

```output
Content: foo  --- Score:  0.0
Content: foo  --- Score:  0.0
Content: foo  --- Score:  0.0
```

```python
retriever = rds.as_retriever(search_type="similarity", search_kwargs={"k": 4})
```

```python
docs = retriever.invoke(query)
docs
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'}),
 Document(page_content='bar', metadata={'id': 'doc:users_modified:01ef6caac12b42c28ad870aefe574253', 'user': 'tyler', 'job': 'engineer', 'credit_score': 'high', 'age': '100'})]
```

사용자가 벡터 거리를 지정할 수 있는 `similarity_distance_threshold` 검색기도 있습니다.

```python
retriever = rds.as_retriever(
    search_type="similarity_distance_threshold",
    search_kwargs={"k": 4, "distance_threshold": 0.1},
)
```

```python
docs = retriever.invoke(query)
docs
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'})]
```

마지막으로, ``similarity_score_threshold``를 사용하면 유사한 문서의 최소 점수를 정의할 수 있습니다.

```python
retriever = rds.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.9, "k": 10},
)
```

```python
retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'})]
```

```python
retriever = rds.as_retriever(
    search_type="mmr", search_kwargs={"fetch_k": 20, "k": 4, "lambda_mult": 0.1}
)
```

```python
retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users:8f6b673b390647809d510112cde01a27', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='bar', metadata={'id': 'doc:users:93521560735d42328b48c9c6f6418d6a', 'user': 'tyler', 'job': 'engineer', 'credit_score': 'high', 'age': '100'}),
 Document(page_content='foo', metadata={'id': 'doc:users:125ecd39d07845eabf1a699d44134a5b', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'}),
 Document(page_content='foo', metadata={'id': 'doc:users:d6200ab3764c466082fde3eaab972a2a', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'})]
```

## 키 및 인덱스 삭제

항목을 삭제하려면 키로 항목을 지정해야 합니다.

```python
Redis.delete(keys, redis_url="redis://localhost:6379")
```

```output
True
```

```python
# delete the indices too
Redis.drop_index(
    index_name="users", delete_documents=True, redis_url="redis://localhost:6379"
)
Redis.drop_index(
    index_name="users_modified",
    delete_documents=True,
    redis_url="redis://localhost:6379",
)
```

```output
True
```
