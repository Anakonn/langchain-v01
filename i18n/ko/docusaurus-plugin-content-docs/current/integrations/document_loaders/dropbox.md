---
translated: true
---

# Dropbox

[Dropbox](https://en.wikipedia.org/wiki/Dropbox)는 전통적인 파일, 클라우드 콘텐츠 및 웹 바로 가기를 한 곳에 모아주는 파일 호스팅 서비스입니다.

이 노트북에서는 *Dropbox*에서 문서를 로드하는 방법을 다룹니다. 텍스트 및 PDF 파일과 같은 일반적인 파일 외에도 *Dropbox Paper* 파일도 지원합니다.

## 전제 조건

1. Dropbox 앱을 만듭니다.
2. 앱에 `files.metadata.read` 및 `files.content.read` 범위 권한을 부여합니다.
3. 액세스 토큰을 생성합니다: https://www.dropbox.com/developers/apps/create.
4. `pip install dropbox`(PDF 파일 유형의 경우 `pip install "unstructured[pdf]"`가 필요합니다).

## 지침

`DropboxLoader`를 사용하려면 Dropbox 앱을 만들고 액세스 토큰을 생성해야 합니다. 이는 https://www.dropbox.com/developers/apps/create에서 수행할 수 있습니다. 또한 Dropbox Python SDK가 설치되어 있어야 합니다(pip install dropbox).

DropboxLoader는 Dropbox 파일 경로 목록 또는 단일 Dropbox 폴더 경로에서 데이터를 로드할 수 있습니다. 두 경로 모두 액세스 토큰과 연결된 Dropbox 계정의 루트 디렉토리를 기준으로 해야 합니다.

```python
pip install dropbox
```

```output
Requirement already satisfied: dropbox in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (11.36.2)
Requirement already satisfied: requests>=2.16.2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (2.31.0)
Requirement already satisfied: six>=1.12.0 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (1.16.0)
Requirement already satisfied: stone>=2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (3.3.1)
Requirement already satisfied: charset-normalizer<4,>=2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (3.2.0)
Requirement already satisfied: idna<4,>=2.5 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (3.4)
Requirement already satisfied: urllib3<3,>=1.21.1 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (2.0.4)
Requirement already satisfied: certifi>=2017.4.17 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (2023.7.22)
Requirement already satisfied: ply>=3.4 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from stone>=2->dropbox) (3.11)
Note: you may need to restart the kernel to use updated packages.
```

```python
from langchain_community.document_loaders import DropboxLoader
```

```python
# Generate access token: https://www.dropbox.com/developers/apps/create.
dropbox_access_token = "<DROPBOX_ACCESS_TOKEN>"
# Dropbox root folder
dropbox_folder_path = ""
```

```python
loader = DropboxLoader(
    dropbox_access_token=dropbox_access_token,
    dropbox_folder_path=dropbox_folder_path,
    recursive=False,
)
```

```python
documents = loader.load()
```

```output
File /JHSfLKn0.jpeg could not be decoded as text. Skipping.
File /A REPORT ON WILES’ CAMBRIDGE LECTURES.pdf could not be decoded as text. Skipping.
```

```python
for document in documents:
    print(document)
```
