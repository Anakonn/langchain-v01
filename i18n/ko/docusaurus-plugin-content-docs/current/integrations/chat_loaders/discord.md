---
translated: true
---

# Discord

이 노트북은 복사하여 붙여넣은 메시지(개인 메시지)를 LangChain 메시지 목록으로 변환하는 Discord 채팅 로더를 만드는 방법을 설명합니다.

이 과정은 네 단계로 구성됩니다:

1. Discord 앱에서 채팅을 복사하여 로컬 컴퓨터의 파일에 붙여넣어 채팅 .txt 파일을 생성합니다.
2. 아래의 채팅 로더 정의를 로컬 파일에 복사합니다.
3. 텍스트 파일 경로를 가리키도록 `DiscordChatLoader`를 초기화합니다.
4. `loader.load()`(또는 `loader.lazy_load()`)를 호출하여 변환을 수행합니다.

## 1. 메시지 덤프 생성

현재(2023/08/23) 이 로더는 클립보드에 메시지를 복사하여 파일에 붙여넣어 생성된 .txt 파일 형식만 지원합니다. 아래는 예시입니다.

```python
%%writefile discord_chats.txt
talkingtower — 08/15/2023 11:10 AM
Love music! Do you like jazz?
reporterbob — 08/15/2023 9:27 PM
Yes! Jazz is fantastic. Ever heard this one?
Website
Listen to classic jazz track...

talkingtower — Yesterday at 5:03 AM
Indeed! Great choice. 🎷
reporterbob — Yesterday at 5:23 AM
Thanks! How about some virtual sightseeing?
Website
Virtual tour of famous landmarks...

talkingtower — Today at 2:38 PM
Sounds fun! Let's explore.
reporterbob — Today at 2:56 PM
Enjoy the tour! See you around.
talkingtower — Today at 3:00 PM
Thank you! Goodbye! 👋
reporterbob — Today at 3:02 PM
Farewell! Happy exploring.
```

```output
Writing discord_chats.txt
```

## 2. 채팅 로더 정의

```python
import logging
import re
from typing import Iterator, List

from langchain_community.chat_loaders import base as chat_loaders
from langchain_core.messages import BaseMessage, HumanMessage

logger = logging.getLogger()

class DiscordChatLoader(chat_loaders.BaseChatLoader):
    def __init__(self, path: str):
        """
        Initialize the Discord chat loader.

        Args:
            path: Path to the exported Discord chat text file.
        """
        self.path = path
        self._message_line_regex = re.compile(
            r"(.+?) — (\w{3,9} \d{1,2}(?:st|nd|rd|th)?(?:, \d{4})? \d{1,2}:\d{2} (?:AM|PM)|Today at \d{1,2}:\d{2} (?:AM|PM)|Yesterday at \d{1,2}:\d{2} (?:AM|PM))",  # noqa
            flags=re.DOTALL,
        )

    def _load_single_chat_session_from_txt(
        self, file_path: str
    ) -> chat_loaders.ChatSession:
        """
        Load a single chat session from a text file.

        Args:
            file_path: Path to the text file containing the chat messages.

        Returns:
            A `ChatSession` object containing the loaded chat messages.
        """
        with open(file_path, "r", encoding="utf-8") as file:
            lines = file.readlines()

        results: List[BaseMessage] = []
        current_sender = None
        current_timestamp = None
        current_content = []
        for line in lines:
            if re.match(
                r".+? — (\d{2}/\d{2}/\d{4} \d{1,2}:\d{2} (?:AM|PM)|Today at \d{1,2}:\d{2} (?:AM|PM)|Yesterday at \d{1,2}:\d{2} (?:AM|PM))",  # noqa
                line,
            ):
                if current_sender and current_content:
                    results.append(
                        HumanMessage(
                            content="".join(current_content).strip(),
                            additional_kwargs={
                                "sender": current_sender,
                                "events": [{"message_time": current_timestamp}],
                            },
                        )
                    )
                current_sender, current_timestamp = line.split(" — ")[:2]
                current_content = [
                    line[len(current_sender) + len(current_timestamp) + 4 :].strip()
                ]
            elif re.match(r"\[\d{1,2}:\d{2} (?:AM|PM)\]", line.strip()):
                results.append(
                    HumanMessage(
                        content="".join(current_content).strip(),
                        additional_kwargs={
                            "sender": current_sender,
                            "events": [{"message_time": current_timestamp}],
                        },
                    )
                )
                current_timestamp = line.strip()[1:-1]
                current_content = []
            else:
                current_content.append("\n" + line.strip())

        if current_sender and current_content:
            results.append(
                HumanMessage(
                    content="".join(current_content).strip(),
                    additional_kwargs={
                        "sender": current_sender,
                        "events": [{"message_time": current_timestamp}],
                    },
                )
            )

        return chat_loaders.ChatSession(messages=results)

    def lazy_load(self) -> Iterator[chat_loaders.ChatSession]:
        """
        Lazy load the messages from the chat file and yield them in the required format.

        Yields:
            A `ChatSession` object containing the loaded chat messages.
        """
        yield self._load_single_chat_session_from_txt(self.path)
```

## 2. 로더 생성

우리는 방금 디스크에 작성한 파일을 가리킵니다.

```python
loader = DiscordChatLoader(
    path="./discord_chats.txt",
)
```

## 3. 메시지 로드

형식이 올바른 경우 로더가 채팅을 langchain 메시지로 변환합니다.

```python
from typing import List

from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
from langchain_core.chat_sessions import ChatSession

raw_messages = loader.lazy_load()
# 동일한 발신자로부터 연속된 메시지를 단일 메시지로 병합

merged_messages = merge_chat_runs(raw_messages)
# "talkingtower"의 메시지를 AI 메시지로 변환

messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="talkingtower")
)
```

```python
messages
```

```output
[{'messages': [AIMessage(content='Love music! Do you like jazz?', additional_kwargs={'sender': 'talkingtower', 'events': [{'message_time': '08/15/2023 11:10 AM\n'}]}),
   HumanMessage(content='Yes! Jazz is fantastic. Ever heard this one?\nWebsite\nListen to classic jazz track...', additional_kwargs={'sender': 'reporterbob', 'events': [{'message_time': '08/15/2023 9:27 PM\n'}]}),
   AIMessage(content='Indeed! Great choice. 🎷', additional_kwargs={'sender': 'talkingtower', 'events': [{'message_time': 'Yesterday at 5:03 AM\n'}]}),
   HumanMessage(content='Thanks! How about some virtual sightseeing?\nWebsite\nVirtual tour of famous landmarks...', additional_kwargs={'sender': 'reporterbob', 'events': [{'message_time': 'Yesterday at 5:23 AM\n'}]}),
   AIMessage(content="Sounds fun! Let's explore.", additional_kwargs={'sender': 'talkingtower', 'events': [{'message_time': 'Today at 2:38 PM\n'}]}),
   HumanMessage(content='Enjoy the tour! See you around.', additional_kwargs={'sender': 'reporterbob', 'events': [{'message_time': 'Today at 2:56 PM\n'}]}),
   AIMessage(content='Thank you! Goodbye! 👋', additional_kwargs={'sender': 'talkingtower', 'events': [{'message_time': 'Today at 3:00 PM\n'}]}),
   HumanMessage(content='Farewell! Happy exploring.', additional_kwargs={'sender': 'reporterbob', 'events': [{'message_time': 'Today at 3:02 PM\n'}]})]}]
```

### 다음 단계

그런 다음 이러한 메시지를 모델의 미세 조정, 몇 샷 예제 선택 또는 다음 메시지 예측 등에 사용할 수 있습니다.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```

```output
Thank you! Have a great day!
```