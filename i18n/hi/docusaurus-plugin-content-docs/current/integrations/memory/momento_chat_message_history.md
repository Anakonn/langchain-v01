---
translated: true
---

# मोमेंटो कैश

>[मोमेंटो कैश](https://docs.momentohq.com/) दुनिया का पहला वास्तविक रूप से सर्वरलेस कैशिंग सेवा है। यह तत्काल लचीलापन, शून्य तक पैमाना करने की क्षमता और तेज़ प्रदर्शन प्रदान करता है।

यह नोटबुक [मोमेंटो कैश](https://www.gomomento.com/services/cache) का उपयोग करके चैट संदेश इतिहास को संग्रहीत करने के लिए `MomentoChatMessageHistory` क्लास का उपयोग करने के बारे में बताता है। मोमेंटो [दस्तावेज़](https://docs.momentohq.com/getting-started) में अधिक जानकारी के लिए देखें कि कैसे मोमेंटो के साथ सेट अप किया जाए।

ध्यान दें कि, डिफ़ॉल्ट रूप से हम एक कैश बनाएंगे अगर दिए गए नाम के साथ कोई मौजूद नहीं है।

आपको मोमेंटो API कुंजी प्राप्त करने की आवश्यकता होगी ताकि आप इस क्लास का उपयोग कर सकें। यह या तो `momento.CacheClient` में पारित किया जा सकता है अगर आप उसे सीधे इंस्टैंशिएट करना चाहते हैं, या `MomentoChatMessageHistory.from_client_params` में एक नामित पैरामीटर `api_key` के रूप में, या यह केवल `MOMENTO_API_KEY` के रूप में एक पर्यावरण चर के रूप में सेट किया जा सकता है।

```python
from datetime import timedelta

from langchain_community.chat_message_histories import MomentoChatMessageHistory

session_id = "foo"
cache_name = "langchain"
ttl = timedelta(days=1)
history = MomentoChatMessageHistory.from_client_params(
    session_id,
    cache_name,
    ttl,
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!', additional_kwargs={}, example=False),
 AIMessage(content='whats up?', additional_kwargs={}, example=False)]
```
