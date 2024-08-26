---
translated: true
---

# Airbyte CDK (Deprecated)

Note: `AirbyteCDKLoader`는 더 이상 사용되지 않습니다. 대신 [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte)를 사용하십시오.

> [Airbyte](https://github.com/airbytehq/airbyte)는 API, 데이터베이스 및 파일에서 웨어하우스 및 데이터 레이크로 ELT 파이프라인을 위한 데이터 통합 플랫폼입니다. ELT 커넥터의 가장 큰 카탈로그를 보유하고 있습니다.

많은 소스 커넥터가 [Airbyte CDK](https://docs.airbyte.com/connector-development/cdk-python/)를 사용하여 구현되었습니다. 이 로더는 이러한 커넥터를 실행하고 데이터를 문서로 반환할 수 있습니다.

## 설치

먼저 `airbyte-cdk` 파이썬 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  airbyte-cdk
```

그런 다음, [Airbyte Github 저장소](https://github.com/airbytehq/airbyte/tree/master/airbyte-integrations/connectors)에서 기존 커넥터를 설치하거나 [Airbyte CDK](https://docs.airbyte.io/connector-development/connector-development)를 사용하여 자체 커넥터를 만드십시오.

예를 들어, Github 커넥터를 설치하려면 다음 명령을 실행하십시오.

```python
%pip install --upgrade --quiet  "source_github@git+https://github.com/airbytehq/airbyte.git@master#subdirectory=airbyte-integrations/connectors/source-github"
```

일부 소스는 PyPI에서 일반 패키지로도 게시됩니다.

## 예제

이제 가져온 소스를 기반으로 `AirbyteCDKLoader`를 생성할 수 있습니다. 이는 커넥터에 전달되는 `config` 객체를 필요로 합니다. 또한 사용 가능한 스트림 중 하나를 선택해야 합니다 (`stream_name`). config 객체와 사용 가능한 스트림에 대한 자세한 정보는 커넥터의 문서 페이지와 사양 정의를 확인하십시오. Github 커넥터의 경우 다음을 참조하십시오:

- [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-github/source_github/spec.json](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-github/source_github/spec.json).
- [https://docs.airbyte.com/integrations/sources/github/](https://docs.airbyte.com/integrations/sources/github/)

```python
from langchain_community.document_loaders.airbyte import AirbyteCDKLoader
from source_github.source import SourceGithub  # 여기에 자신의 소스를 플러그인 하십시오.

config = {
    # github 설정
    "credentials": {"api_url": "api.github.com", "personal_access_token": "<token>"},
    "repository": "<repo>",
    "start_date": "<ISO 형식의 기록을 검색할 시작 날짜, 예: 2020-10-20T00:00:00Z>",
}

issues_loader = AirbyteCDKLoader(
    source_class=SourceGithub, config=config, stream_name="issues"
)
```

이제 일반적인 방식으로 문서를 로드할 수 있습니다.

```python
docs = issues_loader.load()
```

`load`는 목록을 반환하므로 모든 문서가 로드될 때까지 차단됩니다. 이 프로세스를 더 잘 제어하려면 `lazy_load` 메서드를 사용하여 대신 반복자를 반환할 수 있습니다.

```python
docs_iterator = issues_loader.lazy_load()
```

기본적으로 페이지 내용은 비어 있고 메타데이터 객체에는 레코드의 모든 정보가 포함되어 있습니다. 다른 형식으로 문서를 생성하려면 로더를 생성할 때 `record_handler` 함수를 전달하십시오.

```python
from langchain_community.docstore.document import Document

def handle_record(record, id):
    return Document(
        page_content=record.data["title"] + "\n" + (record.data["body"] or ""),
        metadata=record.data,
    )

issues_loader = AirbyteCDKLoader(
    source_class=SourceGithub,
    config=config,
    stream_name="issues",
    record_handler=handle_record,
)

docs = issues_loader.load()
```

## 증분 로드

일부 스트림은 증분 로드를 허용합니다. 이는 소스가 동기화된 기록을 추적하고 다시 로드하지 않음을 의미합니다. 이는 데이터 양이 많고 자주 업데이트되는 소스에 유용합니다.

이를 활용하려면 로더의 `last_state` 속성을 저장하고 다시 로더를 생성할 때 이를 전달하십시오. 이렇게 하면 새 기록만 로드됩니다.

```python
last_state = issues_loader.last_state  # 안전하게 저장하십시오

증분_issue_loader = AirbyteCDKLoader(
    source_class=SourceGithub, config=config, stream_name="issues", state=last_state
)

new_docs = incremental_issue_loader.load()
```

