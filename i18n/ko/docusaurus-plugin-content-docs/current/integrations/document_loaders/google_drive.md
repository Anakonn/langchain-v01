---
translated: true
---

# Google Drive

>[Google Drive](https://en.wikipedia.org/wiki/Google_Drive)는 Google에서 개발한 파일 저장 및 동기화 서비스입니다.

이 노트북은 `Google Drive`에서 문서를 로드하는 방법을 다룹니다. 현재 `Google Docs`만 지원됩니다.

## 전제 조건

1. Google Cloud 프로젝트를 생성하거나 기존 프로젝트를 사용합니다.
1. [Google Drive API](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)를 활성화합니다.
1. [데스크톱 앱에 대한 자격 증명 승인](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## 🧑 Google Docs 데이터 수집 지침

환경 변수 `GOOGLE_APPLICATION_CREDENTIALS`를 빈 문자열 (`""`)로 설정합니다.

기본적으로 `GoogleDriveLoader`는 `~/.credentials/credentials.json` 파일에 있는 `credentials.json` 파일을 예상하지만, `credentials_path` 키워드 인수를 사용하여 이를 구성할 수 있습니다. `token.json`의 경우에도 마찬가지입니다 - 기본 경로: `~/.credentials/token.json`, 생성자 매개변수: `token_path`.

GoogleDriveLoader를 처음 사용할 때 브라우저에서 사용자 인증을 위한 동의 화면이 표시됩니다. 인증 후 `token.json`이 제공된 경로 또는 기본 경로에 자동으로 생성됩니다. 또한 해당 경로에 이미 `token.json`이 있는 경우 인증 프롬프트가 표시되지 않습니다.

`GoogleDriveLoader`는 Google Docs 문서 ID 목록 또는 폴더 ID에서 로드할 수 있습니다. URL에서 폴더 및 문서 ID를 얻을 수 있습니다:

* 폴더: https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> 폴더 ID는 `"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"`
* 문서: https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> 문서 ID는 `"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"`

```python
%pip install --upgrade --quiet langchain-google-community[drive]
```

```python
from langchain_google_community import GoogleDriveLoader
```

```python
loader = GoogleDriveLoader(
    folder_id="1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5",
    token_path="/path/where/you/want/token/to/be/created/google_token.json",
    # Optional: configure whether to recursively fetch files from subfolders. Defaults to False.
    recursive=False,
)
```

```python
docs = loader.load()
```

`folder_id`를 전달하면 기본적으로 문서, 시트 및 PDF 유형의 모든 파일이 로드됩니다. `file_types` 인수를 전달하여 이 동작을 수정할 수 있습니다.

```python
loader = GoogleDriveLoader(
    folder_id="1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5",
    file_types=["document", "sheet"],
    recursive=False,
)
```

## 선택적 파일 로더 전달

Google Docs 및 Google Sheets 이외의 파일을 처리할 때는 선택적 파일 로더를 `GoogleDriveLoader`에 전달하면 유용할 수 있습니다. 파일 로더를 전달하면 Google Docs 또는 Google Sheets MIME 유형이 아닌 문서에 해당 파일 로더가 사용됩니다. 다음은 파일 로더를 사용하여 Google Drive에서 Excel 문서를 로드하는 예입니다.

```python
from langchain_community.document_loaders import UnstructuredFileIOLoader
from langchain_google_community import GoogleDriveLoader
```

```python
file_id = "1x9WBtFPWMEAdjcJzPScRsjpjQvpSo_kz"
loader = GoogleDriveLoader(
    file_ids=[file_id],
    file_loader_cls=UnstructuredFileIOLoader,
    file_loader_kwargs={"mode": "elements"},
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

파일과 Google Docs/Sheets가 혼합된 폴더를 처리하려면 다음 패턴을 사용할 수 있습니다:

```python
folder_id = "1asMOHY1BqBS84JcRbOag5LOJac74gpmD"
loader = GoogleDriveLoader(
    folder_id=folder_id,
    file_loader_cls=UnstructuredFileIOLoader,
    file_loader_kwargs={"mode": "elements"},
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

## 확장된 사용법

Google Drive의 복잡성을 관리할 수 있는 외부(비공식) 구성 요소인 `langchain-googledrive`를 사용할 수 있습니다.
`langchain_community.document_loaders.GoogleDriveLoader`와 호환되며 이를 대체할 수 있습니다.

컨테이너와 호환되도록 인증은 `GOOGLE_ACCOUNT_FILE` 환경 변수를 사용하여 자격 증명 파일(사용자 또는 서비스)을 사용합니다.

```python
%pip install --upgrade --quiet  langchain-googledrive
```

```python
folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'
```

```python
# Use the advanced version.
from langchain_googledrive.document_loaders import GoogleDriveLoader
```

```python
loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    num_results=2,  # Maximum number of file to load
)
```

기본적으로 다음 MIME 유형의 모든 파일을 `Document`로 변환할 수 있습니다.
- text/text
- text/plain
- text/html
- text/csv
- text/markdown
- image/png
- image/jpeg
- application/epub+zip
- application/pdf
- application/rtf
- application/vnd.google-apps.document (GDoc)
- application/vnd.google-apps.presentation (GSlide)
- application/vnd.google-apps.spreadsheet (GSheet)
- application/vnd.google.colaboratory (Notebook colab)
- application/vnd.openxmlformats-officedocument.presentationml.presentation (PPTX)
- application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX)

이를 업데이트하거나 사용자 정의할 수 있습니다. `GDriveLoader` 문서를 참조하세요.

그러나 해당 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  unstructured
```

```python
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

### 인증 ID 로드

Google Drive Loader에 의해 수집된 각 파일의 권한 있는 ID를 메타데이터와 함께 로드할 수 있습니다.

```python
from langchain_google_community import GoogleDriveLoader

loader = GoogleDriveLoader(
    folder_id=folder_id,
    load_auth=True,
    # Optional: configure whether to load authorized identities for each Document.
)

doc = loader.load()
```

`load_auth=True`를 전달하여 Google Drive 문서 액세스 ID를 메타데이터에 추가할 수 있습니다.

```python
doc[0].metadata
```

### 확장된 메타데이터 로드

다음과 같은 추가 필드를 각 문서의 메타데이터에서 가져올 수 있습니다:
- full_path - Google Drive의 파일/폴더의 전체 경로.
- owner - 파일/폴더의 소유자.
- size - 파일/폴더의 크기.

```python
from langchain_google_community import GoogleDriveLoader

loader = GoogleDriveLoader(
    folder_id=folder_id,
    load_extended_matadata=True,
    # Optional: configure whether to load extended metadata for each Document.
)

doc = loader.load()
```

`load_extended_matadata=True`를 전달하여 Google Drive 문서의 확장된 세부 정보를 메타데이터에 추가할 수 있습니다.

```python
doc[0].metadata
```

### 검색 패턴 사용자 정의

Google [`list()`](https://developers.google.com/drive/api/v3/reference/files/list) API와 호환되는 모든 매개변수를 설정할 수 있습니다.

다음과 같이 한국어로 번역했습니다:

Google 요청의 새로운 패턴을 지정하려면 `PromptTemplate()`을 사용할 수 있습니다.
프롬프트의 변수는 생성자에서 `kwargs`로 설정할 수 있습니다.
미리 형식화된 요청이 제안됩니다 (사용 `{query}`, `{folder_id}` 및/또는 `{mime_type}`):

파일을 선택하는 기준을 사용자 정의할 수 있습니다. 미리 정의된 필터 세트가 제안됩니다:

| 템플릿                                | 설명                                                                |
| -------------------------------------- | --------------------------------------------------------------------- |
| gdrive-all-in-folder                   | `folder_id`에서 호환되는 모든 파일 반환                                |
| gdrive-query                           | 모든 드라이브에서 `query` 검색                                        |
| gdrive-by-name                         | 이름이 `query`인 파일 검색                                          |
| gdrive-query-in-folder                 | `folder_id`(및 `recursive=true`인 경우 하위 폴더)에서 `query` 검색   |
| gdrive-mime-type                       | 특정 `mime_type` 검색                                               |
| gdrive-mime-type-in-folder             | `folder_id`에서 특정 `mime_type` 검색                                |
| gdrive-query-with-mime-type            | 특정 `mime_type`으로 `query` 검색                                    |
| gdrive-query-with-mime-type-and-folder | `folder_id`에서 특정 `mime_type`으로 `query` 검색                     |

```python
loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    template="gdrive-query",  # Default template to use
    query="machine learning",
    num_results=2,  # Maximum number of file to load
    supportsAllDrives=False,  # GDrive `list()` parameter
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

사용자 정의 패턴을 사용할 수 있습니다.

```python
from langchain_core.prompts.prompt import PromptTemplate

loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    template=PromptTemplate(
        input_variables=["query", "query_name"],
        template="fullText contains '{query}' and name contains '{query_name}' and trashed=false",
    ),  # Default template to use
    query="machine learning",
    query_name="ML",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

변환은 Markdown 형식으로 관리할 수 있습니다:
- 목록
- 링크
- 표
- 제목

`return_link`를 `True`로 설정하면 링크를 내보낼 수 있습니다.

#### GSlide 및 GSheet 모드

매개변수 mode는 다음과 같은 값을 허용합니다:

- "document": 각 문서의 본문 반환
- "snippets": 각 파일의 설명(Google Drive 파일의 메타데이터에 설정된) 반환.

매개변수 `gslide_mode`는 다음과 같은 값을 허용합니다:

- "single" : &lt;PAGE BREAK&gt;가 있는 한 문서
- "slide" : 슬라이드별 한 문서
- "elements" : 각 요소별 한 문서.

```python
loader = GoogleDriveLoader(
    template="gdrive-mime-type",
    mime_type="application/vnd.google-apps.presentation",  # Only GSlide files
    gslide_mode="slide",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

매개변수 `gsheet_mode`는 다음과 같은 값을 허용합니다:
- `"single"`: 한 줄별 한 문서 생성
- `"elements"` : Markdown 배열과 &lt;PAGE BREAK&gt; 태그가 있는 한 문서.

```python
loader = GoogleDriveLoader(
    template="gdrive-mime-type",
    mime_type="application/vnd.google-apps.spreadsheet",  # Only GSheet files
    gsheet_mode="elements",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

### 고급 사용법

모든 Google 파일에는 메타데이터의 '설명'이 있습니다. 이 필드는 문서의 요약 또는 기타 색인 태그를 기억하는 데 사용할 수 있습니다(메서드 `lazy_update_description_with_summary()`참조).

`mode="snippet"`을 사용하는 경우 설명만 본문으로 사용됩니다. 그렇지 않으면 `metadata['summary']`에 필드가 있습니다.

때로는 특정 필터를 사용하여 파일 이름에서 정보를 추출하여 특정 기준으로 파일을 선택할 수 있습니다. 필터를 사용할 수 있습니다.

때로는 많은 문서가 반환됩니다. 모든 문서를 메모리에 보유할 필요는 없습니다. 한 번에 하나의 문서를 가져올 수 있는 게으른 버전의 메서드를 사용할 수 있습니다. 복잡한 쿼리를 재귀적 검색 대신 사용하는 것이 좋습니다. `recursive=True`를 활성화하면 각 폴더에 쿼리를 적용해야 합니다.

```python
import os

loader = GoogleDriveLoader(
    gdrive_api_file=os.environ["GOOGLE_ACCOUNT_FILE"],
    num_results=2,
    template="gdrive-query",
    filter=lambda search, file: "#test" not in file.get("description", ""),
    query="machine learning",
    supportsAllDrives=False,
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```
