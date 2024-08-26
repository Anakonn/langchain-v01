---
translated: true
---

# टेलीग्राम

>[टेलीग्राम मैसेंजर](https://web.telegram.org/a/) एक वैश्विक रूप से पहुंच योग्य फ्रीमियम, क्रॉस-प्लेटफ़ॉर्म, एन्क्रिप्टेड, क्लाउड-आधारित और केंद्रीकृत तत्काल संदेश सेवा है। एप्लिकेशन एंड-टू-एंड एन्क्रिप्टेड चैट और वीडियो कॉलिंग, VoIP, फ़ाइल शेयरिंग और कई अन्य सुविधाएं भी प्रदान करता है।

यह नोटबुक कवर करता है कि `टेलीग्राम` से डेटा को कैसे लोड किया जाए ताकि इसे LangChain में इंजेस्ट किया जा सके।

```python
from langchain_community.document_loaders import (
    TelegramChatApiLoader,
    TelegramChatFileLoader,
)
```

```python
loader = TelegramChatFileLoader("example_data/telegram.json")
```

```python
loader.load()
```

```output
[Document(page_content="Henry on 2020-01-01T00:00:02: It's 2020...\n\nHenry on 2020-01-01T00:00:04: Fireworks!\n\nGrace ðŸ§¤ ðŸ\x8d’ on 2020-01-01T00:00:05: You're a minute late!\n\n", metadata={'source': 'example_data/telegram.json'})]
```

`TelegramChatApiLoader` किसी भी निर्दिष्ट चैट से सीधे टेलीग्राम से डेटा लोड करता है। डेटा निर्यात करने के लिए, आपको अपने टेलीग्राम खाते को प्रमाणित करने की आवश्यकता होगी।

आप API_HASH और API_ID को https://my.telegram.org/auth?to=apps से प्राप्त कर सकते हैं

chat_entity – एक चैनल के [entity](https://docs.telethon.dev/en/stable/concepts/entities.html?highlight=Entity#what-is-an-entity) होने की सिफारिश की जाती है।

```python
loader = TelegramChatApiLoader(
    chat_entity="<CHAT_URL>",  # recommended to use Entity here
    api_hash="<API HASH >",
    api_id="<API_ID>",
    username="",  # needed only for caching the session.
)
```

```python
loader.load()
```
