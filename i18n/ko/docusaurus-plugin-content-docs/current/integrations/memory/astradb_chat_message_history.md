---
translated: true
---

# Astra DB

> DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html)는 Cassandra를 기반으로 하는 serverless vector-capable 데이터베이스로, 편리한 JSON API를 통해 제공됩니다.

이 노트북은 Astra DB를 사용하여 채팅 메시지 기록을 저장하는 방법을 설명합니다.

## 설정

이 노트북을 실행하려면 실행 중인 Astra DB가 필요합니다. Astra 대시보드에서 연결 비밀을 가져오세요:

- API Endpoint는 `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`과 같습니다.
- Token은 `AstraCS:6gBhNmsk135...`와 같습니다.

```python
%pip install --upgrade --quiet  "astrapy>=0.7.1"
```

### 데이터베이스 연결 매개변수와 비밀을 설정합니다.

```python
import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass.getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```output
ASTRA_DB_API_ENDPOINT =  https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN =  ········
```

로컬 또는 클라우드 기반 Astra DB에 따라 해당 데이터베이스 연결 "Session" 객체를 생성합니다.

## 예시

```python
from langchain_community.chat_message_histories import AstraDBChatMessageHistory

message_history = AstraDBChatMessageHistory(
    session_id="test-session",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
)

message_history.add_user_message("hi!")

message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```
