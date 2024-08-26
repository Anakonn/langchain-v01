---
translated: true
---

# Google Memorystore for Redis

> [Google Cloud Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview)는 Redis 인메모리 데이터 스토어를 기반으로 하는 완전 관리형 서비스로, 하위 밀리초 데이터 액세스를 제공하는 애플리케이션 캐시를 구축할 수 있습니다. Memorystore for Redis의 Langchain 통합을 활용하여 데이터베이스 애플리케이션을 확장하여 AI 기반 경험을 구축할 수 있습니다.

이 노트북에서는 `MemorystoreChatMessageHistory` 클래스를 사용하여 Google Cloud Memorystore for Redis에 채팅 메시지 기록을 저장하는 방법을 살펴봅니다.

[GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/)에서 패키지에 대해 자세히 알아보세요.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/chat_message_history.ipynb)

## 시작하기 전에

이 노트북을 실행하려면 다음을 수행해야 합니다:

* [Google Cloud 프로젝트 생성](https://developers.google.com/workspace/guides/create-project)
* [Memorystore for Redis API 활성화](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [Memorystore for Redis 인스턴스 생성](https://cloud.google.com/memorystore/docs/redis/create-instance-console). 버전이 5.0 이상인지 확인하세요.

이 노트북의 런타임 환경에서 데이터베이스에 대한 액세스가 확인되면 다음 값을 입력하고 예제 스크립트를 실행하기 전에 셀을 실행하세요.

```python
# @markdown Please specify an endpoint associated with the instance or demo purpose.
ENDPOINT = "redis://127.0.0.1:6379"  # @param {type:"string"}
```

### 🦜🔗 라이브러리 설치

통합은 `langchain-google-memorystore-redis` 패키지에 있으므로 이를 설치해야 합니다.

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis
```

**Colab 전용:** 다음 셀의 주석을 해제하거나 버튼을 사용하여 커널을 다시 시작하세요. Vertex AI Workbench의 경우 상단의 버튼을 사용하여 터미널을 다시 시작할 수 있습니다.

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

* Colab을 사용하여 이 노트북을 실행하는 경우 아래 셀을 사용하고 계속하세요.
* Vertex AI Workbench를 사용하는 경우 [여기](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env)의 설정 지침을 확인하세요.

```python
from google.colab import auth

auth.authenticate_user()
```

## 기본 사용법

### MemorystoreChatMessageHistory

`MemorystoreMessageHistory` 클래스를 초기화하려면 다음 2가지만 제공하면 됩니다:

1. `redis_client` - Memorystore Redis의 인스턴스.
1. `session_id` - 각 채팅 메시지 기록 객체에는 고유한 세션 ID가 있어야 합니다. 세션 ID에 이미 Redis에 저장된 메시지가 있는 경우 이를 검색할 수 있습니다.

```python
import redis
from langchain_google_memorystore_redis import MemorystoreChatMessageHistory

# Connect to a Memorystore for Redis instance
redis_client = redis.from_url("redis://127.0.0.1:6379")

message_history = MemorystoreChatMessageHistory(redis_client, session_id="session1")
```

```python
message_history.messages
```

#### 정리

특정 세션의 기록이 더 이상 필요하지 않고 삭제할 수 있는 경우 다음과 같이 수행할 수 있습니다.

**참고:** 삭제되면 데이터가 Memorystore for Redis에 더 이상 저장되지 않으며 영구적으로 삭제됩니다.

```python
message_history.clear()
```
