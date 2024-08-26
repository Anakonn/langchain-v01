---
translated: true
---

# Cassandra

[Cassandra](https://cassandra.apache.org/)는 NoSQL, 행 지향적, 고확장성 및 고가용성 데이터베이스입니다. 5.0 버전부터 데이터베이스에 [벡터 검색 기능](https://cassandra.apache.org/doc/trunk/cassandra/vector-search/overview.html)이 포함되어 있습니다.

## 개요

Cassandra 문서 로더는 Cassandra 데이터베이스에서 Langchain 문서 목록을 반환합니다.

문서를 검색하려면 CQL 쿼리 또는 테이블 이름을 제공해야 합니다.
로더는 다음과 같은 매개변수를 사용합니다:

* table: (선택 사항) 데이터를 로드할 테이블입니다.
* session: (선택 사항) Cassandra 드라이버 세션입니다. 제공되지 않으면 cassio 해결된 세션이 사용됩니다.
* keyspace: (선택 사항) 테이블의 키스페이스입니다. 제공되지 않으면 cassio 해결된 키스페이스가 사용됩니다.
* query: (선택 사항) 데이터를 로드하는 데 사용되는 쿼리입니다.
* page_content_mapper: (선택 사항) 행을 문자열 페이지 콘텐츠로 변환하는 함수입니다. 기본값은 행을 JSON으로 변환합니다.
* metadata_mapper: (선택 사항) 행을 메타데이터 사전으로 변환하는 함수입니다.
* query_parameters: (선택 사항) `session.execute`를 호출할 때 사용되는 쿼리 매개변수입니다.
* query_timeout: (선택 사항) `session.execute`를 호출할 때 사용되는 쿼리 시간 초과입니다.
* query_custom_payload: (선택 사항) `session.execute`를 호출할 때 사용되는 custom_payload입니다.
* query_execution_profile: (선택 사항) `session.execute`를 호출할 때 사용되는 execution_profile입니다.
* query_host: (선택 사항) `session.execute`를 호출할 때 사용되는 호스트입니다.
* query_execute_as: (선택 사항) `session.execute`를 호출할 때 사용되는 execute_as입니다.

## 문서 로더로 문서 로드하기

```python
from langchain_community.document_loaders import CassandraLoader
```

### Cassandra 드라이버 세션에서 초기화하기

`cassandra.cluster.Session` 객체를 생성해야 합니다. 이에 대한 자세한 내용은 [Cassandra 드라이버 문서](https://docs.datastax.com/en/developer/python-driver/latest/api/cassandra/cluster/#module-cassandra.cluster)를 참조하세요. 네트워크 설정 및 인증과 같은 세부 사항은 다를 수 있지만, 다음과 같은 코드일 수 있습니다:

```python
from cassandra.cluster import Cluster

cluster = Cluster()
session = cluster.connect()
```

Cassandra 인스턴스의 기존 키스페이스 이름을 제공해야 합니다:

```python
CASSANDRA_KEYSPACE = input("CASSANDRA_KEYSPACE = ")
```

문서 로더 생성하기:

```python
loader = CassandraLoader(
    table="movie_reviews",
    session=session,
    keyspace=CASSANDRA_KEYSPACE,
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

```output
Document(page_content='Row(_id=\'659bdffa16cbc4586b11a423\', title=\'Dangerous Men\', reviewtext=\'"Dangerous Men,"  the picture\\\'s production notes inform, took 26 years to reach the big screen. After having seen it, I wonder: What was the rush?\')', metadata={'table': 'movie_reviews', 'keyspace': 'default_keyspace'})
```

### Cassio에서 초기화하기

Cassio를 사용하여 세션과 키스페이스를 구성할 수도 있습니다.

```python
import cassio

cassio.init(contact_points="127.0.0.1", keyspace=CASSANDRA_KEYSPACE)

loader = CassandraLoader(
    table="movie_reviews",
)

docs = loader.load()
```

#### 저작권 표시

> Apache Cassandra, Cassandra 및 Apache는 [Apache Software Foundation](http://www.apache.org/)이 미국 및/또는 기타 국가에 등록한 등록 상표 또는 상표입니다.

