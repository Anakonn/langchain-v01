---
translated: true
---

# Google Vertex AI 검색

>[Google Vertex AI 검색](https://cloud.google.com/enterprise-search) (이전에는 `Generative AI App Builder`의 `Enterprise Search`로 알려짐)은 `Google Cloud`에서 제공하는 [Vertex AI](https://cloud.google.com/vertex-ai) 기계 학습 플랫폼의 일부입니다.

>`Vertex AI 검색`을 통해 기업은 고객과 직원을 위한 생성형 AI 기반 검색 엔진을 빠르게 구축할 수 있습니다. 이는 의미 검색, 자연어 처리 및 기계 학습 기술을 사용하여 사용자 쿼리의 의도와 콘텐츠 간의 관계를 추론함으로써 전통적인 키워드 기반 검색 기술보다 더 관련성 있는 결과를 제공하는 다양한 `Google 검색` 기술을 기반으로 합니다. Vertex AI 검색은 또한 사용자 검색 방식에 대한 Google의 전문성과 콘텐츠 관련성 요인을 활용합니다.

>`Vertex AI 검색`은 `Google Cloud Console`과 엔터프라이즈 워크플로우 통합을 위한 API를 통해 사용할 수 있습니다.

이 노트북은 `Vertex AI 검색`을 구성하고 Vertex AI 검색 리트리버를 사용하는 방법을 보여줍니다. Vertex AI 검색 리트리버는 [Python 클라이언트 라이브러리](https://cloud.google.com/generative-ai-app-builder/docs/libraries#client-libraries-install-python)를 캡슐화하고 이를 사용하여 [검색 서비스 API](https://cloud.google.com/python/docs/reference/discoveryengine/latest/google.cloud.discoveryengine_v1beta.services.search_service)에 액세스합니다.

## 사전 요구 사항 설치

Vertex AI 검색 리트리버를 사용하려면 `google-cloud-discoveryengine` 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet google-cloud-discoveryengine
```

## Google Cloud 및 Vertex AI 검색 액세스 구성

Vertex AI 검색은 2023년 8월부터 일반적으로 허용 목록 없이 사용할 수 있습니다.

리트리버를 사용하려면 다음 단계를 완료해야 합니다:

### 검색 엔진 생성 및 비정형 데이터 저장소 채우기

- [Vertex AI 검색 시작 가이드](https://cloud.google.com/generative-ai-app-builder/docs/try-enterprise-search)의 지침을 따라 Google Cloud 프로젝트와 Vertex AI 검색을 설정합니다.
- [Google Cloud Console을 사용하여 비정형 데이터 저장소 생성](https://cloud.google.com/generative-ai-app-builder/docs/create-engine-es#unstructured-data)
  - `gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs` Cloud Storage 폴더의 예제 PDF 문서로 채웁니다.
  - `Cloud Storage (without metadata)` 옵션을 사용해야 합니다.

### Vertex AI 검색 API에 액세스하기 위한 자격 증명 설정

Vertex AI 검색 리트리버가 사용하는 [Vertex AI 검색 클라이언트 라이브러리](https://cloud.google.com/generative-ai-app-builder/docs/libraries)는 Google Cloud에 프로그래밍 방식으로 인증하기 위한 고수준 언어 지원을 제공합니다.
클라이언트 라이브러리는 [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials)를 지원합니다. 이 라이브러리는 정의된 위치에서 자격 증명을 찾고 해당 자격 증명을 사용하여 API 요청을 인증합니다.
ADC를 사용하면 애플리케이션 코드를 수정할 필요 없이 다양한 환경(로컬 개발 또는 프로덕션)에서 자격 증명을 사용할 수 있습니다.

[Google Colab](https://colab.google)에서 실행 중인 경우 `google.colab.google.auth`로 인증하고, 그렇지 않은 경우 [지원되는 방법](https://cloud.google.com/docs/authentication/application-default-credentials) 중 하나를 따라 Application Default Credentials가 올바르게 설정되었는지 확인하십시오.

```python
import sys

if "google.colab" in sys.modules:
    from google.colab import auth as google_auth

    google_auth.authenticate_user()
```

## Vertex AI 검색 리트리버 구성 및 사용

Vertex AI 검색 리트리버는 `langchain.retriever.GoogleVertexAISearchRetriever` 클래스에 구현되어 있습니다. `get_relevant_documents` 메서드는 `langchain.schema.Document` 문서 목록을 반환하며, 각 문서의 `page_content` 필드에는 문서 내용이 채워집니다.
Vertex AI 검색에 사용되는 데이터 유형(웹사이트, 구조화 또는 비정형)에 따라 `page_content` 필드가 다음과 같이 채워집니다:

- 고급 인덱싱이 적용된 웹사이트: 쿼리와 일치하는 `extractive answer`. `metadata` 필드에는 추출된 세그먼트 또는 답변이 포함된 문서의 메타데이터(있는 경우)가 채워집니다.
- 비정형 데이터 소스: 쿼리와 일치하는 `extractive segment` 또는 `extractive answer`. `metadata` 필드에는 추출된 세그먼트 또는 답변이 포함된 문서의 메타데이터(있는 경우)가 채워집니다.
- 구조화된 데이터 소스: 구조화된 데이터 소스에서 반환된 모든 필드를 포함하는 문자열 JSON. `metadata` 필드에는 문서의 메타데이터(있는 경우)가 채워집니다.

### Extractive answers & extractive segments

Extractive answer는 각 검색 결과와 함께 반환되는 문자 그대로의 텍스트입니다. 이는 원본 문서에서 직접 추출됩니다. Extractive answer는 일반적으로 웹 페이지 상단에 표시되어 사용자 쿼리와 관련성이 높은 간단한 답변을 제공합니다. Extractive answer는 웹사이트 및 비정형 검색에 사용할 수 있습니다.

Extractive segment는 각 검색 결과와 함께 반환되는 문자 그대로의 텍스트입니다. Extractive segment는 일반적으로 Extractive answer보다 더 자세합니다. Extractive segment는 쿼리에 대한 답변으로 표시되거나 후처리 작업 및 대규모 언어 모델의 입력으로 사용될 수 있습니다. Extractive segment는 비정형 검색에 사용할 수 있습니다.

Extractive segment와 Extractive answer에 대한 자세한 내용은 [제품 문서](https://cloud.google.com/generative-ai-app-builder/docs/snippets)를 참조하십시오.

참고: Extractive segment는 [Enterprise edition](https://cloud.google.com/generative-ai-app-builder/docs/about-advanced-features#enterprise-features) 기능이 활성화되어야 합니다.

문서를 생성할 때 retriever의 인스턴스를 만들 때 다음과 같은 매개변수를 지정할 수 있습니다. 이 매개변수들은 어떤 데이터 저장소에 액세스할지, 자연어 쿼리를 어떻게 처리할지를 제어합니다. 여기에는 extractive 답변과 세그먼트에 대한 구성도 포함됩니다.

### 필수 매개변수:

- `project_id` - Google Cloud 프로젝트 ID.
- `location_id` - 데이터 저장소의 위치.
  - `global` (기본값)
  - `us`
  - `eu`

다음 중 하나:
- `search_engine_id` - 사용할 검색 앱의 ID. (Blended Search에 필요)
- `data_store_id` - 사용할 데이터 저장소의 ID.

`project_id`, `search_engine_id` 및 `data_store_id` 매개변수는 retriever의 생성자에서 명시적으로 제공하거나 `PROJECT_ID`, `SEARCH_ENGINE_ID` 및 `DATA_STORE_ID` 환경 변수를 통해 제공할 수 있습니다.

또한 다음과 같은 선택적 매개변수를 구성할 수 있습니다:

- `max_documents` - extractive 세그먼트 또는 extractive 답변을 제공하는 데 사용되는 최대 문서 수
- `get_extractive_answers` - 기본적으로 retriever는 extractive 세그먼트를 반환하도록 구성됩니다.
  - `True`로 설정하면 extractive 답변을 반환합니다. `engine_data_type`이 `0` (unstructured)으로 설정된 경우에만 사용됩니다.
- `max_extractive_answer_count` - 각 검색 결과에 반환되는 최대 extractive 답변 수.
  - 최대 5개의 답변이 반환됩니다. `engine_data_type`이 `0` (unstructured)으로 설정된 경우에만 사용됩니다.
- `max_extractive_segment_count` - 각 검색 결과에 반환되는 최대 extractive 세그먼트 수.
  - 현재 한 개의 세그먼트가 반환됩니다. `engine_data_type`이 `0` (unstructured)으로 설정된 경우에만 사용됩니다.
- `filter` - 데이터 저장소의 문서 메타데이터를 기반으로 한 검색 결과 필터 표현식.
- `query_expansion_condition` - 쿼리 확장이 발생해야 하는 조건을 결정하는 사양.
  - `0` - 지정되지 않은 쿼리 확장 조건. 이 경우 서버 동작은 비활성화로 기본 설정됩니다.
  - `1` - 쿼리 확장 비활성화. 검색 응답의 `total_size`가 0이더라도 정확한 검색 쿼리만 사용됩니다.
  - `2` - Search API에 의해 자동으로 구축된 쿼리 확장.
- `engine_data_type` - Vertex AI Search 데이터 유형 정의
  - `0` - 비정형 데이터
  - `1` - 구조화된 데이터
  - `2` - 웹사이트 데이터
  - `3` - [Blended search](https://cloud.google.com/generative-ai-app-builder/docs/create-data-store-es#multi-data-stores)

### `GoogleCloudEnterpriseSearchRetriever`에 대한 마이그레이션 가이드

이전 버전에서는 이 retriever를 `GoogleCloudEnterpriseSearchRetriever`라고 불렀습니다.

새 retriever로 업데이트하려면 다음과 같은 변경 사항을 수행하세요:

- 가져오기를 `from langchain.retrievers import GoogleCloudEnterpriseSearchRetriever` -> `from langchain.retrievers import GoogleVertexAISearchRetriever`로 변경합니다.
- 모든 클래스 참조를 `GoogleCloudEnterpriseSearchRetriever` -> `GoogleVertexAISearchRetriever`로 변경합니다.

### **비정형** 데이터에 대한 extractive 세그먼트로 retriever 구성 및 사용

```python
from langchain_community.retrievers import (
    GoogleVertexAIMultiTurnSearchRetriever,
    GoogleVertexAISearchRetriever,
)

PROJECT_ID = "<YOUR PROJECT ID>"  # Set to your Project ID
LOCATION_ID = "<YOUR LOCATION>"  # Set to your data store location
SEARCH_ENGINE_ID = "<YOUR SEARCH APP ID>"  # Set to your search app ID
DATA_STORE_ID = "<YOUR DATA STORE ID>"  # Set to your data store ID
```

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
)
```

```python
query = "What are Alphabet's Other Bets?"

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### **비정형** 데이터에 대한 extractive 답변으로 retriever 구성 및 사용

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    max_extractive_answer_count=3,
    get_extractive_answers=True,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### **구조화된** 데이터로 retriever 구성 및 사용

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    engine_data_type=1,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### **웹사이트** 데이터에 대한 고급 웹사이트 인덱싱으로 retriever 구성 및 사용

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    data_store_id=DATA_STORE_ID,
    max_documents=3,
    max_extractive_answer_count=3,
    get_extractive_answers=True,
    engine_data_type=2,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### **Blended** 데이터로 retriever 구성 및 사용

```python
retriever = GoogleVertexAISearchRetriever(
    project_id=PROJECT_ID,
    location_id=LOCATION_ID,
    search_engine_id=SEARCH_ENGINE_ID,
    max_documents=3,
    engine_data_type=3,
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```

### 다중 턴 검색으로 retriever 구성 및 사용

[후속 검색](https://cloud.google.com/generative-ai-app-builder/docs/multi-turn-search)은 생성 AI 모델을 기반으로 하며, 일반 비정형 데이터 검색과는 다릅니다.

```python
retriever = GoogleVertexAIMultiTurnSearchRetriever(
    project_id=PROJECT_ID, location_id=LOCATION_ID, data_store_id=DATA_STORE_ID
)

result = retriever.invoke(query)
for doc in result:
    print(doc)
```
