---
translated: true
---

# Slack

이 노트북은 Slack 채팅 로더를 사용하는 방법을 보여줍니다. 이 클래스는 내보낸 Slack 대화를 LangChain 채팅 메시지로 매핑하는 데 도움이 됩니다.

프로세스는 세 단계로 구성됩니다:

1. [여기](https://slack.com/help/articles/1500001548241-Request-to-export-all-conversations)에 따라 원하는 대화 스레드를 내보냅니다.
2. `SlackChatLoader`를 json 파일 또는 JSON 파일 디렉토리에 지정하여 생성합니다.
3. `loader.load()` (또는 `loader.lazy_load()`)를 호출하여 변환을 수행합니다. 선택적으로 `merge_chat_runs`를 사용하여 동일한 발신자의 메시지를 연속으로 병합하거나, `map_ai_messages`를 사용하여 지정된 발신자의 메시지를 "AIMessage" 클래스로 변환할 수 있습니다.

## 1. 메시지 덤프 생성

현재 (2023/08/23) 이 로더는 Slack에서 내보낸 직접 메시지 대화 형식의 zip 디렉토리에 가장 잘 맞습니다. Slack의 최신 지침을 따라 내보내기를 수행하십시오.

LangChain 저장소에 예제가 있습니다.

```python
import requests

permalink = "https://raw.githubusercontent.com/langchain-ai/langchain/342087bdfa3ac31d622385d0f2d09cf5e06c8db3/libs/langchain/tests/integration_tests/examples/slack_export.zip"
response = requests.get(permalink)
with open("slack_dump.zip", "wb") as f:
    f.write(response.content)
```

## 2. 채팅 로더 생성

로더에 zip 디렉토리의 파일 경로를 제공합니다. AI 메시지로 매핑할 사용자 ID를 선택적으로 지정하거나, 메시지 실행을 병합할지 여부를 구성할 수 있습니다.

```python
from langchain_community.chat_loaders.slack import SlackChatLoader
```

```python
loader = SlackChatLoader(
    path="slack_dump.zip",
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
# "U0500003428"의 메시지를 AI 메시지로 변환

messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="U0500003428")
)
```

### 다음 단계

이 메시지를 사용하여 모델을 미세 조정하거나, 몇 가지 샷 예제를 선택하거나, 다음 메시지에 대해 직접 예측을 수행할 수 있습니다.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[1]["messages"]):
    print(chunk.content, end="", flush=True)
```

```output
Hi,

I hope you're doing well. I wanted to reach out and ask if you'd be available to meet up for coffee sometime next week. I'd love to catch up and hear about what's been going on in your life. Let me know if you're interested and we can find a time that works for both of us.

Looking forward to hearing from you!

Best, [Your Name]
```