---
translated: true
---

# WeChat

व्यक्तिगत WeChat संदेशों को निर्यात करने का एक सीधा तरीका अभी तक नहीं है। हालांकि, यदि आपको मॉडल फाइन-ट्यूनिंग या कुछ उदाहरण के लिए केवल कुछ सैकड़ों संदेशों की आवश्यकता है, तो यह नोटबुक दिखाता है कि WeChat संदेशों को एक सूची में LangChain संदेशों में कैसे बदला जा सकता है।

> https://python.langchain.com/docs/integrations/chat_loaders/discord से काफी प्रेरित

प्रक्रिया में पांच चरण हैं:
1. WeChat डेस्कटॉप ऐप में अपने चैट खोलें। माउस-ड्रैग या राइट-क्लिक से आवश्यक संदेशों का चयन करें। प्रतिबंधों के कारण, आप एक बार में 100 संदेशों तक का चयन कर सकते हैं। `CMD`/`Ctrl` + `C` कॉपी करने के लिए।
2. चयनित संदेशों को अपने स्थानीय कंप्यूटर पर एक फ़ाइल में पेस्ट करके चैट .txt फ़ाइल बनाएं।
3. नीचे दिए गए चैट लोडर परिभाषा को एक स्थानीय फ़ाइल में कॉपी करें।
4. टेक्स्ट फ़ाइल की पथ का उपयोग करके `WeChatChatLoader` को इनिशियलाइज़ करें।
5. रूपांतरण करने के लिए `loader.load()` (या `loader.lazy_load()`) कॉल करें।

## 1. संदेश डंप बनाएं

यह लोडर केवल ऐप में संदेशों को क्लिपबोर्ड पर कॉपी करके और एक फ़ाइल में पेस्ट करके जनरेट की गई .txt फ़ाइलों का समर्थन करता है। नीचे एक उदाहरण है।

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

## 2. चैट लोडर परिभाषित करें

LangChain वर्तमान में

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

## 2. लोडर बनाएं

हम उस फ़ाइल की ओर इशारा करेंगे जिसे हमने अभी डिस्क पर लिखा है।

```python
loader = WeChatChatLoader(
    path="./wechat_chats.txt",
)
```

## 3. संदेश लोड करें

यदि स्वरूप सही है, तो लोडर चैट को langchain संदेशों में रूपांतरित करेगा।

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

### अगले कदम

आप इन संदेशों का उपयोग अपने अनुसार कर सकते हैं, जैसे मॉडल का फाइन-ट्यूनिंग, कुछ उदाहरण का चयन या सीधे अगले संदेश के लिए भविष्यवाणी करना।

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```
