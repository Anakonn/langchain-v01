---
translated: true
---

# Airbyte Shopify (더 이상 사용되지 않음)

참고: 이 커넥터 전용 로더는 더 이상 사용되지 않습니다. 대신 [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte)를 사용하세요.

> [Airbyte](https://github.com/airbytehq/airbyte)는 데이터 웨어하우스와 데이터베이스로부터 API, 데이터베이스 및 파일에서 ELT 파이프라인을 위한 데이터 통합 플랫폼입니다. 데이터 웨어하우스 및 데이터베이스에 대한 ELT 커넥터가 가장 많이 포함되어 있습니다.

이 로더는 Shopify 커넥터를 문서 로더로 노출하여 다양한 Shopify 객체를 문서로 로드할 수 있게 합니다.

## 설치

먼저 `airbyte-source-shopify` 파이썬 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  airbyte-source-shopify
```

## 예제

리더를 구성하는 방법에 대한 자세한 내용은 [Airbyte 문서 페이지](https://docs.airbyte.com/integrations/sources/shopify/)를 참조하십시오.
구성 객체가 준수해야 하는 JSON 스키마는 GitHub에서 찾을 수 있습니다: [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-shopify/source_shopify/spec.json](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-shopify/source_shopify/spec.json).

일반적인 형태는 다음과 같습니다:

```python
{
    "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
    "shop": "<name of the shop you want to retrieve documents from>",
    "credentials": {
        "auth_method": "api_password",
        "api_password": "<your api password>"
    }
}
```

기본적으로 모든 필드는 메타데이터로 문서에 저장되며 텍스트는 빈 문자열로 설정됩니다. 리더에서 반환된 문서를 변환하여 문서의 텍스트를 구성합니다.

```python
from langchain_community.document_loaders.airbyte import AirbyteShopifyLoader

config = {
    # your shopify configuration
}

loader = AirbyteShopifyLoader(
    config=config, stream_name="orders"
)  # 위에 링크된 문서에서 모든 스트림 목록을 확인하세요.
```

이제 일반적인 방법으로 문서를 로드할 수 있습니다.

```python
docs = loader.load()
```

`load`가 목록을 반환하므로 모든 문서가 로드될 때까지 차단됩니다. 이 과정을 더 잘 제어하려면, 대신 반복자를 반환하는 `lazy_load` 메서드를 사용할 수도 있습니다.

```python
docs_iterator = loader.lazy_load()
```

기본적으로 페이지 내용은 비어 있고 메타데이터 객체에는 레코드의 모든 정보가 포함되어 있음을 염두에 두십시오. 문서를 다르게 만들려면 로더를 생성할 때 record_handler 함수를 전달하십시오.

```python
from langchain_community.docstore.document import Document

def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)

loader = AirbyteShopifyLoader(
    config=config, record_handler=handle_record, stream_name="orders"
)
docs = loader.load()
```

## 증분 로드

일부 스트림은 증분 로드를 허용하므로 소스가 동기화된 레코드를 추적하고 다시 로드하지 않습니다. 이는 데이터 양이 많고 자주 업데이트되는 소스에 유용합니다.

이를 활용하려면 로더의 `last_state` 속성을 저장하고 다시 로더를 생성할 때 전달하십시오. 이렇게 하면 새로운 레코드만 로드됩니다.

```python
last_state = loader.last_state  # 안전하게 저장

incremental_loader = AirbyteShopifyLoader(
    config=config, stream_name="orders", state=last_state
)

new_docs = incremental_loader.load()
```

