---
translated: true
---

# Google Firestore (Native Mode)

> [Firestore](https://cloud.google.com/firestore)는 어떤 수요에도 대응할 수 있는 서버리스 문서 지향 데이터베이스입니다. Firestore의 Langchain 통합을 활용하여 AI 기반 경험을 구축하도록 데이터베이스 애플리케이션을 확장할 수 있습니다.

이 노트북에서는 [Firestore](https://cloud.google.com/firestore)를 사용하여 `FirestoreLoader`와 `FirestoreSaver`를 통해 [Langchain 문서를 저장, 로드 및 삭제](/docs/modules/data_connection/document_loaders/)하는 방법을 살펴봅니다.

이 패키지에 대해 자세히 알아보려면 [GitHub](https://github.com/googleapis/langchain-google-firestore-python/)을 참조하세요.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/document_loader.ipynb)

## 시작하기 전에

이 노트북을 실행하려면 다음을 수행해야 합니다:

* [Google Cloud 프로젝트 생성](https://developers.google.com/workspace/guides/create-project)
* [Firestore API 활성화](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [Firestore 데이터베이스 생성](https://cloud.google.com/firestore/docs/manage-databases)

이 노트북의 런타임 환경에서 데이터베이스에 대한 액세스가 확인된 후 다음 값을 입력하고 예제 스크립트를 실행하기 전에 셀을 실행하세요.

```python
# @markdown Please specify a source for demo purpose.
SOURCE = "test"  # @param {type:"Query"|"CollectionGroup"|"DocumentReference"|"string"}
```

### 🦜🔗 라이브러리 설치

통합은 `langchain-google-firestore` 패키지에 있으므로 이를 설치해야 합니다.

```python
%pip install -upgrade --quiet langchain-google-firestore
```

**Colab 전용**: 다음 셀의 주석을 해제하거나 커널을 다시 시작하는 버튼을 사용하여 커널을 다시 시작하세요. Vertex AI Workbench의 경우 상단의 버튼을 사용하여 터미널을 다시 시작할 수 있습니다.

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

`FirestoreSaver`를 사용하여 Firestore에 문서를 저장할 수 있습니다. 기본적으로 메타데이터에서 문서 참조를 추출하려고 시도합니다.

`FirestoreSaver.upsert_documents(<documents>)`를 사용하여 Langchain 문서를 저장합니다.

```python
from langchain_core.documents import Document
from langchain_google_firestore import FirestoreSaver

saver = FirestoreSaver()

data = [Document(page_content="Hello, World!")]

saver.upsert_documents(data)
```

#### 참조 없이 문서 저장

컬렉션이 지정된 경우 자동 생성된 ID로 문서가 저장됩니다.

```python
saver = FirestoreSaver("Collection")

saver.upsert_documents(data)
```

#### 다른 참조로 문서 저장

```python
doc_ids = ["AnotherCollection/doc_id", "foo/bar"]
saver = FirestoreSaver()

saver.upsert_documents(documents=data, document_ids=doc_ids)
```

### 컬렉션 또는 하위 컬렉션에서 로드

`FirestoreLoader.load()` 또는 `Firestore.lazy_load()`를 사용하여 Langchain 문서를 로드합니다. `lazy_load`는 반복 중에만 데이터베이스를 쿼리하는 생성기를 반환합니다. `FirestoreLoader` 클래스를 초기화하려면 다음을 제공해야 합니다:

1. `source` - Query, CollectionGroup, DocumentReference의 인스턴스 또는 Firestore 컬렉션의 단일 `\`-구분 경로.

```python
from langchain_google_firestore import FirestoreLoader

loader_collection = FirestoreLoader("Collection")
loader_subcollection = FirestoreLoader("Collection/doc/SubCollection")


data_collection = loader_collection.load()
data_subcollection = loader_subcollection.load()
```

### 단일 문서 로드

```python
from google.cloud import firestore

client = firestore.Client()
doc_ref = client.collection("foo").document("bar")

loader_document = FirestoreLoader(doc_ref)

data = loader_document.load()
```

### CollectionGroup 또는 Query에서 로드

```python
from google.cloud.firestore import CollectionGroup, FieldFilter, Query

col_ref = client.collection("col_group")
collection_group = CollectionGroup(col_ref)

loader_group = FirestoreLoader(collection_group)

col_ref = client.collection("collection")
query = col_ref.where(filter=FieldFilter("region", "==", "west_coast"))

loader_query = FirestoreLoader(query)
```

### 문서 삭제

`FirestoreSaver.delete_documents(<documents>)`를 사용하여 Firestore 컬렉션에서 Langchain 문서 목록을 삭제합니다.

문서 ID가 제공된 경우 문서가 무시됩니다.

```python
saver = FirestoreSaver()

saver.delete_documents(data)

# The Documents will be ignored and only the document ids will be used.
saver.delete_documents(data, doc_ids)
```

## 고급 사용법

### 사용자 지정 문서 페이지 콘텐츠 및 메타데이터로 문서 로드

`page_content_fields` 및 `metadata_fields` 인수는 Firestore 문서 필드를 LangChain 문서의 `page_content` 및 `metadata`에 작성할 것을 지정합니다.

```python
loader = FirestoreLoader(
    source="foo/bar/subcol",
    page_content_fields=["data_field"],
    metadata_fields=["metadata_field"],
)

data = loader.load()
```

#### 페이지 콘텐츠 형식 사용자 지정

`page_content`에 하나의 필드만 있는 경우 정보는 필드 값만 됩니다. 그렇지 않으면 `page_content`가 JSON 형식이 됩니다.

### 연결 및 인증 사용자 지정

```python
from google.auth import compute_engine
from google.cloud.firestore import Client

client = Client(database="non-default-db", creds=compute_engine.Credentials())
loader = FirestoreLoader(
    source="foo",
    client=client,
)
```
