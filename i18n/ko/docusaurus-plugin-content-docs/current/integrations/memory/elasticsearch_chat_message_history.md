---
translated: true
---

# Elasticsearch

>[Elasticsearch](https://www.elastic.co/elasticsearch/)는 벡터 검색과 어휘 검색을 모두 수행할 수 있는 분산 RESTful 검색 및 분석 엔진으로, Apache Lucene 라이브러리 위에 구축되어 있습니다.

이 노트북은 `Elasticsearch`를 사용하여 채팅 메시지 기록 기능을 사용하는 방법을 보여줍니다.

## Elasticsearch 설정

Elasticsearch 인스턴스를 설정하는 두 가지 주요 방법은 다음과 같습니다:

1. **Elastic Cloud.** Elastic Cloud는 관리되는 Elasticsearch 서비스입니다. [무료 체험](https://cloud.elastic.co/registration?storm=langchain-notebook)에 등록하세요.

2. **로컬 Elasticsearch 설치.** Elasticsearch를 로컬에서 실행하여 시작할 수 있습니다. 가장 쉬운 방법은 공식 Elasticsearch Docker 이미지를 사용하는 것입니다. 자세한 내용은 [Elasticsearch Docker 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)를 참조하세요.

## 종속성 설치

```python
%pip install --upgrade --quiet  elasticsearch langchain
```

## 인증

### "elastic" 사용자의 비밀번호 얻는 방법

Elastic Cloud의 기본 "elastic" 사용자 비밀번호를 얻는 방법:
1. [Elastic Cloud 콘솔](https://cloud.elastic.co)에 로그인합니다.
2. "Security" > "Users"로 이동합니다.
3. "elastic" 사용자를 찾아 "Edit"를 클릭합니다.
4. "Reset password"를 클릭합니다.
5. 비밀번호 재설정 지침을 따릅니다.

### 사용자 이름/비밀번호 사용

```python
es_username = os.environ.get("ES_USERNAME", "elastic")
es_password = os.environ.get("ES_PASSWORD", "change me...")

history = ElasticsearchChatMessageHistory(
    es_url=es_url,
    es_user=es_username,
    es_password=es_password,
    index="test-history",
    session_id="test-session"
)
```

### API 키 얻는 방법

API 키를 얻는 방법:
1. [Elastic Cloud 콘솔](https://cloud.elastic.co)에 로그인합니다.
2. `Kibana`를 열고 Stack Management > API Keys로 이동합니다.
3. "Create API key"를 클릭합니다.
4. API 키의 이름을 입력하고 "Create"를 클릭합니다.

### API 키 사용

```python
es_api_key = os.environ.get("ES_API_KEY")

history = ElasticsearchChatMessageHistory(
    es_api_key=es_api_key,
    index="test-history",
    session_id="test-session"
)
```

## Elasticsearch 클라이언트 및 채팅 메시지 기록 초기화

```python
import os

from langchain_community.chat_message_histories import (
    ElasticsearchChatMessageHistory,
)

es_url = os.environ.get("ES_URL", "http://localhost:9200")

# If using Elastic Cloud:
# es_cloud_id = os.environ.get("ES_CLOUD_ID")

# Note: see Authentication section for various authentication methods

history = ElasticsearchChatMessageHistory(
    es_url=es_url, index="test-history", session_id="test-session"
)
```

## 채팅 메시지 기록 사용

```python
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```output
indexing message content='hi!' additional_kwargs={} example=False
indexing message content='whats up?' additional_kwargs={} example=False
```
