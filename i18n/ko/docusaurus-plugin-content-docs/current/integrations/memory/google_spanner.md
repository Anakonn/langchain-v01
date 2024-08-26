---
translated: true
---

# Google Spanner

> [Google Cloud Spanner](https://cloud.google.com/spanner)는 2차 인덱스, 강력한 일관성, 스키마, SQL과 같은 관계형 의미론을 제공하면서도 무제한 확장성을 결합한 고도로 확장 가능한 데이터베이스입니다. 이 솔루션은 99.999%의 가용성을 제공합니다.

이 노트북은 `SpannerChatMessageHistory` 클래스를 사용하여 채팅 메시지 기록을 저장하는 방법을 설명합니다.
[GitHub](https://github.com/googleapis/langchain-google-spanner-python/)에서 패키지에 대해 자세히 알아보세요.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-spanner-python/blob/main/samples/chat_message_history.ipynb)

## 시작하기 전에

이 노트북을 실행하려면 다음을 수행해야 합니다:

 * [Google Cloud 프로젝트 생성](https://developers.google.com/workspace/guides/create-project)
 * [Cloud Spanner API 활성화](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)
 * [Spanner 인스턴스 생성](https://cloud.google.com/spanner/docs/create-manage-instances)
 * [Spanner 데이터베이스 생성](https://cloud.google.com/spanner/docs/create-manage-databases)

### 🦜🔗 라이브러리 설치

통합은 `langchain-google-spanner` 패키지에 있으므로 이를 설치해야 합니다.

```python
%pip install --upgrade --quiet langchain-google-spanner
```

**Colab only:** 다음 셀의 주석을 해제하거나 버튼을 사용하여 커널을 다시 시작하세요. Vertex AI Workbench의 경우 상단의 버튼을 사용하여 터미널을 다시 시작할 수 있습니다.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 인증

이 노트북에 로그인된 IAM 사용자로 Google Cloud에 인증하여 Google Cloud 프로젝트에 액세스합니다.

* Colab을 사용하여 이 노트북을 실행하는 경우 아래 셀을 사용하고 계속하세요.
* Vertex AI Workbench를 사용하는 경우 [여기](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)의 설정 지침을 확인하세요.

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ Google Cloud 프로젝트 설정

이 노트북 내에서 Google Cloud 리소스를 활용할 수 있도록 Google Cloud 프로젝트를 설정합니다.

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

### 💡 API 활성화

`langchain-google-spanner` 패키지를 사용하려면 Google Cloud 프로젝트에서 [Spanner API를 활성화](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)해야 합니다.

```python
# enable Spanner API
!gcloud services enable spanner.googleapis.com
```

## 기본 사용법

### Spanner 데이터베이스 값 설정

[Spanner 인스턴스 페이지](https://console.cloud.google.com/spanner)에서 데이터베이스 값을 찾으세요.

```python
# @title Set Your Values Here { display-mode: "form" }
INSTANCE = "my-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### 테이블 초기화

`SpannerChatMessageHistory` 클래스에는 채팅 메시지 기록을 저장하기 위한 특정 스키마가 있는 데이터베이스 테이블이 필요합니다.

`init_chat_history_table()` 헬퍼 메서드를 사용하여 적절한 스키마로 테이블을 생성할 수 있습니다.

```python
from langchain_google_spanner import (
    SpannerChatMessageHistory,
)

SpannerChatMessageHistory.init_chat_history_table(table_name=TABLE_NAME)
```

### SpannerChatMessageHistory

`SpannerChatMessageHistory` 클래스를 초기화하려면 다음 3가지만 제공하면 됩니다:

1. `instance_id` - Spanner 인스턴스의 이름
1. `database_id` - Spanner 데이터베이스의 이름
1. `session_id` - 세션의 고유 식별자 문자열
1. `table_name` - 채팅 메시지 기록을 저장할 데이터베이스 내 테이블의 이름

```python
message_history = SpannerChatMessageHistory(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    session_id="user-session-id",
)

message_history.add_user_message("hi!")
message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

## 사용자 정의 클라이언트

기본적으로 생성된 클라이언트는 기본 클라이언트입니다. 기본이 아닌 클라이언트를 사용하려면 [사용자 정의 클라이언트](https://cloud.google.com/spanner/docs/samples/spanner-create-client-with-query-options#spanner_create_client_with_query_options-python)를 생성자에 전달할 수 있습니다.

```python
from google.cloud import spanner

custom_client_message_history = SpannerChatMessageHistory(
    instance_id="my-instance",
    database_id="my-database",
    client=spanner.Client(...),
)
```

## 정리

특정 세션의 기록이 더 이상 필요하지 않고 삭제할 수 있는 경우 다음과 같이 수행할 수 있습니다.
참고: 삭제되면 데이터가 Cloud Spanner에 더 이상 저장되지 않고 영구적으로 삭제됩니다.

```python
message_history = SpannerChatMessageHistory(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    session_id="user-session-id",
)

message_history.clear()
```
