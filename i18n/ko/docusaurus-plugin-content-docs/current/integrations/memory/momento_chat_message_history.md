---
translated: true
---

# 모멘토 캐시

>[모멘토 캐시](https://docs.momentohq.com/)는 세계 최초의 진정한 서버리스 캐싱 서비스입니다. 즉각적인 탄력성, 스케일 투 제로 기능, 그리고 빠른 성능을 제공합니다.

이 노트북은 `MomentoChatMessageHistory` 클래스를 사용하여 채팅 메시지 기록을 저장하는 방법을 설명합니다. 모멘토 [문서](https://docs.momentohq.com/getting-started)에서 모멘토 설정 방법에 대한 자세한 내용을 확인할 수 있습니다.

기본적으로 지정된 이름의 캐시가 없는 경우 새로 생성합니다.

이 클래스를 사용하려면 모멘토 API 키가 필요합니다. 이는 `momento.CacheClient`를 직접 인스턴스화하려는 경우 전달할 수 있으며, `MomentoChatMessageHistory.from_client_params`에 `api_key` 매개변수로 전달하거나, `MOMENTO_API_KEY` 환경 변수로 설정할 수 있습니다.

```python
from datetime import timedelta

from langchain_community.chat_message_histories import MomentoChatMessageHistory

session_id = "foo"
cache_name = "langchain"
ttl = timedelta(days=1)
history = MomentoChatMessageHistory.from_client_params(
    session_id,
    cache_name,
    ttl,
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!', additional_kwargs={}, example=False),
 AIMessage(content='whats up?', additional_kwargs={}, example=False)]
```
