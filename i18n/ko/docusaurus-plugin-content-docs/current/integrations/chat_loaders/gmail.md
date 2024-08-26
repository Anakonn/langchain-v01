---
translated: true
---

# GMail

이 로더는 GMail에서 데이터를 로드하는 방법을 다룹니다. GMail에서 데이터를 로드하는 방법에는 여러 가지가 있을 수 있습니다. 이 로더는 현재 다소 의견이 있는 방식으로 이를 수행합니다. 먼저 사용자가 보낸 모든 메시지를 검색합니다. 그런 다음 이전 이메일에 응답하는 메시지를 찾습니다. 그런 다음 해당 이전 이메일을 가져와서 해당 이메일과 사용자의 이메일을 포함한 학습 예제를 만듭니다.

여기에는 명확한 한계가 있다는 점을 유의하세요. 예를 들어, 생성된 모든 예제는 이전 이메일만을 컨텍스트로 사용합니다.

사용 방법:

- Google 개발자 계정을 설정합니다. Google 개발자 콘솔로 이동하여 프로젝트를 생성하고 해당 프로젝트에 대해 Gmail API를 활성화합니다. 이렇게 하면 나중에 필요할 credentials.json 파일을 얻을 수 있습니다.

- Google 클라이언트 라이브러리를 설치합니다. 다음 명령을 실행하여 Google 클라이언트 라이브러리를 설치합니다.

```python
%pip install --upgrade --quiet google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

```python
import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

creds = None
# token.json 파일은 사용자의 액세스 및 새로 고침 토큰을 저장하며,

# 첫 번째 인증 흐름이 완료되면 자동으로 생성됩니다.

if os.path.exists("email_token.json"):
    creds = Credentials.from_authorized_user_file("email_token.json", SCOPES)
# 유효한 자격 증명이 없으면 사용자에게 로그인하도록 요청합니다.

if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            # 여기에 자격 증명 파일을 추가하세요. https://cloud.google.com/docs/authentication/getting-started 에서 json 파일을 생성하세요.
            "creds.json",
            SCOPES,
        )
        creds = flow.run_local_server(port=0)
    # 다음 실행을 위해 자격 증명을 저장합니다.
    with open("email_token.json", "w") as token:
        token.write(creds.to_json())
```

```python
from langchain_community.chat_loaders.gmail import GMailLoader
```

```python
loader = GMailLoader(creds=creds, n=3)
```

```python
data = loader.load()
```

```python
# 때때로 오류가 발생할 수 있으며, 이는 조용히 무시됩니다.

len(data)
```

```output
2
```

```python
from langchain_community.chat_loaders.utils import (
    map_ai_messages,
)
```

```python
# 이는 hchase@langchain.com에서 보낸 메시지를 AI 메시지로 만듭니다.

# 즉, LLM이 hchase처럼 응답하는 것을 예측하도록 학습하게 됩니다.

training_data = list(
    map_ai_messages(data, sender="Harrison Chase <hchase@langchain.com>")
)
```