---
translated: true
---

# व्हाट्सएप

यह नोटबुक व्हाट्सएप चैट लोडर का उपयोग करने का तरीका दिखाता है। यह वर्ग निर्यात किए गए व्हाट्सएप वार्तालापों को LangChain चैट संदेशों में मैप करने में मदद करता है।

प्रक्रिया में तीन चरण हैं:
1. चैट वार्तालापों को कंप्यूटर पर निर्यात करें
2. `WhatsAppChatLoader` को json फ़ाइल या JSON फ़ाइलों के निर्देशिका के पथ के साथ बनाएं
3. रूपांतरण करने के लिए `loader.load()` (या `loader.lazy_load()`) कॉल करें।

## 1. संदेश डंप बनाएं

अपने व्हाट्सएप वार्तालाप(ों) का निर्यात करने के लिए, निम्नलिखित चरणों को पूरा करें:

1. लक्षित वार्तालाप खोलें
2. ऊपर दाईं ओर तीन बिंदु पर क्लिक करें और "और" का चयन करें।
3. फिर "चैट निर्यात करें" का चयन करें और "मीडिया के बिना" चुनें।

प्रत्येक वार्तालाप के लिए डेटा प्रारूप का एक उदाहरण नीचे दिया गया है:

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

## 2. चैट लोडर बनाएं

व्हाट्सएप चैट लोडर परिणामी ज़िप फ़ाइल, अनज़िप किए गए निर्देशिका, या उनमें से किसी भी चैट `.txt` फ़ाइलों के पथ को स्वीकार करता है।

उस के साथ-साथ उस उपयोगकर्ता नाम को भी प्रदान करें जिसे आप "एआई" की भूमिका में लेना चाहते हैं जब फ़ाइन-ट्यूनिंग करते हैं।

```python
from langchain_community.chat_loaders.whatsapp import WhatsAppChatLoader
```

```python
loader = WhatsAppChatLoader(
    path="./whatsapp_chat.txt",
)
```

## 3. संदेश लोड करें

`load()` (या `lazy_load`) विधियां "ChatSessions" की एक सूची लौटाती हैं जो वर्तमान में प्रत्येक लोड किए गए वार्तालाप के संदेशों की सूची को संग्रहीत करती हैं।

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
# Convert messages from "Dr. Feather" to AI messages
messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="Dr. Feather")
)
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

### अगले कदम

आप इन संदेशों का उपयोग अपने अनुसार कर सकते हैं, जैसे कि मॉडल का फ़ाइन-ट्यूनिंग, कुछ उदाहरण चयन, या सीधे अगले संदेश के लिए भविष्यवाणी करना।

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```

```output
Thank you for the encouragement! I'll do my best to continue studying and sharing fascinating insights about parrot communication.
```
