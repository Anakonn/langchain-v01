---
translated: true
---

यह नोटबुक स्लैक चैट लोडर का उपयोग करने का प्रदर्शन करता है। यह वर्ग निर्यात किए गए स्लैक वार्तालाप को LangChain चैट संदेशों में मैप करने में मदद करता है।

प्रक्रिया में तीन चरण हैं:
1. [यहाँ](https://slack.com/help/articles/1500001548241-Request-to-export-all-conversations) दिए गए निर्देशों का पालन करके इच्छित वार्तालाप धागे को निर्यात करें।
2. `SlackChatLoader` को JSON फ़ाइल या JSON फ़ाइलों के निर्देशिका के पथ के साथ बनाएं
3. `loader.load()` (या `loader.lazy_load()`) को कॉल करके रूपांतरण करें। वैकल्पिक रूप से `merge_chat_runs` का उपयोग करें ताकि एक ही भेजने वाले से संदेशों को क्रम में जोड़ा जा सके, और/या `map_ai_messages` का उपयोग करें ताकि निर्दिष्ट भेजने वाले से संदेशों को "AIMessage" वर्ग में परिवर्तित किया जा सके।

## 1. संदेश डंप बनाएं

वर्तमान में (2023/08/23) यह लोडर स्लैक से सीधे संदेश वार्तालाप को निर्यात करने द्वारा उत्पन्न फ़ाइल प्रारूप का सबसे अच्छा समर्थन करता है। स्लैक से इसे कैसे करना है, इसके लिए नवीनतम निर्देशों का पालन करें।

हमारे पास LangChain रेपो में एक उदाहरण है।

```python
import requests

permalink = "https://raw.githubusercontent.com/langchain-ai/langchain/342087bdfa3ac31d622385d0f2d09cf5e06c8db3/libs/langchain/tests/integration_tests/examples/slack_export.zip"
response = requests.get(permalink)
with open("slack_dump.zip", "wb") as f:
    f.write(response.content)
```

## 2. चैट लोडर बनाएं

फ़ाइल पथ को जिप निर्देशिका के साथ लोडर प्रदान करें। आप वैकल्पिक रूप से एआई संदेश को मैप करने वाले उपयोगकर्ता आईडी और संदेश रन को मर्ज करने के लिए कॉन्फ़िगर कर सकते हैं।

```python
from langchain_community.chat_loaders.slack import SlackChatLoader
```

```python
loader = SlackChatLoader(
    path="slack_dump.zip",
)
```

## 3. संदेश लोड करें

`load()` (या `lazy_load`) विधियां "ChatSessions" की एक सूची लौटाती हैं जो वर्तमान में केवल लोड किए गए वार्तालाप के प्रति संदेश की एक सूची रखती हैं।

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
# Convert messages from "U0500003428" to AI messages
messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="U0500003428")
)
```

### अगले कदम

आप इन संदेशों का उपयोग अपने अनुसार कर सकते हैं, जैसे मॉडल को फ़ाइन-ट्यून करना, कुछ उदाहरण चयन करना, या सीधे अगले संदेश के लिए भविष्यवाणी करना।

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
