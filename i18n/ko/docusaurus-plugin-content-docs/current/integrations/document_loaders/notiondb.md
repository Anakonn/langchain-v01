---
translated: true
---

# Notion DB 2/2

>[Notion](https://www.notion.so/)은 칸반 보드, 작업, 위키 및 데이터베이스를 통합하는 수정된 Markdown 지원 협업 플랫폼입니다. 이는 메모 작성, 지식 및 데이터 관리, 프로젝트 및 작업 관리를 위한 올인원 작업 공간입니다.

`NotionDBLoader`는 `Notion` 데이터베이스에서 콘텐츠를 로드하는 Python 클래스입니다. 데이터베이스에서 페이지를 검색하고, 콘텐츠를 읽어들여 Document 객체 목록을 반환합니다.

## 요구 사항

- `Notion` 데이터베이스
- Notion Integration Token

## 설정

### 1. Notion 테이블 데이터베이스 만들기

Notion에 새 테이블 데이터베이스를 만드세요. 데이터베이스에 어떤 열을 추가해도 메타데이터로 처리됩니다. 예를 들어 다음과 같은 열을 추가할 수 있습니다:

- 제목: 기본 속성으로 제목을 설정합니다.
- 카테고리: 페이지와 관련된 카테고리를 저장하는 다중 선택 속성.
- 키워드: 페이지와 관련된 키워드를 저장하는 다중 선택 속성.

각 페이지의 본문에 콘텐츠를 추가하세요. NotionDBLoader는 이 페이지에서 콘텐츠와 메타데이터를 추출합니다.

## 2. Notion 통합 만들기

Notion 통합을 만들려면 다음 단계를 따르세요:

1. [Notion Developers](https://www.notion.com/my-integrations) 페이지를 방문하고 Notion 계정으로 로그인합니다.
2. "+ New integration" 버튼을 클릭합니다.
3. 통합의 이름을 지정하고 데이터베이스가 있는 작업 공간을 선택합니다.
4. 필요한 기능을 선택합니다. 이 확장에는 콘텐츠 읽기 기능만 필요합니다.
5. "Submit" 버튼을 클릭하여 통합을 생성합니다.
통합이 생성되면 `Integration Token (API key)`가 제공됩니다. 이 토큰을 복사하여 안전하게 보관하세요. NotionDBLoader를 사용하려면 이 토큰이 필요합니다.

### 3. 통합을 데이터베이스에 연결

통합을 데이터베이스에 연결하려면 다음 단계를 따르세요:

1. Notion에서 데이터베이스를 엽니다.
2. 데이터베이스 보기의 오른쪽 상단 모서리에 있는 세 개의 점 메뉴 아이콘을 클릭합니다.
3. "+ New integration" 버튼을 클릭합니다.
4. 통합을 찾습니다. 검색 상자에 통합 이름을 입력해야 할 수 있습니다.
5. "Connect" 버튼을 클릭하여 통합을 데이터베이스에 연결합니다.

### 4. 데이터베이스 ID 가져오기

데이터베이스 ID를 가져오려면 다음 단계를 따르세요:

1. Notion에서 데이터베이스를 엽니다.
2. 데이터베이스 보기의 오른쪽 상단 모서리에 있는 세 개의 점 메뉴 아이콘을 클릭합니다.
3. 메뉴에서 "Copy link"를 선택하여 데이터베이스 URL을 클립보드에 복사합니다.
4. 데이터베이스 ID는 URL에 있는 긴 영숫자 문자열입니다. 일반적으로 다음과 같이 보입니다: https://www.notion.so/username/8935f9d140a04f95a872520c4f123456?v=.... 이 예에서 데이터베이스 ID는 8935f9d140a04f95a872520c4f123456입니다.

데이터베이스가 올바르게 설정되고 통합 토큰과 데이터베이스 ID를 확보했다면 NotionDBLoader 코드를 사용하여 Notion 데이터베이스에서 콘텐츠와 메타데이터를 로드할 수 있습니다.

## 사용법

NotionDBLoader는 langchain 패키지의 문서 로더 중 하나입니다. 다음과 같이 사용할 수 있습니다:

```python
from getpass import getpass

NOTION_TOKEN = getpass()
DATABASE_ID = getpass()
```

```output
········
········
```

```python
from langchain_community.document_loaders import NotionDBLoader
```

```python
loader = NotionDBLoader(
    integration_token=NOTION_TOKEN,
    database_id=DATABASE_ID,
    request_timeout_sec=30,  # optional, defaults to 10
)
```

```python
docs = loader.load()
```

```python
print(docs)
```
