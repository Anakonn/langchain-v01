---
translated: true
---

यह नोटबुक दिखाता है कि आप अपना स्वयं का चैट लोडर कैसे बना सकते हैं जो कॉपी-पेस्ट किए गए संदेशों (डीएमएस से) को LangChain संदेशों की सूची में काम करता है।

प्रक्रिया में चार चरण हैं:
1. डिस्कॉर्ड ऐप से चैट कॉपी करके और उन्हें अपने स्थानीय कंप्यूटर पर फ़ाइल में पेस्ट करके चैट .txt फ़ाइल बनाएं
2. नीचे दिए गए चैट लोडर परिभाषा को स्थानीय फ़ाइल में कॉपी करें।
3. `DiscordChatLoader` को टेक्स्ट फ़ाइल के पथ के साथ इनिशियलाइज़ करें।
4. रूपांतरण करने के लिए `loader.load()` (या `loader.lazy_load()`) कॉल करें।

## 1. संदेश डंप बनाएं

वर्तमान में (2023/08/23) यह लोडर केवल ऐप में संदेशों को क्लिपबोर्ड पर कॉपी करके और एक फ़ाइल में पेस्ट करके जनरेट की गई .txt फ़ाइलों का समर्थन करता है। नीचे एक उदाहरण दिया गया है।

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

## 2. चैट लोडर परिभाषित करें

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

## 2. लोडर बनाएं

हम उस फ़ाइल की ओर इशारा करेंगे जिसे हमने अभी डिस्क पर लिखा है।

```python
loader = DiscordChatLoader(
    path="./discord_chats.txt",
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
# Convert messages from "talkingtower" to AI messages
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

### अगले कदम

आप इन संदेशों का उपयोग अपने अनुसार कर सकते हैं, जैसे मॉडल को फ़ाइन-ट्यून करना, कुछ उदाहरण चुनना, या सीधे अगले संदेश के लिए भविष्यवाणी करना।

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```

```output
Thank you! Have a great day!
```
