---
translated: true
---

# Google BigQuery 벡터 검색

> [Google Cloud BigQuery 벡터 검색](https://cloud.google.com/bigquery/docs/vector-search-intro)을 사용하면 GoogleSQL을 사용하여 벡터 인덱스를 통한 빠른 근사 결과 또는 정확한 결과를 위한 브루트 포스 방식으로 의미 검색을 수행할 수 있습니다.

이 튜토리얼에서는 LangChain의 엔드 투 엔드 데이터 및 임베딩 관리 시스템을 사용하여 BigQuery에서 확장 가능한 의미 검색을 수행하는 방법을 보여줍니다.

## 시작하기

### 라이브러리 설치

```python
%pip install --upgrade --quiet  langchain langchain-google-vertexai google-cloud-bigquery
```

**Colab 전용:** 다음 셀의 주석을 해제하거나 커널 다시 시작 버튼을 사용하여 커널을 다시 시작하세요. Vertex AI Workbench의 경우 상단의 버튼을 사용하여 터미널을 다시 시작할 수 있습니다.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

## 시작하기 전에

#### 프로젝트 ID 설정

프로젝트 ID를 모르는 경우 다음을 시도해 보세요:
* `gcloud config list`를 실행합니다.
* `gcloud projects list`를 실행합니다.
* [프로젝트 ID 찾기](https://support.google.com/googleapi/answer/7014113) 지원 페이지를 참조하세요.

```python
# @title Project { display-mode: "form" }
PROJECT_ID = ""  # @param {type:"string"}

# Set the project id
! gcloud config set project {PROJECT_ID}
```

#### 리전 설정

BigQuery에서 사용할 `REGION` 변수를 변경할 수도 있습니다. [BigQuery 리전](https://cloud.google.com/bigquery/docs/locations#supported_locations)에 대해 자세히 알아보세요.

```python
# @title Region { display-mode: "form" }
REGION = "US"  # @param {type: "string"}
```

#### 데이터셋 및 테이블 이름 설정

이것들이 BigQuery 벡터 스토어가 됩니다.

```python
# @title Dataset and Table { display-mode: "form" }
DATASET = "my_langchain_dataset"  # @param {type: "string"}
TABLE = "doc_and_vectors"  # @param {type: "string"}
```

### 노트북 환경 인증

- **Colab**을 사용하여 이 노트북을 실행하는 경우 아래 셀의 주석을 해제하고 계속하세요.
- **Vertex AI Workbench**를 사용하는 경우 [여기](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)의 설정 지침을 확인하세요.

```python
from google.colab import auth as google_auth

google_auth.authenticate_user()
```

## 데모: BigQueryVectorSearch

### 임베딩 클래스 인스턴스 생성

프로젝트에서 Vertex AI API를 활성화해야 할 수 있습니다. `gcloud services enable aiplatform.googleapis.com --project {PROJECT_ID}`를 실행하세요('{PROJECT_ID}'를 프로젝트 이름으로 바꾸세요).

[LangChain 텍스트 임베딩](/docs/integrations/text_embedding/) 모델을 사용할 수 있습니다.

```python
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### BigQuery 데이터셋 생성

데이터셋이 존재하지 않는 경우 선택적으로 생성할 수 있습니다.

```python
from google.cloud import bigquery

client = bigquery.Client(project=PROJECT_ID, location=REGION)
client.create_dataset(dataset=DATASET, exists_ok=True)
```

### 기존 BigQuery 데이터셋으로 BigQueryVectorSearch 벡터 스토어 초기화

```python
from langchain.vectorstores.utils import DistanceStrategy
from langchain_community.vectorstores import BigQueryVectorSearch

store = BigQueryVectorSearch(
    project_id=PROJECT_ID,
    dataset_name=DATASET,
    table_name=TABLE,
    location=REGION,
    embedding=embedding,
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
)
```

### 텍스트 추가

```python
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]

store.add_texts(all_texts, metadatas=metadatas)
```

### 문서 검색

```python
query = "I'd like a fruit."
docs = store.similarity_search(query)
print(docs)
```

### 벡터로 문서 검색

```python
query_vector = embedding.embed_query(query)
docs = store.similarity_search_by_vector(query_vector, k=2)
print(docs)
```

### 메타데이터 필터로 문서 검색

```python
# This should only return "Banana" document.
docs = store.similarity_search_by_vector(query_vector, filter={"len": 6})
print(docs)
```

### BigQuery 작업 ID로 작업 통계 탐색

```python
job_id = ""  # @param {type:"string"}
# Debug and explore the job statistics with a BigQuery Job id.
store.explore_job_stats(job_id)
```
