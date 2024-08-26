---
translated: true
---

# Telegram

이 노트북은 Telegram 채팅 로더를 사용하는 방법을 보여줍니다. 이 클래스는 내보낸 Telegram 대화를 LangChain 채팅 메시지로 매핑하는 데 도움이 됩니다.

프로세스는 세 단계로 구성됩니다:

1. Telegram 앱에서 채팅을 복사하여 로컬 컴퓨터의 파일에 붙여넣어 .txt 파일을 내보냅니다.
2. `TelegramChatLoader`를 json 파일 또는 JSON 파일 디렉토리에 지정하여 생성합니다.
3. `loader.load()` (또는 `loader.lazy_load()`)를 호출하여 변환을 수행합니다. 선택적으로 `merge_chat_runs`를 사용하여 동일한 발신자의 메시지를 연속으로 병합하거나, `map_ai_messages`를 사용하여 지정된 발신자의 메시지를 "AIMessage" 클래스로 변환할 수 있습니다.

## 1. 메시지 덤프 생성

현재 (2023/08/23) 이 로더는 [Telegram Desktop App](https://desktop.telegram.org/)에서 내보낸 채팅 기록 형식의 json 파일을 가장 잘 지원합니다.

**중요:** "Telegram for MacOS"와 같은 '라이트' 버전의 Telegram은 내보내기 기능이 없으므로, 올바른 앱을 사용하여 파일을 내보내는지 확인하세요.

내보내기 방법:

1. Telegram Desktop을 다운로드하고 엽니다.
2. 대화를 선택합니다.
3. 대화 설정으로 이동합니다 (현재 오른쪽 상단의 세 점).
4. "채팅 기록 내보내기"를 클릭합니다.
5. 사진 및 기타 미디어 선택을 해제하고, "기계 판독 가능 JSON" 형식을 선택하여 내보냅니다.

아래는 예제입니다:

```python
%%writefile telegram_conversation.json
{
 "name": "Jiminy",
 "type": "personal_chat",
 "id": 5965280513,
 "messages": [
  {
   "id": 1,
   "type": "message",
   "date": "2023-08-23T13:11:23",
   "date_unixtime": "1692821483",
   "from": "Jiminy Cricket",
   "from_id": "user123450513",
   "text": "You better trust your conscience",
   "text_entities": [
    {
     "type": "plain",
     "text": "You better trust your conscience"
    }
   ]
  },
  {
   "id": 2,
   "type": "message",
   "date": "2023-08-23T13:13:20",
   "date_unixtime": "1692821600",
   "from": "Batman & Robin",
   "from_id": "user6565661032",
   "text": "What did you just say?",
   "text_entities": [
    {
     "type": "plain",
     "text": "What did you just say?"
    }
   ]
  }
 ]
}
```

```output
Overwriting telegram_conversation.json
```

## 2. 채팅 로더 생성

파일 경로만 제공하면 됩니다. 선택적으로 AI 메시지로 매핑할 사용자 이름을 지정하거나, 메시지 실행을 병합할지 여부를 구성할 수 있습니다.

```python
from langchain_community.chat_loaders.telegram import TelegramChatLoader
```

```python
loader = TelegramChatLoader(
    path="./telegram_conversation.json",
)
```

## 3. 메시지 로드

`load()` (또는 `lazy_load`) 메서드는 현재 로드된 대화당 메시지 목록만 포함하는 "ChatSessions" 목록을 반환합니다.

```python
from typing import List

from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
from langchain_core.chat_sessions import ChatSession

raw_messages = loader.lazy_load()
# 동일한 발신자의 연속 메시지를 하나의 메시지로 병합

merged_messages = merge_chat_runs(raw_messages)
# "Jiminy Cricket"의 메시지를 AI 메시지로 변환

messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="Jiminy Cricket")
)
```

### 다음 단계

이 메시지를 사용하여 모델을 미세 조정하거나, 몇 가지 샷 예제를 선택하거나, 다음 메시지에 대해 직접 예측을 수행할 수 있습니다.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```

```output
I said, "You better trust your conscience."
```