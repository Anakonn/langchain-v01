---
translated: true
---

# YouTube 트랜스크립트

>[YouTube](https://www.youtube.com/)는 Google이 만든 온라인 동영상 공유 및 소셜 미디어 플랫폼입니다.

이 노트북에서는 `YouTube 트랜스크립트`에서 문서를 로드하는 방법을 다룹니다.

```python
from langchain_community.document_loaders import YoutubeLoader
```

```python
%pip install --upgrade --quiet  youtube-transcript-api
```

```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg", add_video_info=False
)
```

```python
loader.load()
```

### 비디오 정보 추가

```python
%pip install --upgrade --quiet  pytube
```

```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg", add_video_info=True
)
loader.load()
```

### 언어 설정 추가

Language param : 내림차순 우선순위의 언어 코드 목록, 기본값은 `en`입니다.

translation param : 선호하는 언어로 번역하는 옵션입니다.

```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg",
    add_video_info=True,
    language=["en", "id"],
    translation="en",
)
loader.load()
```

## Google Cloud의 YouTube 로더

### 사전 요구 사항

1. Google Cloud 프로젝트 생성 또는 기존 프로젝트 사용
1. [Youtube Api](https://console.cloud.google.com/apis/enableflow?apiid=youtube.googleapis.com&project=sixth-grammar-344520) 활성화
1. [데스크톱 앱용 자격 증명 승인](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib youtube-transcript-api`

### 🧑 Google Docs 데이터 수집 지침

기본적으로 `GoogleDriveLoader`는 `~/.credentials/credentials.json` 파일을 예상하지만, `credentials_file` 키워드 인수를 사용하여 이를 구성할 수 있습니다. `token.json`도 마찬가지입니다. `token.json`은 로더를 처음 사용할 때 자동으로 생성됩니다.

`GoogleApiYoutubeLoader`는 Google Docs 문서 ID 목록 또는 폴더 ID에서 로드할 수 있습니다. URL에서 폴더 및 문서 ID를 얻을 수 있습니다.
설정에 따라 `service_account_path`를 설정해야 합니다. 자세한 내용은 [여기](https://developers.google.com/drive/api/v3/quickstart/python)를 참조하세요.

```python
# Init the GoogleApiClient
from pathlib import Path

from langchain_community.document_loaders import GoogleApiClient, GoogleApiYoutubeLoader

google_api_client = GoogleApiClient(credentials_path=Path("your_path_creds.json"))


# Use a Channel
youtube_loader_channel = GoogleApiYoutubeLoader(
    google_api_client=google_api_client,
    channel_name="Reducible",
    captions_language="en",
)

# Use Youtube Ids

youtube_loader_ids = GoogleApiYoutubeLoader(
    google_api_client=google_api_client, video_ids=["TrdevFK_am4"], add_video_info=True
)

# returns a list of Documents
youtube_loader_channel.load()
```
