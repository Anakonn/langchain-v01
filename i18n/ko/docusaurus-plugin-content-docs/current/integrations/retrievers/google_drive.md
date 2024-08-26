---
translated: true
---

# Google Drive

이 노트북은 `Google Drive`에서 문서를 검색하는 방법을 다룹니다.

## 전제 조건

1. Google Cloud 프로젝트를 생성하거나 기존 프로젝트를 사용합니다.
1. [Google Drive API](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)를 활성화합니다.
1. [데스크톱 앱에 대한 자격 증명 승인](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## Google 문서 검색

기본적으로 `GoogleDriveRetriever`는 `~/.credentials/credentials.json` 파일을 예상하지만, `GOOGLE_ACCOUNT_FILE` 환경 변수를 사용하여 이를 구성할 수 있습니다.
`token.json`의 위치는 동일한 디렉토리를 사용합니다(또는 `token_path` 매개변수 사용). `token.json`은 retriever를 처음 사용할 때 자동으로 생성됩니다.

`GoogleDriveRetriever`는 일부 요청으로 파일 선택을 검색할 수 있습니다.

기본적으로 `folder_id`를 사용하면 해당 폴더 내의 모든 파일을 `Document`로 검색할 수 있습니다.

폴더 및 문서 ID는 URL에서 얻을 수 있습니다:

* 폴더: https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> 폴더 ID는 `"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"`
* 문서: https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> 문서 ID는 `"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"`

특수 값 `root`는 개인 홈 디렉토리를 의미합니다.

```python
from langchain_googledrive.retrievers import GoogleDriveRetriever

folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'

retriever = GoogleDriveRetriever(
    num_results=2,
)
```

기본적으로 다음 MIME 유형의 모든 파일을 `Document`로 변환할 수 있습니다.

- `text/text`
- `text/plain`
- `text/html`
- `text/csv`
- `text/markdown`
- `image/png`
- `image/jpeg`
- `application/epub+zip`
- `application/pdf`
- `application/rtf`
- `application/vnd.google-apps.document` (GDoc)
- `application/vnd.google-apps.presentation` (GSlide)
- `application/vnd.google-apps.spreadsheet` (GSheet)
- `application/vnd.google.colaboratory` (Notebook colab)
- `application/vnd.openxmlformats-officedocument.presentationml.presentation` (PPTX)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)

이를 업데이트하거나 사용자 정의할 수 있습니다. `GoogleDriveRetriever`의 문서를 참조하세요.

그러나 해당 패키지가 설치되어 있어야 합니다.

```python
%pip install --upgrade --quiet  unstructured
```

```python
retriever.invoke("machine learning")
```

파일 선택 기준을 사용자 정의할 수 있습니다. 미리 정의된 필터 집합이 제안됩니다:

| 템플릿                                 | 설명                                                           |
| --------------------------------------   | --------------------------------------------------------------------- |
| `gdrive-all-in-folder`                   | `folder_id`에서 호환되는 모든 파일 반환                        |
| `gdrive-query`                           | 모든 드라이브에서 `query` 검색                                |
| `gdrive-by-name`                         | `query`로 파일 이름 검색                                     |
| `gdrive-query-in-folder`                 | `folder_id`(및 `_recursive=true`의 하위 폴더)에서 `query` 검색 |
| `gdrive-mime-type`                       | 특정 `mime_type` 검색                                        |
| `gdrive-mime-type-in-folder`             | `folder_id`에서 특정 `mime_type` 검색                         |
| `gdrive-query-with-mime-type`            | 특정 `mime_type`으로 `query` 검색                            |
| `gdrive-query-with-mime-type-and-folder` | `folder_id`에서 특정 `mime_type`으로 `query` 검색             |

```python
retriever = GoogleDriveRetriever(
    template="gdrive-query",  # Search everywhere
    num_results=2,  # But take only 2 documents
)
for doc in retriever.invoke("machine learning"):
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

또는 전문화된 `PromptTemplate`으로 프롬프트를 사용자 정의할 수 있습니다.

```python
from langchain_core.prompts import PromptTemplate

retriever = GoogleDriveRetriever(
    template=PromptTemplate(
        input_variables=["query"],
        # See https://developers.google.com/drive/api/guides/search-files
        template="(fullText contains '{query}') "
        "and mimeType='application/vnd.google-apps.document' "
        "and modifiedTime > '2000-01-01T00:00:00' "
        "and trashed=false",
    ),
    num_results=2,
    # See https://developers.google.com/drive/api/v3/reference/files/list
    includeItemsFromAllDrives=False,
    supportsAllDrives=False,
)
for doc in retriever.invoke("machine learning"):
    print(f"{doc.metadata['name']}:")
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

## Google Drive 'description' 메타데이터 사용

각 Google Drive에는 메타데이터에 `description` 필드가 있습니다(파일 *세부 정보* 참조).
`snippets` 모드를 사용하여 선택한 파일의 설명을 반환할 수 있습니다.

```python
retriever = GoogleDriveRetriever(
    template="gdrive-mime-type-in-folder",
    folder_id=folder_id,
    mime_type="application/vnd.google-apps.document",  # Only Google Docs
    num_results=2,
    mode="snippets",
    includeItemsFromAllDrives=False,
    supportsAllDrives=False,
)
retriever.invoke("machine learning")
```
