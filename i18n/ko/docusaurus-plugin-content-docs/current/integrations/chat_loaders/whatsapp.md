---
translated: true
---

# WhatsApp

이 노트북은 WhatsApp 채팅 로더를 사용하는 방법을 보여줍니다. 이 클래스는 내보낸 WhatsApp 대화를 LangChain 채팅 메시지로 매핑하는 데 도움이 됩니다.

이 과정은 세 단계로 구성됩니다:

1. 컴퓨터로 채팅 대화를 내보냅니다.
2. JSON 파일 또는 JSON 파일 디렉터리에 경로를 지정하여 `WhatsAppChatLoader`를 생성합니다.
3. `loader.load()` (또는 `loader.lazy_load()`)를 호출하여 변환을 수행합니다.

## 1. 메시지 덤프 생성

WhatsApp 대화를 내보내려면 다음 단계를 완료하십시오:

1. 대상 대화를 엽니다.
2. 오른쪽 상단의 세 점을 클릭하고 "더보기"를 선택합니다.
3. 그런 다음 "채팅 내보내기"를 선택하고 "미디어 없이"를 선택합니다.

아래는 각 대화의 데이터 형식 예시입니다:

```python
%%writefile whatsapp_chat.txt
[8/15/23, 9:12:33 AM] Dr. Feather: ‎Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
[8/15/23, 9:12:43 AM] Dr. Feather: I spotted a rare Hyacinth Macaw yesterday in the Amazon Rainforest. Such a magnificent creature!
‎[8/15/23, 9:12:48 AM] Dr. Feather: ‎image omitted
[8/15/23, 9:13:15 AM] Jungle Jane: That's stunning! Were you able to observe its behavior?
‎[8/15/23, 9:13:23 AM] Dr. Feather: ‎image omitted
[8/15/23, 9:14:02 AM] Dr. Feather: Yes, it seemed quite social with other macaws. They're known for their playful nature.
[8/15/23, 9:14:15 AM] Jungle Jane: How's the research going on parrot communication?
‎[8/15/23, 9:14:30 AM] Dr. Feather: ‎image omitted
[8/15/23, 9:14:50 AM] Dr. Feather: It's progressing well. We're learning so much about how they use sound and color to communicate.
[8/15/23, 9:15:10 AM] Jungle Jane: That's fascinating! Can't wait to read your paper on it.
[8/15/23, 9:15:20 AM] Dr. Feather: Thank you! I'll send you a draft soon.
[8/15/23, 9:25:16 PM] Jungle Jane: Looking forward to it! Keep up the great work.
```

```output
Writing whatsapp_chat.txt
```

## 2. 채팅 로더 생성

WhatsAppChatLoader는 결과 ZIP 파일, 압축이 풀린 디렉토리 또는 그 안의 채팅 `.txt` 파일 경로를 허용합니다.

이를 제공하고 미세 조정 시 "AI" 역할을 담당할 사용자 이름을 지정합니다.

```python
from langchain_community.chat_loaders.whatsapp import WhatsAppChatLoader
```

```python
loader = WhatsAppChatLoader(
    path="./whatsapp_chat.txt",
)
```

## 3. 메시지 로드

`load()` (또는 `lazy_load`) 메서드는 현재 로드된 대화당 메시지 목록을 저장하는 "ChatSessions" 목록을 반환합니다.

```python
from typing import List

from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
from langchain_core.chat_sessions import ChatSession

raw_messages = loader.lazy_load()
# 동일한 발신자의 연속 메시지를 하나의 메시지로 병합합니다.

merged_messages = merge_chat_runs(raw_messages)
# "Dr. Feather"의 메시지를 AI 메시지로 변환합니다.

messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="Dr. Feather")
)
```

```python
messages
```

```output
[{'messages': [AIMessage(content='I spotted a rare Hyacinth Macaw yesterday in the Amazon Rainforest. Such a magnificent creature!', additional_kwargs={'sender': 'Dr. Feather', 'events': [{'message_time': '8/15/23, 9:12:43 AM'}]}, example=False),
   HumanMessage(content="That's stunning! Were you able to observe its behavior?", additional_kwargs={'sender': 'Jungle Jane', 'events': [{'message_time': '8/15/23, 9:13:15 AM'}]}, example=False),
   AIMessage(content="Yes, it seemed quite social with other macaws. They're known for their playful nature.", additional_kwargs={'sender': 'Dr. Feather', 'events': [{'message_time': '8/15/23, 9:14:02 AM'}]}, example=False),
   HumanMessage(content="How's the research going on parrot communication?", additional_kwargs={'sender': 'Jungle Jane', 'events': [{'message_time': '8/15/23, 9:14:15 AM'}]}, example=False),
   AIMessage(content="It's progressing well. We're learning so much about how they use sound and color to communicate.", additional_kwargs={'sender': 'Dr. Feather', 'events': [{'message_time': '8/15/23, 9:14:50 AM'}]}, example=False),
   HumanMessage(content="That's fascinating! Can't wait to read your paper on it.", additional_kwargs={'sender': 'Jungle Jane', 'events': [{'message_time': '8/15/23, 9:15:10 AM'}]}, example=False),
   AIMessage(content="Thank you! I'll send you a draft soon.", additional_kwargs={'sender': 'Dr. Feather', 'events': [{'message_time': '8/15/23, 9:15:20 AM'}]}, example=False),
   HumanMessage(content='Looking forward to it! Keep up the great work.', additional_kwargs={'sender': 'Jungle Jane', 'events': [{'message_time': '8/15/23, 9:25:16 PM'}]}, example=False)]}]
```

### 다음 단계

그런 다음 이러한 메시지를 필요에 맞게 사용할 수 있습니다. 예를 들어 모델을 미세 조정하거나, 몇 샷 예제를 선택하거나, 다음 메시지에 대해 직접 예측할 수 있습니다.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```

```output
Thank you for the encouragement! I'll do my best to continue studying and sharing fascinating insights about parrot communication.
```