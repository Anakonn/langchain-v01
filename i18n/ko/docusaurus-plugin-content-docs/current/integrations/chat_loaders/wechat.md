---
translated: true
---

# WeChat

개인 WeChat 메시지를 직접 내보내는 간단한 방법은 아직 없습니다. 그러나 모델 미세 조정을 위해 몇 백 개의 메시지가 필요하거나 몇 샷 예제가 필요한 경우, 이 노트북은 LangChain 메시지 목록으로 복사된 WeChat 메시지에서 작동하는 자체 채팅 로더를 만드는 방법을 보여줍니다.

> https://python.langchain.com/docs/integrations/chat_loaders/discord에서 영감을 받았습니다.

이 과정은 다섯 단계로 구성됩니다:

1. WeChat 데스크탑 앱에서 채팅을 엽니다. 메시지를 마우스 드래그 또는 오른쪽 클릭으로 선택합니다. 제한으로 인해 한 번에 최대 100개의 메시지만 선택할 수 있습니다. `CMD`/`Ctrl` + `C`를 눌러 복사합니다.
2. 로컬 컴퓨터에 파일을 만들어 선택한 메시지를 붙여 넣어 채팅 .txt 파일을 만듭니다.
3. 아래의 채팅 로더 정의를 로컬 파일에 복사합니다.
4. `WeChatChatLoader`를 초기화하여 텍스트 파일 경로를 지정합니다.
5. `loader.load()` (또는 `loader.lazy_load()`)를 호출하여 변환을 수행합니다.

## 1. 메시지 덤프 생성

이 로더는 앱에서 클립보드로 메시지를 복사하고 파일에 붙여 넣어 생성된 .txt 파일만 지원합니다. 아래는 예시입니다.

```python
%%writefile wechat_chats.txt
女朋友 2023/09/16 2:51 PM
天气有点凉

男朋友 2023/09/16 2:51 PM
珍簟凉风著，瑶琴寄恨生。嵇君懒书札，底物慰秋情。

女朋友 2023/09/16 3:06 PM
忙什么呢

男朋友 2023/09/16 3:06 PM
今天只干成了一件像样的事
那就是想你

女朋友 2023/09/16 3:06 PM
[动画表情]
```

```output
Overwriting wechat_chats.txt
```

## 2. 채팅 로더 정의

LangChain은 현재 이 기능을 지원하지 않습니다.

```python
import logging
import re
from typing import Iterator, List

from langchain_community.chat_loaders import base as chat_loaders
from langchain_core.messages import BaseMessage, HumanMessage

logger = logging.getLogger()


class WeChatChatLoader(chat_loaders.BaseChatLoader):
    def __init__(self, path: str):
        """
        Initialize the Discord chat loader.

        Args:
            path: Path to the exported Discord chat text file.
        """
        self.path = path
        self._message_line_regex = re.compile(
            r"(?P<sender>.+?) (?P<timestamp>\d{4}/\d{2}/\d{2} \d{1,2}:\d{2} (?:AM|PM))",  # noqa
            # flags=re.DOTALL,
        )

    def _append_message_to_results(
        self,
        results: List,
        current_sender: str,
        current_timestamp: str,
        current_content: List[str],
    ):
        content = "\n".join(current_content).strip()
        # 스티커, 이미지 등 텍스트가 아닌 메시지는 건너뜁니다.
        if not re.match(r"\[.*\]", content):
            results.append(
                HumanMessage(
                    content=content,
                    additional_kwargs={
                        "sender": current_sender,
                        "events": [{"message_time": current_timestamp}],
                    },
                )
            )
        return results

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
            if re.match(self._message_line_regex, line):
                if current_sender and current_content:
                    results = self._append_message_to_results(
                        results, current_sender, current_timestamp, current_content
                    )
                current_sender, current_timestamp = re.match(
                    self._message_line_regex, line
                ).groups()
                current_content = []
            else:
                current_content.append(line.strip())

        if current_sender and current_content:
            results = self._append_message_to_results(
                results, current_sender, current_timestamp, current_content
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

방금 디스크에 저장한 파일을 가리키도록 합니다.

```python
loader = WeChatChatLoader(
    path="./wechat_chats.txt",
)
```

## 3. 메시지 로드

형식이 올바르면 로더가 채팅을 langchain 메시지로 변환합니다.

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
# "男朋友"의 메시지를 AI 메시지로 변환합니다.

messages: List[ChatSession] = list(map_ai_messages(merged_messages, sender="男朋友"))
```

```python
messages
```

```output
[{'messages': [HumanMessage(content='天气有点凉', additional_kwargs={'sender': '女朋友', 'events': [{'message_time': '2023/09/16 2:51 PM'}]}, example=False),
   AIMessage(content='珍簟凉风著，瑶琴寄恨生。嵇君懒书札，底物慰秋情。', additional_kwargs={'sender': '男朋友', 'events': [{'message_time': '2023/09/16 2:51 PM'}]}, example=False),
   HumanMessage(content='忙什么呢', additional_kwargs={'sender': '女朋友', 'events': [{'message_time': '2023/09/16 3:06 PM'}]}, example=False),
   AIMessage(content='今天只干成了一件像样的事\n那就是想你', additional_kwargs={'sender': '男朋友', 'events': [{'message_time': '2023/09/16 3:06 PM'}]}, example=False)]}]
```

### 다음 단계

그런 다음 이러한 메시지를 필요에 맞게 사용할 수 있습니다. 예를 들어 모델을 미세 조정하거나, 몇 샷 예제를 선택하거나, 다음 메시지에 대해 직접 예측할 수 있습니다.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```