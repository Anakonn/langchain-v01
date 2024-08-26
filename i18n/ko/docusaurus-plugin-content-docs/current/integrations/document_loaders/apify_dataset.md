---
translated: true
---

# Apify 데이터셋

> [Apify Dataset](https://docs.apify.com/platform/storage/dataset)은 대규모 데이터 웨어하우징을 위한 완전 관리형 다중 테넌시 데이터 처리 플랫폼으로, 구조화된 웹 스크래핑 결과를 저장하는 데 사용됩니다. 예를 들어, 제품 목록이나 Google SERP를 저장하고 이를 JSON, CSV 또는 Excel과 같은 다양한 형식으로 내보낼 수 있습니다. 데이터셋은 주로 다양한 웹 스크래핑, 크롤링 및 데이터 추출 사례를 위한 서버리스 클라우드 프로그램인 [Apify Actors](https://apify.com/store)의 결과를 저장하는 데 사용됩니다.

이 노트북은 Apify 데이터셋을 LangChain에 로드하는 방법을 보여줍니다.

## 사전 준비

Apify 플랫폼에 기존 데이터셋이 있어야 합니다. 만약 없다면, 먼저 [이 노트북](/docs/integrations/tools/apify)을 확인하여 Apify를 사용해 문서, 지식 베이스, 도움말 센터 또는 블로그에서 콘텐츠를 추출하는 방법을 배우세요.

```python
%pip install --upgrade --quiet  apify-client
```

먼저 `ApifyDatasetLoader`를 소스 코드에 가져옵니다:

```python
from langchain_community.document_loaders import ApifyDatasetLoader
from langchain_core.documents import Document
```

그런 다음 Apify 데이터셋 레코드 필드를 LangChain `Document` 형식으로 매핑하는 함수를 제공합니다.

예를 들어, 데이터셋 항목이 다음과 같은 구조라면:

```json
{
  "url": "https://apify.com",
  "text": "Apify는 최고의 웹 스크래핑 및 자동화 플랫폼입니다."
}
```

아래 코드의 매핑 함수는 이를 LangChain `Document` 형식으로 변환하여, 모든 LLM 모델(예: 질문 응답)에 사용할 수 있도록 합니다.

```python
loader = ApifyDatasetLoader(
    dataset_id="your-dataset-id",
    dataset_mapping_function=lambda dataset_item: Document(
        page_content=dataset_item["text"], metadata={"source": dataset_item["url"]}
    ),
)
```

```python
data = loader.load()
```

## 질문 응답 예제

이 예제에서는 데이터셋의 데이터를 사용하여 질문에 답변합니다.

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_core.docstore.document import Document
from langchain_community.document_loaders import ApifyDatasetLoader
```

```python
loader = ApifyDatasetLoader(
    dataset_id="your-dataset-id",
    dataset_mapping_function=lambda item: Document(
        page_content=item["text"] or "", metadata={"source": item["url"]}
    ),
)
```

```python
index = VectorstoreIndexCreator().from_loaders([loader])
```

```python
query = "Apify란 무엇인가요?"
result = index.query_with_sources(query)
```

```python
print(result["answer"])
print(result["sources"])
```

```output
Apify는 서버리스 클라우드 프로그램을 개발, 실행 및 공유하기 위한 플랫폼입니다. 사용자는 웹 스크래핑 및 자동화 도구를 만들고 Apify 플랫폼에 게시할 수 있습니다.

https://docs.apify.com/platform/actors, https://docs.apify.com/platform/actors/running/actors-in-store, https://docs.apify.com/platform/security, https://docs.apify.com/platform/actors/examples
```

