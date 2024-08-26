---
translated: true
---

# Arcee

>[Arcee](https://www.arcee.ai/about/about-us)는 SLM(Small, Specialized, Secure, and Scalable Language Models)의 개발을 돕습니다.

이 노트북은 `ArceeRetriever` 클래스를 사용하여 Arcee의 `Domain Adapted Language Models`(`DALMs`)에 대한 관련 문서를 검색하는 방법을 보여줍니다.

### 설정

`ArceeRetriever`를 사용하기 전에 Arcee API 키가 `ARCEE_API_KEY` 환경 변수로 설정되어 있는지 확인하세요. API 키를 명명된 매개변수로 전달할 수도 있습니다.

```python
from langchain_community.retrievers import ArceeRetriever

retriever = ArceeRetriever(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY" # if not already set in the environment
)
```

### 추가 구성

`ArceeRetriever`의 매개변수인 `arcee_api_url`, `arcee_app_url` 및 `model_kwargs`를 필요에 따라 구성할 수 있습니다.
객체 초기화 시 `model_kwargs`를 설정하면 후속 검색에 대한 기본 필터와 크기가 사용됩니다.

```python
retriever = ArceeRetriever(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY", # if not already set in the environment
    arcee_api_url="https://custom-api.arcee.ai",  # default is https://api.arcee.ai
    arcee_app_url="https://custom-app.arcee.ai",  # default is https://app.arcee.ai
    model_kwargs={
        "size": 5,
        "filters": [
            {
                "field_name": "document",
                "filter_type": "fuzzy_search",
                "value": "Einstein",
            }
        ],
    },
)
```

### 문서 검색

업로드된 컨텍스트에서 관련 문서를 검색하려면 쿼리를 제공하면 됩니다. 다음은 예시입니다:

```python
query = "Can AI-driven music therapy contribute to the rehabilitation of patients with disorders of consciousness?"
documents = retriever.invoke(query)
```

### 추가 매개변수

Arcee를 사용하면 `filters`를 적용하고 검색된 문서의 `size`(개수 기준)를 설정할 수 있습니다. 필터를 사용하면 결과를 좁힐 수 있습니다. 이러한 매개변수를 사용하는 방법은 다음과 같습니다:

```python
# Define filters
filters = [
    {"field_name": "document", "filter_type": "fuzzy_search", "value": "Music"},
    {"field_name": "year", "filter_type": "strict_search", "value": "1905"},
]

# Retrieve documents with filters and size params
documents = retriever.invoke(query, size=5, filters=filters)
```
