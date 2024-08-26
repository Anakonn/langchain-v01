---
translated: true
---

# रॉकसेट

>[रॉकसेट](https://rockset.com/product/) एक रियल-टाइम एनालिटिक्स डेटाबेस सर्विस है जो स्केल पर कम लेटेंसी और उच्च कंकरेंसी एनालिटिकल क्वेरी को सर्व करता है। यह संरचित और अर्ध-संरचित डेटा पर एक कन्वर्जेंट इंडेक्स™ बनाता है और वेक्टर एम्बेडिंग के लिए एक कुशल स्टोर प्रदान करता है। स्कीमाहीन डेटा पर SQL चलाने का इसका समर्थन इसे मेटाडेटा फ़िल्टर के साथ वेक्टर सर्च चलाने के लिए एक आदर्श विकल्प बनाता है।

यह नोटबुक [रॉकसेट](https://rockset.com/docs) का उपयोग करके चैट संदेश इतिहास को कैसे संग्रहीत करें, इस बारे में बताता है।

## सेटअप करना

```python
%pip install --upgrade --quiet  rockset
```

शुरू करने के लिए, [रॉकसेट कंसोल](https://console.rockset.com/apikeys) से अपना API कुंजी प्राप्त करें। रॉकसेट [API संदर्भ](https://rockset.com/docs/rest-api#introduction) के लिए अपने API क्षेत्र ढूंढें।

## उदाहरण

```python
from langchain_community.chat_message_histories import (
    RocksetChatMessageHistory,
)
from rockset import Regions, RocksetClient

history = RocksetChatMessageHistory(
    session_id="MySession",
    client=RocksetClient(
        api_key="YOUR API KEY",
        host=Regions.usw2a1,  # us-west-2 Oregon
    ),
    collection="langchain_demo",
    sync=True,
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
print(history.messages)
```

आउटपुट कुछ इस तरह होना चाहिए:

```python
[
    HumanMessage(content='hi!', additional_kwargs={'id': '2e62f1c2-e9f7-465e-b551-49bae07fe9f0'}, example=False),
    AIMessage(content='whats up?', additional_kwargs={'id': 'b9be8eda-4c18-4cf8-81c3-e91e876927d0'}, example=False)
]

```
