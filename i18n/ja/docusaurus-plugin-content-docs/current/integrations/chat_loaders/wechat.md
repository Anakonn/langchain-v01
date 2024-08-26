---
translated: true
---

# WeChat

WeChat を個人的にエクスポートする簡単な方法はまだありません。ただし、モデルのファインチューニングや少数例の例として、200 件以下のメッセージが必要な場合は、このノートブックに示すように、コピー&ペーストした WeChat メッセージを LangChain メッセージのリストに変換するための独自のチャットローダーを作成することができます。

> https://python.langchain.com/docs/integrations/chat_loaders/discord に強く影響を受けています

このプロセスには 5 つのステップがあります:
1. WeChat デスクトップアプリでチャットを開きます。必要なメッセージを、マウスドラッグまたは右クリックで選択します。制限により、一度に 100 件のメッセージまでしか選択できません。`CMD`/`Ctrl` + `C` でコピーします。
2. 選択したメッセージをローカルコンピューターのファイルに貼り付けて、チャット .txt ファイルを作成します。
3. 以下のチャットローダー定義をローカルファイルにコピーします。
4. ファイルパスを指定して `WeChatChatLoader` を初期化します。
5. `loader.load()` (または `loader.lazy_load()`) を呼び出して、変換を実行します。

## 1. メッセージダンプの作成

このローダーは、アプリのクリップボードにコピーしてファイルに貼り付けた形式の .txt ファイルのみをサポートします。以下は例です。

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

## 2. チャットローダーの定義

LangChain は現在、

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
        # skip non-text messages like stickers, images, etc.
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

## 2. ローダーの作成

先ほど作成したファイルのパスを指定します。

```python
loader = WeChatChatLoader(
    path="./wechat_chats.txt",
)
```

## 3. メッセージのロード

フォーマットが正しければ、ローダーがチャットを LangChain メッセージに変換します。

```python
from typing import List

from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
from langchain_core.chat_sessions import ChatSession

raw_messages = loader.lazy_load()
# Merge consecutive messages from the same sender into a single message
merged_messages = merge_chat_runs(raw_messages)
# Convert messages from "男朋友" to AI messages
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

### 次のステップ

これらのメッセージは、モデルのファインチューニング、少数例の選択、または次のメッセージの直接予測など、さまざまな用途に使用できます。

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```
