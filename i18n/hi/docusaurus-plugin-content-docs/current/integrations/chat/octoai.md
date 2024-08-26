---
translated: true
---

# ChatOctoAI

[OctoAI](https://docs.octoai.cloud/docs) उपयोगकर्ताओं को कुशल कंप्यूटिंग तक आसान पहुंच प्रदान करता है और उन्हें अपने पसंदीदा AI मॉडल को अनुप्रयोगों में एकीकृत करने में सक्षम बनाता है। `OctoAI` कंप्यूटिंग सेवा आपको AI अनुप्रयोगों को आसानी से चलाने, ट्यून करने और पैमाना बढ़ाने में मदद करती है।

यह नोटबुक `langchain.chat_models.ChatOctoAI` का उपयोग [OctoAI एंडपॉइंट](https://octoai.cloud/text) के लिए दर्शाता है।

## सेटअप

हमारे उदाहरण ऐप को चलाने के लिए दो सरल चरण हैं:

1. [अपने OctoAI खाते पृष्ठ](https://octoai.cloud/settings) से एक API टोकन प्राप्त करें।

2. अपना API टोकन नीचे दिए गए कोड सेल में चिपकाएं या `octoai_api_token` कीवर्ड तर्क का उपयोग करें।

नोट: यदि आप [उपलब्ध मॉडल](https://octoai.cloud/text?selectedTags=Chat) से अलग किसी मॉडल का उपयोग करना चाहते हैं, तो आप मॉडल को कंटेनराइज़ कर सकते हैं और [Python से कंटेनर बनाना](https://octo.ai/docs/bring-your-own-model/advanced-build-a-container-from-scratch-in-python) और [कंटेनर से कस्टम एंडपॉइंट बनाना](https://octo.ai/docs/bring-your-own-model/create-custom-endpoints-from-a-container/create-custom-endpoints-from-a-container) का पालन करके खुद एक कस्टम OctoAI एंडपॉइंट बना सकते हैं, और फिर अपने `OCTOAI_API_BASE` पर्यावरण चर को अपडेट कर सकते हैं।

```python
import os

os.environ["OCTOAI_API_TOKEN"] = "OCTOAI_API_TOKEN"
```

```python
from langchain_community.chat_models import ChatOctoAI
from langchain_core.messages import HumanMessage, SystemMessage
```

## उदाहरण

```python
chat = ChatOctoAI(max_tokens=300, model_name="mixtral-8x7b-instruct")
```

```python
messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Tell me about Leonardo da Vinci briefly."),
]
print(chat(messages).content)
```

लियोनार्दो दा विंची (1452-1519) एक इतालवी बहुमुखी थे जिन्हें अक्सर इतिहास के सबसे महान चित्रकारों में से एक माना जाता है। हालांकि, उनकी प्रतिभा कला से परे थी। वह एक वैज्ञानिक, आविष्कारक, गणितज्ञ, इंजीनियर, शरीर विज्ञानी, भूविज्ञानी और भूगोलविद भी थे।

दा विंची मोना लिसा, द लास्ट सुपर और द वर्जिन ऑफ द रॉक्स जैसे चित्रों के लिए सबसे प्रसिद्ध हैं। उनके वैज्ञानिक अध्ययन अपने समय से आगे थे, और उनके नोटबुक में विभिन्न मशीनों, मानव शरीर रचना और प्राकृतिक घटनाओं के विस्तृत चित्र और विवरण शामिल हैं।

औपचारिक शिक्षा प्राप्त न करने के बावजूद, दा विंची की असंतुष्ट जिज्ञासा और निरीक्षण कौशल ने उन्हें कई क्षेत्रों में अग्रणी बना दिया। उनका काम आज भी कलाकारों, वैज्ञानिकों और विचारकों को प्रेरित और प्रभावित करता है।
