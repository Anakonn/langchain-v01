---
translated: true
---

# Google Firestore in Datastore Mode

> [Firestore in Datastore Mode](https://cloud.google.com/datastore)는 자동 확장, 고성능 및 애플리케이션 개발의 용이성을 위해 구축된 NoSQL 문서 데이터베이스입니다. Datastore의 Langchain 통합을 활용하여 데이터베이스 애플리케이션을 확장하여 AI 기반 경험을 구축할 수 있습니다.

이 노트북에서는 [Firestore in Datastore Mode](https://cloud.google.com/datastore)를 사용하여 `DatastoreLoader`와 `DatastoreSaver`를 사용하여 [langchain 문서를 저장, 로드 및 삭제](/docs/modules/data_connection/document_loaders/)하는 방법을 살펴봅니다.

[GitHub](https://github.com/googleapis/langchain-google-datastore-python/)에서 패키지에 대해 자세히 알아보세요.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-datastore-python/blob/main/docs/document_loader.ipynb)

## 시작하기 전에

이 노트북을 실행하려면 다음을 수행해야 합니다:

* [Google Cloud 프로젝트 생성](https://developers.google.com/workspace/guides/create-project)
* [Datastore API 활성화](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com)
* [Firestore in Datastore Mode 데이터베이스 생성](https://cloud.google.com/datastore/docs/manage-databases)

이 노트북의 런타임 환경에서 데이터베이스에 대한 액세스가 확인된 후 다음 값을 입력하고 예제 스크립트를 실행하기 전에 셀을 실행하세요.

### 🦜🔗 라이브러리 설치

통합은 자체 `langchain-google-datastore` 패키지에 있으므로 설치해야 합니다.

```python
%pip install -upgrade --quiet langchain-google-datastore
```

**Colab only**: 다음 셀의 주석을 해제하여 커널을 다시 시작하거나 버튼을 사용하여 커널을 다시 시작하세요. Vertex AI Workbench의 경우 상단의 버튼을 사용하여 터미널을 다시 시작할 수 있습니다.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloud 프로젝트 설정

이 노트북 내에서 Google Cloud 리소스를 활용할 수 있도록 Google Cloud 프로젝트를 설정하세요.

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

`DatastoreSaver.upsert_documents(<documents>)`를 사용하여 langchain 문서를 저장합니다. 기본적으로 문서 메타데이터의 `key`에서 엔터티 키를 추출하려고 시도합니다.

```python
from langchain_core.documents import Document
from langchain_google_datastore import DatastoreSaver

saver = DatastoreSaver()

data = [Document(page_content="Hello, World!")]
saver.upsert_documents(data)
```

#### 키 없이 문서 저장

`kind`가 지정된 경우 문서는 자동 생성된 ID로 저장됩니다.

```python
saver = DatastoreSaver("MyKind")

saver.upsert_documents(data)
```

### Kind를 통해 문서 로드

`DatastoreLoader.load()` 또는 `DatastoreLoader.lazy_load()`를 사용하여 langchain 문서를 로드합니다. `lazy_load`는 반복 중에만 데이터베이스를 쿼리하는 생성기를 반환합니다. `DatastoreLoader` 클래스를 초기화하려면 다음을 제공해야 합니다:
1. `source` - 문서를 로드할 소스입니다. Query의 인스턴스이거나 문서를 읽을 Datastore 종류의 이름일 수 있습니다.

```python
from langchain_google_datastore import DatastoreLoader

loader = DatastoreLoader("MyKind")
data = loader.load()
```

### 쿼리를 통해 문서 로드

종류에서 문서를 로드하는 것 외에도 쿼리에서 문서를 로드할 수 있습니다. 예를 들면:

```python
from google.cloud import datastore

client = datastore.Client(database="non-default-db", namespace="custom_namespace")
query_load = client.query(kind="MyKind")
query_load.add_filter("region", "=", "west_coast")

loader_document = DatastoreLoader(query_load)

data = loader_document.load()
```

### 문서 삭제

`DatastoreSaver.delete_documents(<documents>)`를 사용하여 Datastore에서 langchain 문서 목록을 삭제할 수 있습니다.

```python
saver = DatastoreSaver()

saver.delete_documents(data)

keys_to_delete = [
    ["Kind1", "identifier"],
    ["Kind2", 123],
    ["Kind3", "identifier", "NestedKind", 456],
]
# The Documents will be ignored and only the document ids will be used.
saver.delete_documents(data, keys_to_delete)
```

## 고급 사용법

### 사용자 정의 문서 페이지 콘텐츠 및 메타데이터로 문서 로드

`page_content_properties` 및 `metadata_properties` 인수는 LangChain 문서의 `page_content` 및 `metadata`에 작성될 Entity 속성을 지정합니다.

```python
loader = DatastoreLoader(
    source="MyKind",
    page_content_fields=["data_field"],
    metadata_fields=["metadata_field"],
)

data = loader.load()
```

### 페이지 콘텐츠 형식 사용자 정의

`page_content`에 하나의 필드만 포함된 경우 정보는 필드 값만 됩니다. 그렇지 않으면 `page_content`가 JSON 형식이 됩니다.

### 연결 및 인증 사용자 정의

```python
from google.auth import compute_engine
from google.cloud.firestore import Client

client = Client(database="non-default-db", creds=compute_engine.Credentials())
loader = DatastoreLoader(
    source="foo",
    client=client,
)
```
