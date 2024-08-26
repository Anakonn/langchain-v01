---
translated: true
---

यह नोटबुक टेलीग्राम चैट लोडर का उपयोग करने का तरीका दिखाता है। यह क्लास निर्यात किए गए टेलीग्राम वार्तालापों को LangChain चैट संदेशों में मैप करने में मदद करता है।

प्रक्रिया में तीन चरण हैं:
1. टेलीग्राम ऐप से चैट कॉपी करके और उन्हें अपने स्थानीय कंप्यूटर पर एक फ़ाइल में पेस्ट करके चैट .txt फ़ाइल निर्यात करें
2. `TelegramChatLoader` को json फ़ाइल या JSON फ़ाइलों के निर्देशिका के पथ के साथ बनाएं
3. `loader.load()` (या `loader.lazy_load()`) को कॉल करके रूपांतरण करें। वैकल्पिक रूप से `merge_chat_runs` का उपयोग करें ताकि एक ही भेजने वाले से संदेशों को क्रम में जोड़ा जा सके, और/या `map_ai_messages` का उपयोग करें ताकि निर्दिष्ट भेजने वाले के संदेशों को "AIMessage" वर्ग में परिवर्तित किया जा सके।

## 1. संदेश डंप बनाएं

वर्तमान में (2023/08/23) यह लोडर [टेलीग्राम डेस्कटॉप ऐप](https://desktop.telegram.org/) से अपने चैट इतिहास निर्यात करने से उत्पन्न होने वाले json फ़ाइलों के प्रारूप का सबसे अच्छा समर्थन करता है।

**महत्वपूर्ण:** टेलीग्राम के 'लाइट' संस्करण जैसे "टेलीग्राम फॉर मैकओएस" में निर्यात कार्यक्षमता नहीं होती है। कृपया सुनिश्चित करें कि आप सही ऐप का उपयोग कर रहे हैं।

निर्यात करने के लिए:
1. टेलीग्राम डेस्कटॉप डाउनलोड और खोलें
2. किसी वार्तालाप का चयन करें
3. वार्तालाप सेटिंग्स (वर्तमान में शीर्ष दाईं ओर के तीन बिंदु) पर नेविगेट करें
4. "चैट इतिहास निर्यात करें" पर क्लिक करें
5. फोटो और अन्य मीडिया को अनचेक करें। निर्यात करने के लिए "मशीन-पठनीय JSON" प्रारूप का चयन करें।

एक उदाहरण नीचे दिया गया है:

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

## 2. चैट लोडर बनाएं

केवल फ़ाइल पथ की आवश्यकता है। आप वैकल्पिक रूप से एक AI संदेश को मैप करने वाले उपयोगकर्ता नाम और संदेश रन को मर्ज करने के लिए कॉन्फ़िगर कर सकते हैं।

```python
from langchain_community.chat_loaders.telegram import TelegramChatLoader
```

```python
loader = TelegramChatLoader(
    path="./telegram_conversation.json",
)
```

## 3. संदेश लोड करें

`load()` (या `lazy_load`) विधियां "ChatSessions" की एक सूची लौटाती हैं जो वर्तमान में केवल लोड किए गए वार्तालाप के प्रति संदेशों की एक सूची रखती हैं।

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
# Convert messages from "Jiminy Cricket" to AI messages
messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="Jiminy Cricket")
)
```

### अगले कदम

आप इन संदेशों का उपयोग अपने अनुसार कर सकते हैं, जैसे मॉडल का फ़ाइन-ट्यूनिंग, कुछ उदाहरण का चयन या सीधे अगले संदेश के लिए भविष्यवाणी करना।

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```

```output
I said, "You better trust your conscience."
```
