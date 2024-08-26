---
translated: true
---

# Google Memorystore for Redis

> [Google Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview)는 Redis in-memory 데이터 스토어를 기반으로 하는 완전 관리형 서비스로, 밀리초 미만의 데이터 액세스를 제공하는 애플리케이션 캐시를 구축할 수 있습니다. Memorystore for Redis의 Langchain 통합을 활용하여 데이터베이스 애플리케이션을 확장하고 AI 기반 경험을 구축할 수 있습니다.

이 노트북에서는 `MemorystoreVectorStore` 클래스를 사용하여 벡터 임베딩을 저장하는 방법을 살펴봅니다.

[GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/)에서 패키지에 대해 자세히 알아보세요.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/vector_store.ipynb)

## 사전 요구 사항

## 시작하기 전에

이 노트북을 실행하려면 다음을 수행해야 합니다:

* [Google Cloud 프로젝트 생성](https://developers.google.com/workspace/guides/create-project)
* [Memorystore for Redis API 활성화](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [Memorystore for Redis 인스턴스 생성](https://cloud.google.com/memorystore/docs/redis/create-instance-console). 버전이 7.2 이상인지 확인하세요.

### 🦜🔗 라이브러리 설치

통합은 `langchain-google-memorystore-redis` 패키지에 있으므로 이를 설치해야 합니다.

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis langchain
```

**Colab only:** 다음 셀의 주석을 해제하거나 버튼을 사용하여 커널을 다시 시작하세요. Vertex AI Workbench의 경우 상단의 버튼을 사용하여 터미널을 다시 시작할 수 있습니다.

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

* Colab을 사용하여 이 노트북을 실행하는 경우 아래 셀을 사용하고 계속하세요.
* Vertex AI Workbench를 사용하는 경우 [여기](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)의 설정 지침을 확인하세요.

```python
from google.colab import auth

auth.authenticate_user()
```

## 기본 사용법

### 벡터 인덱스 초기화

```python
import redis
from langchain_google_memorystore_redis import (
    DistanceStrategy,
    HNSWConfig,
    RedisVectorStore,
)

# Connect to a Memorystore for Redis instance
redis_client = redis.from_url("redis://127.0.0.1:6379")

# Configure HNSW index with descriptive parameters
index_config = HNSWConfig(
    name="my_vector_index", distance_strategy=DistanceStrategy.COSINE, vector_size=128
)

# Initialize/create the vector store index
RedisVectorStore.init_index(client=redis_client, index_config=index_config)
```

### 문서 준비

텍스트를 벡터 스토어와 상호 작용하기 전에 처리하고 숫자 표현으로 변환해야 합니다. 이에는 다음이 포함됩니다:

* 텍스트 로드: TextLoader는 파일(예: "state_of_the_union.txt")에서 텍스트 데이터를 가져옵니다.
* 텍스트 분할: CharacterTextSplitter는 텍스트를 더 작은 청크로 나눕니다.

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader

loader = TextLoader("./state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### 벡터 스토어에 문서 추가

텍스트 준비 및 임베딩 생성 후 다음 메서드를 사용하여 Redis 벡터 스토어에 삽입할 수 있습니다.

#### 방법 1: 직접 삽입을 위한 클래스 메서드

이 접근 방식은 임베딩 생성과 삽입을 단일 단계로 결합하는 from_documents 클래스 메서드를 사용합니다:

```python
from langchain_community.embeddings.fake import FakeEmbeddings

embeddings = FakeEmbeddings(size=128)
redis_client = redis.from_url("redis://127.0.0.1:6379")
rvs = RedisVectorStore.from_documents(
    docs, embedding=embeddings, client=redis_client, index_name="my_vector_index"
)
```

#### 방법 2: 인스턴스 기반 삽입

이 접근 방식은 새로운 RedisVectorStore를 사용하거나 기존 인스턴스를 사용할 때 유연성을 제공합니다:

* [선택 사항] RedisVectorStore 인스턴스 생성: 사용자 정의를 위해 RedisVectorStore 객체를 인스턴스화합니다. 이미 인스턴스가 있는 경우 다음 단계로 진행하세요.
* 메타데이터를 사용하여 텍스트 추가: 원시 텍스트와 메타데이터를 제공합니다. 임베딩 생성 및 벡터 스토어에 삽입이 자동으로 처리됩니다.

```python
rvs = RedisVectorStore(
    client=redis_client, index_name="my_vector_index", embeddings=embeddings
)
ids = rvs.add_texts(
    texts=[d.page_content for d in docs], metadatas=[d.metadata for d in docs]
)
```

### 유사성 검색(KNN) 수행

벡터 스토어가 채워지면 쿼리와 의미적으로 유사한 텍스트를 검색할 수 있습니다. 기본 설정을 사용하여 KNN(K-Nearest Neighbors)을 사용하는 방법은 다음과 같습니다:

* 쿼리 구성: 검색 의도를 나타내는 자연어 질문(예: "Ketanji Brown Jackson에 대해 대통령이 무엇이라고 말했습니까?")
* 유사한 결과 검색: `similarity_search` 메서드는 벡터 스토어에서 쿼리와 가장 유사한 항목을 찾습니다.

```python
import pprint

query = "What did the president say about Ketanji Brown Jackson"
knn_results = rvs.similarity_search(query=query)
pprint.pprint(knn_results)
```

### 범위 기반 유사성 검색 수행

범위 쿼리를 사용하면 쿼리 텍스트와 함께 원하는 유사성 임계값을 지정할 수 있어 더 많은 제어가 가능합니다:

* 쿼리 구성: 검색 의도를 나타내는 자연어 질문
* 유사성 임계값 설정: distance_threshold 매개변수는 관련으로 간주되려면 일치해야 하는 최소 유사성을 결정합니다.
* 결과 검색: `similarity_search_with_score` 메서드는 지정된 유사성 임계값 내에 있는 벡터 스토어의 항목을 찾습니다.

```python
rq_results = rvs.similarity_search_with_score(query=query, distance_threshold=0.8)
pprint.pprint(rq_results)
```

### 최대 한계 관련성(MMR) 검색 수행

MMR 쿼리는 쿼리와 관련성이 높고 서로 다양한 결과를 찾는 것을 목표로 합니다. 이를 통해 검색 결과의 중복을 줄일 수 있습니다.

* 쿼리 구성: 검색 의도를 나타내는 자연어 질문
* 관련성과 다양성의 균형: lambda_mult 매개변수는 엄격한 관련성과 결과의 다양성 간의 trade-off를 제어합니다.
* MMR 결과 검색: `max_marginal_relevance_search` 메서드는 lambda 설정에 따라 관련성과 다양성의 최적 조합을 제공하는 항목을 반환합니다.

```python
mmr_results = rvs.max_marginal_relevance_search(query=query, lambda_mult=0.90)
pprint.pprint(mmr_results)
```

## 벡터 스토어를 리트리버로 사용하기

다른 LangChain 구성 요소와의 원활한 통합을 위해, 벡터 스토어를 리트리버로 변환할 수 있습니다. 이는 다음과 같은 장점을 제공합니다:

* LangChain 호환성: 많은 LangChain 도구와 메서드는 리트리버와 직접 상호 작용하도록 설계되어 있습니다.
* 사용 편의성: `as_retriever()` 메서드는 벡터 스토어를 쿼리하기 쉬운 형식으로 변환합니다.

```python
retriever = rvs.as_retriever()
results = retriever.invoke(query)
pprint.pprint(results)
```

## 정리하기

### 벡터 스토어에서 문서 삭제하기

때때로 문서(및 관련 벡터)를 벡터 스토어에서 제거해야 할 필요가 있습니다. `delete` 메서드는 이 기능을 제공합니다.

```python
rvs.delete(ids)
```

### 벡터 인덱스 삭제하기

기존 벡터 인덱스를 삭제해야 하는 경우가 있습니다. 일반적인 이유는 다음과 같습니다:

* 인덱스 구성 변경: 인덱스 매개변수를 수정해야 하는 경우, 인덱스를 삭제하고 다시 생성해야 합니다.
* 스토리지 관리: 사용되지 않는 인덱스를 제거하면 Redis 인스턴스의 공간을 확보할 수 있습니다.

주의: 벡터 인덱스 삭제는 되돌릴 수 없는 작업입니다. 저장된 벡터와 검색 기능이 더 이상 필요하지 않은지 확실히 확인한 후에 진행하십시오.

```python
# Delete the vector index
RedisVectorStore.drop_index(client=redis_client, index_name="my_vector_index")
```
