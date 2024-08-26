---
translated: true
---

# Airbyte Hubspot (더 이상 사용되지 않음)

참고: `AirbyteHubspotLoader`는 더 이상 사용되지 않습니다. 대신 [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte)를 사용하세요.

> [Airbyte](https://github.com/airbytehq/airbyte)는 데이터 웨어하우스와 데이터베이스로부터 API, 데이터베이스 및 파일에서 ELT 파이프라인을 위한 데이터 통합 플랫폼입니다. 데이터 웨어하우스 및 데이터베이스에 대한 ELT 커넥터가 가장 많이 포함되어 있습니다.

이 로더는 Hubspot 커넥터를 문서 로더로 노출하여 다양한 Hubspot 객체를 문서로 로드할 수 있게 합니다.

## 설치

먼저, `airbyte-source-hubspot` 파이썬 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet airbyte-source-hubspot
```

## 예제

리더를 구성하는 방법에 대한 자세한 내용은 [Airbyte 문서 페이지](https://docs.airbyte.com/integrations/sources/hubspot/)를 확인하세요.
구성 객체가 준수해야 하는 JSON 스키마는 Github에서 확인할 수 있습니다: [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-hubspot/source_hubspot/spec.yaml](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-hubspot/source_hubspot/spec.yaml).

일반적인 형식은 다음과 같습니다:

```python
{
  "start_date": "<레코드를 검색할 시작 날짜 (ISO 형식, 예: 2020-10-20T00:00:00Z)>",
  "credentials": {
    "credentials_title": "Private App Credentials",
    "access_token": "<개인 앱의 액세스 토큰>"
  }
}
```

기본적으로 모든 필드는 문서의 메타데이터로 저장되며 텍스트는 빈 문자열로 설정됩니다. 리더가 반환하는 문서를 변환하여 문서의 텍스트를 구성합니다.

```python
from langchain_community.document_loaders.airbyte import AirbyteHubspotLoader

config = {
    # 허브스팟 구성 설정
}

loader = AirbyteHubspotLoader(
    config=config, stream_name="products"
)  # 위에 링크된 문서를 확인하여 모든 스트림 목록을 확인하세요.
```

이제 일반적인 방식으로 문서를 로드할 수 있습니다:

```python
docs = loader.load()
```

`load`는 목록을 반환하므로 모든 문서가 로드될 때까지 차단됩니다. 이 프로세스를 더 잘 제어하려면, 대신 반복자를 반환하는 `lazy_load` 메서드를 사용할 수 있습니다:

```python
docs_iterator = loader.lazy_load()
```

기본적으로 페이지 내용이 비어 있고 메타데이터 객체에 레코드의 모든 정보가 포함되어 있음을 기억하세요. 문서를 처리하려면 기본 로더에서 상속하고 `_handle_records` 메서드를 직접 구현하는 클래스를 만듭니다:

```python
from langchain_community.docstore.document import Document

def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)

loader = AirbyteHubspotLoader(
    config=config, record_handler=handle_record, stream_name="products"
)
docs = loader.load()
```

## 증분 로드

일부 스트림은 증분 로드를 허용합니다. 이는 소스가 동기화된 레코드를 추적하여 다시 로드하지 않음을 의미합니다. 이는 데이터 볼륨이 크고 자주 업데이트되는 소스에 유용합니다.

이를 활용하려면 로더의 `last_state` 속성을 저장하고 다시 로더를 생성할 때 전달합니다. 이렇게 하면 새 레코드만 로드됩니다.

```python
last_state = loader.last_state  # 안전하게 저장

incremental_loader = AirbyteHubspotLoader(
    config=config, stream_name="products", state=last_state
)

new_docs = incremental_loader.load()
```

