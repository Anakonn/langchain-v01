---
translated: true
---

# Trello

>[Trello](https://www.atlassian.com/software/trello)는 개인과 팀이 작업과 프로젝트를 구성하고 추적할 수 있게 해주는 웹 기반 프로젝트 관리 및 협업 도구입니다. 사용자가 작업과 활동을 나타내는 "보드"라는 시각적 인터페이스를 제공합니다.

TrelloLoader는 Trello 보드에서 카드를 로드할 수 있으며 [py-trello](https://pypi.org/project/py-trello/)를 기반으로 구현되었습니다.

현재는 `api_key/token`만 지원합니다.

1. 자격 증명 생성: https://trello.com/power-ups/admin/

2. 수동 토큰 생성 링크를 클릭하여 토큰을 얻습니다.

API 키와 토큰을 지정하려면 환경 변수 ``TRELLO_API_KEY`` 및 ``TRELLO_TOKEN``을 설정하거나 `from_credentials` 편의 생성자 메서드에 직접 ``api_key`` 및 ``token``을 전달할 수 있습니다.

이 로더를 사용하면 보드 이름을 제공하여 해당 카드를 문서 객체로 가져올 수 있습니다.

공식 문서에서 보드 "이름"은 "제목"이라고도 합니다:

https://support.atlassian.com/trello/docs/changing-a-boards-title-and-description/

문서의 page_content 속성과 메타데이터에 포함/제외할 다양한 필드를 지정할 수도 있습니다.

## 기능

- Trello 보드에서 카드 로드
- 상태(열림 또는 닫힘)에 따라 카드 필터링
- 로드된 문서에 카드 이름, 댓글 및 체크리스트 포함
- 문서에 포함할 추가 메타데이터 필드 사용자 지정

기본적으로 모든 카드 필드가 전체 텍스트 page_content와 메타데이터에 포함됩니다.

```python
%pip install --upgrade --quiet  py-trello beautifulsoup4 lxml
```

```python
# If you have already set the API key and token using environment variables,
# you can skip this cell and comment out the `api_key` and `token` named arguments
# in the initialization steps below.
from getpass import getpass

API_KEY = getpass()
TOKEN = getpass()
```

```output
········
········
```

```python
from langchain_community.document_loaders import TrelloLoader

# Get the open cards from "Awesome Board"
loader = TrelloLoader.from_credentials(
    "Awesome Board",
    api_key=API_KEY,
    token=TOKEN,
    card_filter="open",
)
documents = loader.load()

print(documents[0].page_content)
print(documents[0].metadata)
```

```output
Review Tech partner pages
Comments:
{'title': 'Review Tech partner pages', 'id': '6475357890dc8d17f73f2dcc', 'url': 'https://trello.com/c/b0OTZwkZ/1-review-tech-partner-pages', 'labels': ['Demand Marketing'], 'list': 'Done', 'closed': False, 'due_date': ''}
```

```python
# Get all the cards from "Awesome Board" but only include the
# card list(column) as extra metadata.
loader = TrelloLoader.from_credentials(
    "Awesome Board",
    api_key=API_KEY,
    token=TOKEN,
    extra_metadata=("list"),
)
documents = loader.load()

print(documents[0].page_content)
print(documents[0].metadata)
```

```output
Review Tech partner pages
Comments:
{'title': 'Review Tech partner pages', 'id': '6475357890dc8d17f73f2dcc', 'url': 'https://trello.com/c/b0OTZwkZ/1-review-tech-partner-pages', 'list': 'Done'}
```

```python
# Get the cards from "Another Board" and exclude the card name,
# checklist and comments from the Document page_content text.
loader = TrelloLoader.from_credentials(
    "test",
    api_key=API_KEY,
    token=TOKEN,
    include_card_name=False,
    include_checklist=False,
    include_comments=False,
)
documents = loader.load()

print("Document: " + documents[0].page_content)
print(documents[0].metadata)
```
