---
sidebar_label: Astra DB
translated: true
---

# Astra DB

DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html)는 Cassandra를 기반으로 하는 서버리스 벡터 지원 데이터베이스로, 사용하기 쉬운 JSON API를 통해 편리하게 제공됩니다.

`AstraDBStore`와 `AstraDBByteStore`를 사용하려면 `astrapy` 패키지를 설치해야 합니다:

```python
%pip install --upgrade --quiet  astrapy
```

Store에는 다음과 같은 매개변수가 필요합니다:

* `api_endpoint`: Astra DB API 엔드포인트. `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com` 형식입니다.
* `token`: Astra DB 토큰. `AstraCS:6gBhNmsk135....` 형식입니다.
* `collection_name`: Astra DB 컬렉션 이름
* `namespace`: (선택 사항) Astra DB 네임스페이스

## AstraDBStore

`AstraDBStore`는 모든 데이터를 DataStax Astra DB 인스턴스에 저장하는 `BaseStore`의 구현체입니다.
스토어 키는 문자열이어야 하며 Astra DB 문서의 `_id` 필드에 매핑됩니다.
스토어 값은 `json.dumps`로 직렬화할 수 있는 모든 객체가 될 수 있습니다.
데이터베이스에서 항목은 다음과 같은 형태를 가집니다:

```json
{
  "_id": "<key>",
  "value": <value>
}
```

```python
from langchain_community.storage import AstraDBStore
```

```python
from getpass import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```python
store = AstraDBStore(
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    collection_name="my_store",
)
```

```python
store.mset([("k1", "v1"), ("k2", [0.1, 0.2, 0.3])])
print(store.mget(["k1", "k2"]))
```

```output
['v1', [0.1, 0.2, 0.3]]
```

### CacheBackedEmbeddings와 함께 사용하기

`AstraDBStore`를 [`CacheBackedEmbeddings`](/docs/modules/data_connection/text_embedding/caching_embeddings)와 함께 사용하여 임베딩 계산 결과를 캐시할 수 있습니다.
`AstraDBStore`는 바이트로 변환하지 않고 float 목록으로 임베딩을 저장하므로 `fromByteStore`를 사용하지 않습니다.

```python
from langchain.embeddings import CacheBackedEmbeddings, OpenAIEmbeddings

embeddings = CacheBackedEmbeddings(
    underlying_embeddings=OpenAIEmbeddings(), document_embedding_store=store
)
```

## AstraDBByteStore

`AstraDBByteStore`는 모든 데이터를 DataStax Astra DB 인스턴스에 저장하는 `ByteStore`의 구현체입니다.
스토어 키는 문자열이어야 하며 Astra DB 문서의 `_id` 필드에 매핑됩니다.
스토어 `bytes` 값은 Astra DB에 저장하기 위해 base64 문자열로 변환됩니다.
데이터베이스에서 항목은 다음과 같은 형태를 가집니다:

```json
{
  "_id": "<key>",
  "value": "bytes encoded in base 64"
}
```

```python
from langchain_community.storage import AstraDBByteStore
```

```python
from getpass import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```python
store = AstraDBByteStore(
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    collection_name="my_store",
)
```

```python
store.mset([("k1", b"v1"), ("k2", b"v2")])
print(store.mget(["k1", "k2"]))
```

```output
[b'v1', b'v2']
```
