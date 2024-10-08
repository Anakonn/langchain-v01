---
translated: true
---

# Google Firestore (Datastore 모드)

> [Google Cloud Firestore in Datastore](https://cloud.google.com/datastore)는 어떤 요구사항에도 맞춰 확장될 수 있는 서버리스 문서 지향 데이터베이스입니다. `Datastore`의 Langchain 통합을 활용하여 AI 기반 경험을 구축하도록 데이터베이스 애플리케이션을 확장할 수 있습니다.

이 노트북에서는 [Google Cloud Firestore in Datastore](https://cloud.google.com/datastore)를 사용하여 `DatastoreChatMessageHistory` 클래스로 채팅 메시지 기록을 저장하는 방법을 살펴봅니다.

패키지에 대해 자세히 알아보려면 [GitHub](https://github.com/googleapis/langchain-google-datastore-python/)을 참조하세요.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-datastore-python/blob/main/docs/chat_message_history.ipynb)

## 시작하기 전에

이 노트북을 실행하려면 다음을 수행해야 합니다:

* [Google Cloud 프로젝트 생성](https://developers.google.com/workspace/guides/create-project)
* [Datastore API 활성화](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com)
* [Datastore 데이터베이스 생성](https://cloud.google.com/datastore/docs/manage-databases)

런타임 환경에서 데이터베이스에 대한 액세스를 확인한 후, 다음 값을 입력하고 예제 스크립트를 실행하기 전에 셀을 실행하세요.

### 🦜🔗 라이브러리 설치

통합은 `langchain-google-datastore` 패키지에 있으므로 이를 설치해야 합니다.

```python
%pip install -upgrade --quiet langchain-google-datastore
```

**Colab 전용**: 다음 셀의 주석을 해제하거나 버튼을 사용하여 커널을 다시 시작하세요. Vertex AI Workbench의 경우 상단의 버튼을 사용하여 터미널을 다시 시작할 수 있습니다.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Google Cloud 프로젝트 설정

이 노트북에서 Google Cloud 리소스를 활용할 수 있도록 Google Cloud 프로젝트를 설정하세요.

프로젝트 ID를 모르는 경우 다음을 시도해 보세요:

* `gcloud config list`를 실행합니다.
* `gcloud projects list`를 실행합니다.
* [프로젝트 ID 찾기](https://support.google.com/googleapi/answer/7014113) 지원 페이지를 참조하세요.

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 인증

이 노트북에 로그인된 IAM 사용자로 Google Cloud에 인증하여 Google Cloud 프로젝트에 액세스할 수 있습니다.

- Colab을 사용하여 이 노트북을 실행하는 경우 아래 셀을 사용하고 계속하세요.
- Vertex AI Workbench를 사용하는 경우 [여기](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)의 설정 지침을 확인하세요.

```python
from google.colab import auth

auth.authenticate_user()
```

### API 활성화

`langchain-google-datastore` 패키지를 사용하려면 Google Cloud 프로젝트에서 [Datastore API를 활성화](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com)해야 합니다.

```python
# enable Datastore API
!gcloud services enable datastore.googleapis.com
```

## 기본 사용법

### DatastoreChatMessageHistory

`DatastoreChatMessageHistory` 클래스를 초기화하려면 다음 3가지만 제공하면 됩니다:

1. `session_id` - 세션의 고유 식별자 문자열입니다.
1. `kind` - 작성할 Datastore 종류의 이름입니다. 이 값은 선택 사항이며 기본적으로 `ChatHistory`가 사용됩니다.
1. `collection` - Datastore 컬렉션의 단일 `/`로 구분된 경로입니다.

```python
from langchain_google_datastore import DatastoreChatMessageHistory

chat_history = DatastoreChatMessageHistory(
    session_id="user-session-id", collection="HistoryMessages"
)

chat_history.add_user_message("Hi!")
chat_history.add_ai_message("How can I help you?")
```

```python
chat_history.messages
```

#### 정리

특정 세션의 기록이 더 이상 필요하지 않고 데이터베이스와 메모리에서 삭제할 수 있는 경우 다음과 같이 수행할 수 있습니다.

**참고:** 삭제되면 데이터가 Datastore에 더 이상 저장되지 않고 영구적으로 삭제됩니다.

```python
chat_history.clear()
```

### 사용자 정의 클라이언트

클라이언트는 기본적으로 사용 가능한 환경 변수를 사용하여 생성됩니다. [사용자 정의 클라이언트](https://cloud.google.com/python/docs/reference/datastore/latest/client)를 생성자에 전달할 수 있습니다.

```python
from google.auth import compute_engine
from google.cloud import datastore

client = datastore.Client(
    project="project-custom",
    database="non-default-database",
    credentials=compute_engine.Credentials(),
)

history = DatastoreChatMessageHistory(
    session_id="session-id", collection="History", client=client
)

history.add_user_message("New message")

history.messages

history.clear()
```
