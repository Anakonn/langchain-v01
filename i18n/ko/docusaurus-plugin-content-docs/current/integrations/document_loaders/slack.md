---
translated: true
---

# Slack

>[Slack](https://slack.com/)은 즉시 메시징 프로그램입니다.

이 노트북은 `Slack` 내보내기에서 생성된 Zipfile에서 문서를 로드하는 방법을 다룹니다.

`Slack` 내보내기를 받으려면 다음 지침을 따르세요:

## 🧑 자신의 데이터셋을 수집하는 방법

Slack 데이터를 내보냅니다. 작업 공간 관리 페이지로 이동하여 Import/Export 옵션을 클릭하여 이 작업을 수행할 수 있습니다({your_slack_domain}.slack.com/services/export). 그런 다음 적절한 날짜 범위를 선택하고 `Start export`를 클릭하세요. Slack은 내보내기가 완료되면 이메일과 DM으로 알려줄 것입니다.

다운로드는 Downloads 폴더(또는 OS 구성에 따라 다른 위치)에 `.zip` 파일을 생성합니다.

`.zip` 파일의 경로를 복사하고 아래 `LOCAL_ZIPFILE`에 할당하세요.

```python
from langchain_community.document_loaders import SlackDirectoryLoader
```

```python
# Optionally set your Slack URL. This will give you proper URLs in the docs sources.
SLACK_WORKSPACE_URL = "https://xxx.slack.com"
LOCAL_ZIPFILE = ""  # Paste the local paty to your Slack zip file here.

loader = SlackDirectoryLoader(LOCAL_ZIPFILE, SLACK_WORKSPACE_URL)
```

```python
docs = loader.load()
docs
```
