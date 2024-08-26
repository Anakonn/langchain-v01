---
translated: true
---

# Google 드라이브

이 노트북은 LangChain을 `Google Drive API`에 연결하는 방법을 안내합니다.

## 전제 조건

1. Google Cloud 프로젝트를 생성하거나 기존 프로젝트를 사용합니다.
1. [Google Drive API](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)를 활성화합니다.
1. [데스크톱 앱에 대한 자격 증명 승인](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## Google Docs 데이터 검색 방법

기본적으로 `GoogleDriveTools`와 `GoogleDriveWrapper`는 `credentials.json` 파일이 `~/.credentials/credentials.json`에 있다고 예상하지만, `GOOGLE_ACCOUNT_FILE` 환경 변수를 사용하여 이를 구성할 수 있습니다.
`token.json`의 위치는 동일한 디렉토리를 사용합니다(또는 `token_path` 매개변수 사용). `token.json`은 도구를 처음 사용할 때 자동으로 생성됩니다.

`GoogleDriveSearchTool`을 사용하면 일부 요청으로 파일 선택을 검색할 수 있습니다.

기본적으로 `folder_id`를 사용하는 경우 해당 폴더 내의 모든 파일을 쿼리와 일치하는 이름으로 `Document`에 검색할 수 있습니다.

```python
%pip install --upgrade --quiet  google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

폴더 및 문서 ID는 URL에서 가져올 수 있습니다:

* 폴더: https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> 폴더 ID는 `"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"`
* 문서: https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> 문서 ID는 `"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"`

특수 값 `root`는 개인 홈 디렉토리를 나타냅니다.

```python
folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'
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

이를 업데이트하거나 사용자 정의할 수 있습니다. `GoogleDriveAPIWrapper` 문서를 참조하세요.

그러나 해당 패키지가 설치되어 있어야 합니다.

```python
%pip install --upgrade --quiet  unstructured
```

```python
from langchain_googldrive.tools.google_drive.tool import GoogleDriveSearchTool
from langchain_googledrive.utilities.google_drive import GoogleDriveAPIWrapper

# By default, search only in the filename.
tool = GoogleDriveSearchTool(
    api_wrapper=GoogleDriveAPIWrapper(
        folder_id=folder_id,
        num_results=2,
        template="gdrive-query-in-folder",  # Search in the body of documents
    )
)
```

```python
import logging

logging.basicConfig(level=logging.INFO)
```

```python
tool.run("machine learning")
```

```python
tool.description
```

```python
from langchain.agents import load_tools

tools = load_tools(
    ["google-drive-search"],
    folder_id=folder_id,
    template="gdrive-query-in-folder",
)
```

## 에이전트에서 사용

```python
from langchain.agents import AgentType, initialize_agent
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
)
```

```python
agent.run("Search in google drive, who is 'Yann LeCun' ?")
```
