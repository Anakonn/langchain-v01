---
translated: true
---

# Rockset

>[Rockset](https://rockset.com/product/)은 대규모 저지연 및 고동시성 분석 쿼리를 제공하는 실시간 분석 데이터베이스 서비스입니다. 구조화 및 반구조화 데이터에 대한 Converged Index™를 구축하고 벡터 임베딩을 위한 효율적인 저장소를 제공합니다. 스키마 없는 데이터에서 SQL을 실행할 수 있는 기능은 메타데이터 필터와 함께 벡터 검색을 실행하는 데 완벽한 선택이 됩니다.

이 노트북에서는 [Rockset](https://rockset.com/docs)을 사용하여 채팅 메시지 기록을 저장하는 방법을 살펴봅니다.

## 설정

```python
%pip install --upgrade --quiet  rockset
```

시작하려면 [Rockset 콘솔](https://console.rockset.com/apikeys)에서 API 키를 가져오세요. Rockset [API 참조](https://rockset.com/docs/rest-api#introduction)에서 API 리전을 찾으세요.

## 예시

```python
from langchain_community.chat_message_histories import (
    RocksetChatMessageHistory,
)
from rockset import Regions, RocksetClient

history = RocksetChatMessageHistory(
    session_id="MySession",
    client=RocksetClient(
        api_key="YOUR API KEY",
        host=Regions.usw2a1,  # us-west-2 Oregon
    ),
    collection="langchain_demo",
    sync=True,
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
print(history.messages)
```

출력은 다음과 같습니다:

```python
[
    HumanMessage(content='hi!', additional_kwargs={'id': '2e62f1c2-e9f7-465e-b551-49bae07fe9f0'}, example=False),
    AIMessage(content='whats up?', additional_kwargs={'id': 'b9be8eda-4c18-4cf8-81c3-e91e876927d0'}, example=False)
]

```
