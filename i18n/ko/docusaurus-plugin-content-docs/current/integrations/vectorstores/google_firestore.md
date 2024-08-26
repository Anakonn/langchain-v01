---
sidebar_label: Firestore
translated: true
---

# Google Firestore (기본 모드)

> [Firestore](https://cloud.google.com/firestore)는 어떤 요구사항에도 맞춰 확장될 수 있는 서버리스 문서 지향 데이터베이스입니다. Firestore의 Langchain 통합을 활용하여 AI 기반 경험을 구축하는 데이터베이스 애플리케이션을 확장할 수 있습니다.

이 노트북에서는 [Firestore](https://cloud.google.com/firestore)를 사용하여 벡터를 저장하고 `FirestoreVectorStore` 클래스를 사용하여 쿼리하는 방법을 살펴봅니다.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/vectorstores.ipynb)

## 시작하기 전에

이 노트북을 실행하려면 다음을 수행해야 합니다:

* [Google Cloud 프로젝트 생성](https://developers.google.com/workspace/guides/create-project)
* [Firestore API 활성화](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [Firestore 데이터베이스 생성](https://cloud.google.com/firestore/docs/manage-databases)

런타임 환경에서 데이터베이스에 대한 액세스가 확인된 후 다음 값을 입력하고 예제 스크립트를 실행하기 전에 셀을 실행하세요.

```python
# @markdown Please specify a source for demo purpose.
COLLECTION_NAME = "test"  # @param {type:"CollectionReference"|"string"}
```

### 🦜🔗 라이브러리 설치

이 통합은 `langchain-google-firestore` 패키지에 있으므로 설치해야 합니다. 이 노트북에서는 Google Generative AI 임베딩을 사용하기 위해 `langchain-google-genai`도 설치할 것입니다.

```python
%pip install -upgrade --quiet langchain-google-firestore langchain-google-vertexai
```

**Colab 전용**: 커널을 다시 시작하려면 다음 셀의 주석을 해제하거나 버튼을 사용하세요. Vertex AI Workbench의 경우 상단의 버튼을 사용하여 터미널을 다시 시작할 수 있습니다.

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

PROJECT_ID = "extensions-testing"  # @param {type:"string"}

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

# 기본 사용법

### FirestoreVectorStore 초기화

`FirestoreVectorStore`를 사용하면 Firestore 데이터베이스에 새 벡터를 저장할 수 있습니다. Google Generative AI를 포함한 모든 모델의 임베딩을 저장하는 데 사용할 수 있습니다.

```python
from langchain_google_firestore import FirestoreVectorStore
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest",
    project=PROJECT_ID,
)

# Sample data
ids = ["apple", "banana", "orange"]
fruits_texts = ['{"name": "apple"}', '{"name": "banana"}', '{"name": "orange"}']

# Create a vector store
vector_store = FirestoreVectorStore(
    collection="fruits",
    embedding=embedding,
)

# Add the fruits to the vector store
vector_store.add_texts(fruits_texts, ids=ids)
```

간단히 말해, `from_texts`와 `from_documents` 메서드를 사용하여 벡터를 초기화하고 추가할 수 있습니다.

```python
vector_store = FirestoreVectorStore.from_texts(
    collection="fruits",
    texts=fruits_texts,
    embedding=embedding,
)
```

```python
from langchain_core.documents import Document

fruits_docs = [Document(page_content=fruit) for fruit in fruits_texts]

vector_store = FirestoreVectorStore.from_documents(
    collection="fruits",
    documents=fruits_docs,
    embedding=embedding,
)
```

### 벡터 삭제

`delete` 메서드를 사용하여 데이터베이스에서 벡터가 포함된 문서를 삭제할 수 있습니다. 삭제할 벡터의 문서 ID를 제공해야 합니다. 이렇게 하면 문서에 있을 수 있는 다른 필드와 함께 전체 문서가 데이터베이스에서 제거됩니다.

```python
vector_store.delete(ids)
```

### 벡터 업데이트

벡터 업데이트는 추가하는 것과 유사합니다. `add` 메서드를 사용하여 문서 ID와 새 벡터를 제공하여 문서의 벡터를 업데이트할 수 있습니다.

```python
fruit_to_update = ['{"name": "apple","price": 12}']
apple_id = "apple"

vector_store.add_texts(fruit_to_update, ids=[apple_id])
```

## 유사도 검색

`FirestoreVectorStore`를 사용하여 저장된 벡터에 대한 유사도 검색을 수행할 수 있습니다. 이는 유사한 문서 또는 텍스트를 찾는 데 유용합니다.

```python
vector_store.similarity_search("I like fuji apples", k=3)
```

```python
vector_store.max_marginal_relevance_search("fuji", 5)
```

`filters` 매개변수를 사용하여 사전 필터를 추가할 수 있습니다. 이를 통해 특정 필드 또는 값으로 필터링할 수 있습니다.

```python
from google.cloud.firestore_v1.base_query import FieldFilter

vector_store.max_marginal_relevance_search(
    "fuji", 5, filters=FieldFilter("content", "==", "apple")
)
```

### 연결 및 인증 사용자 정의

```python
from google.api_core.client_options import ClientOptions
from google.cloud import firestore
from langchain_google_firestore import FirestoreVectorStore

client_options = ClientOptions()
client = firestore.Client(client_options=client_options)

# Create a vector store
vector_store = FirestoreVectorStore(
    collection="fruits",
    embedding=embedding,
    client=client,
)
```
