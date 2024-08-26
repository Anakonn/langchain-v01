---
translated: true
---

# Google Memorystore for Redis

> [Google Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview)는 Redis in-memory 데이터 스토어를 기반으로 하는 완전 관리형 서비스로, 하위 밀리초 데이터 액세스를 제공하는 애플리케이션 캐시를 구축할 수 있습니다. Memorystore for Redis의 Langchain 통합을 활용하여 데이터베이스 애플리케이션을 확장하여 AI 기반 경험을 구축할 수 있습니다.

이 노트북에서는 `MemorystoreDocumentLoader`와 `MemorystoreDocumentSaver`를 사용하여 [Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview)에 [langchain 문서를 저장, 로드 및 삭제](/docs/modules/data_connection/document_loaders/)하는 방법을 살펴봅니다.

[GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/)에서 패키지에 대해 자세히 알아보세요.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/document_loader.ipynb)

## 시작하기 전에

이 노트북을 실행하려면 다음을 수행해야 합니다:

* [Google Cloud 프로젝트 생성](https://developers.google.com/workspace/guides/create-project)
* [Memorystore for Redis API 활성화](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [Memorystore for Redis 인스턴스 생성](https://cloud.google.com/memorystore/docs/redis/create-instance-console). 버전이 5.0 이상인지 확인하세요.

이 노트북의 런타임 환경에서 데이터베이스에 대한 액세스가 확인되면 다음 값을 입력하고 예제 스크립트를 실행하기 전에 셀을 실행하세요.

```python
# @markdown Please specify an endpoint associated with the instance and a key prefix for demo purpose.
ENDPOINT = "redis://127.0.0.1:6379"  # @param {type:"string"}
KEY_PREFIX = "doc:"  # @param {type:"string"}
```

### 🦜🔗 라이브러리 설치

통합은 `langchain-google-memorystore-redis` 패키지에 있으므로 이를 설치해야 합니다.

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis
```

**Colab only**: 다음 셀의 주석을 해제하거나 커널을 다시 시작하는 버튼을 사용하여 커널을 다시 시작하세요. Vertex AI Workbench의 경우 상단의 버튼을 사용하여 터미널을 다시 시작할 수 있습니다.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloud 프로젝트 설정

이 노트북에서 Google Cloud 리소스를 활용할 수 있도록 Google Cloud 프로젝트를 설정하세요.

프로젝트 ID를 모르는 경우 다음을 시도해 보세요:

* `gcloud config list`를 실행합니다.
* `gcloud projects list`를 실행합니다.
* [프로젝트 ID 찾기](https://support.google.com/googleapi/answer/7014113) 지원 페이지를 참조하세요.

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 인증

이 노트북에 로그인된 IAM 사용자로 Google Cloud에 인증하여 Google Cloud 프로젝트에 액세스할 수 있습니다.

- Colab을 사용하여 이 노트북을 실행하는 경우 아래 셀을 사용하고 계속하세요.
- Vertex AI Workbench를 사용하는 경우 [여기](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)의 설정 지침을 확인하세요.

```python
from google.colab import auth

auth.authenticate_user()
```

## 기본 사용법

### 문서 저장

`MemorystoreDocumentSaver.add_documents(<documents>)`를 사용하여 langchain 문서를 저장합니다. `MemorystoreDocumentSaver` 클래스를 초기화하려면 다음 두 가지가 필요합니다:

1. `client` - `redis.Redis` 클라이언트 객체.
1. `key_prefix` - Redis에 문서를 저장할 키의 접두사.

문서는 지정된 `key_prefix`의 무작위로 생성된 키에 저장됩니다. 또는 `add_documents` 메서드에서 `ids`를 지정하여 키의 접미사를 지정할 수 있습니다.

```python
import redis
from langchain_core.documents import Document
from langchain_google_memorystore_redis import MemorystoreDocumentSaver

test_docs = [
    Document(
        page_content="Apple Granny Smith 150 0.99 1",
        metadata={"fruit_id": 1},
    ),
    Document(
        page_content="Banana Cavendish 200 0.59 0",
        metadata={"fruit_id": 2},
    ),
    Document(
        page_content="Orange Navel 80 1.29 1",
        metadata={"fruit_id": 3},
    ),
]
doc_ids = [f"{i}" for i in range(len(test_docs))]

redis_client = redis.from_url(ENDPOINT)
saver = MemorystoreDocumentSaver(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_field="page_content",
)
saver.add_documents(test_docs, ids=doc_ids)
```

### 문서 로드

특정 접두사로 저장된 모든 문서를 로드하는 로더를 초기화합니다.

`MemorystoreDocumentLoader.load()`또는 `MemorystoreDocumentLoader.lazy_load()`를 사용하여 langchain 문서를 로드합니다. `lazy_load`는 반복 중에만 데이터베이스를 쿼리하는 생성기를 반환합니다. `MemorystoreDocumentLoader` 클래스를 초기화하려면 다음이 필요합니다:

1. `client` - `redis.Redis` 클라이언트 객체.
1. `key_prefix` - Redis에 문서를 저장할 키의 접두사.

```python
import redis
from langchain_google_memorystore_redis import MemorystoreDocumentLoader

redis_client = redis.from_url(ENDPOINT)
loader = MemorystoreDocumentLoader(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_fields=set(["page_content"]),
)
for doc in loader.lazy_load():
    print("Loaded documents:", doc)
```

### 문서 삭제

`MemorystoreDocumentSaver.delete()`를 사용하여 Memorystore for Redis 인스턴스에서 지정된 접두사의 모든 키를 삭제할 수 있습니다. 알고 있는 경우 키의 접미사를 지정할 수도 있습니다.

```python
docs = loader.load()
print("Documents before delete:", docs)

saver.delete(ids=[0])
print("Documents after delete:", loader.load())

saver.delete()
print("Documents after delete all:", loader.load())
```

## 고급 사용법

### 문서 페이지 콘텐츠 및 메타데이터 사용자 정의

1개 이상의 콘텐츠 필드로 로더를 초기화하면 로드된 문서의 `page_content`에는 `content_fields`에 지정된 필드와 동일한 최상위 필드가 포함된 JSON 인코딩 문자열이 포함됩니다.

`metadata_fields`가 지정된 경우 로드된 문서의 `metadata` 필드에는 지정된 `metadata_fields`와 동일한 최상위 필드만 포함됩니다. 메타데이터 필드의 값이 JSON 인코딩 문자열로 저장된 경우 메타데이터 필드에 로드되기 전에 디코딩됩니다.

```python
loader = MemorystoreDocumentLoader(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_fields=set(["content_field_1", "content_field_2"]),
    metadata_fields=set(["title", "author"]),
)
```
