---
translated: true
---

# Arcee

이 노트북은 Arcee의 Domain Adapted Language Models (DALMs)을 사용하여 텍스트를 생성하는 방법을 보여줍니다.

### 설정

Arcee를 사용하기 전에 Arcee API 키가 `ARCEE_API_KEY` 환경 변수로 설정되어 있는지 확인하세요. API 키를 명명된 매개변수로 전달할 수도 있습니다.

```python
from langchain_community.llms import Arcee

# Create an instance of the Arcee class
arcee = Arcee(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY" # if not already set in the environment
)
```

### 추가 구성

`arcee_api_url`, `arcee_app_url` 및 `model_kwargs`와 같은 Arcee 매개변수를 필요에 따라 구성할 수 있습니다.
객체 초기화 시 `model_kwargs`를 설정하면 후속 모든 generate response 호출에 대한 기본값으로 사용됩니다.

```python
arcee = Arcee(
    model="DALM-Patent",
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

### 텍스트 생성

프롬프트를 제공하여 Arcee에서 텍스트를 생성할 수 있습니다. 다음은 예시입니다:

```python
# Generate text
prompt = "Can AI-driven music therapy contribute to the rehabilitation of patients with disorders of consciousness?"
response = arcee(prompt)
```

### 추가 매개변수

Arcee를 사용하면 `filters`를 적용하고 검색된 문서의 `size`(개수)를 설정하여 텍스트 생성을 지원할 수 있습니다. 필터를 사용하면 결과를 좁힐 수 있습니다. 이러한 매개변수를 사용하는 방법은 다음과 같습니다:

```python
# Define filters
filters = [
    {"field_name": "document", "filter_type": "fuzzy_search", "value": "Einstein"},
    {"field_name": "year", "filter_type": "strict_search", "value": "1905"},
]

# Generate text with filters and size params
response = arcee(prompt, size=5, filters=filters)
```
