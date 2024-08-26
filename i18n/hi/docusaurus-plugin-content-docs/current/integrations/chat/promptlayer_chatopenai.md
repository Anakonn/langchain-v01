---
sidebar_label: PromptLayer ChatOpenAI
translated: true
---

# PromptLayerChatOpenAI

यह उदाहरण दिखाता है कि [PromptLayer](https://www.promptlayer.com) से कैसे कनेक्ट करके अपने ChatOpenAI अनुरोधों को रिकॉर्ड करना शुरू किया जा सकता है।

## PromptLayer इंस्टॉल करें

OpenAI के साथ PromptLayer का उपयोग करने के लिए `promptlayer` पैकेज आवश्यक है। pip का उपयोग करके `promptlayer` इंस्टॉल करें।

```python
pip install promptlayer
```

## आयात

```python
import os

from langchain_community.chat_models import PromptLayerChatOpenAI
from langchain_core.messages import HumanMessage
```

## वातावरण API कुंजी सेट करें

[www.promptlayer.com](https://www.promptlayer.com) पर नेवबार में सेटिंग्स कॉग पर क्लिक करके आप एक PromptLayer API कुंजी बना सकते हैं।

इसे `PROMPTLAYER_API_KEY` नामक एक पर्यावरण चर के रूप में सेट करें।

```python
os.environ["PROMPTLAYER_API_KEY"] = "**********"
```

## सामान्य रूप से PromptLayerOpenAI LLM का उपयोग करें

*आप वैकल्पिक रूप से `pl_tags` को पास कर सकते हैं ताकि PromptLayer के टैगिंग सुविधा के साथ अपने अनुरोधों को ट्रैक किया जा सके।*

```python
chat = PromptLayerChatOpenAI(pl_tags=["langchain"])
chat([HumanMessage(content="I am a cat and I want")])
```

```output
AIMessage(content='to take a nap in a cozy spot. I search around for a suitable place and finally settle on a soft cushion on the window sill. I curl up into a ball and close my eyes, relishing the warmth of the sun on my fur. As I drift off to sleep, I can hear the birds chirping outside and feel the gentle breeze blowing through the window. This is the life of a contented cat.', additional_kwargs={})
```

**उपरोक्त अनुरोध अब आपके [PromptLayer डैशबोर्ड](https://www.promptlayer.com) पर दिखाई देना चाहिए।**

## PromptLayer ट्रैक का उपयोग करना

यदि आप [PromptLayer ट्रैकिंग सुविधाओं](https://magniv.notion.site/Track-4deee1b1f7a34c1680d085f82567dab9) में से किसी का उपयोग करना चाहते हैं, तो आपको अनुरोध आईडी प्राप्त करने के लिए PromptLayer LLM को इंस्टैंशिएट करते समय `return_pl_id` तर्क पास करना होगा।

```python
import promptlayer

chat = PromptLayerChatOpenAI(return_pl_id=True)
chat_results = chat.generate([[HumanMessage(content="I am a cat and I want")]])

for res in chat_results.generations:
    pl_request_id = res[0].generation_info["pl_request_id"]
    promptlayer.track.score(request_id=pl_request_id, score=100)
```

इसका उपयोग करने से आप PromptLayer डैशबोर्ड में अपने मॉडल के प्रदर्शन को ट्रैक कर सकते हैं। यदि आप एक प्रॉम्प्ट टेम्प्लेट का उपयोग कर रहे हैं, तो आप एक टेम्प्लेट को भी अनुरोध से जोड़ सकते हैं।
कुल मिलाकर, यह आपको PromptLayer डैशबोर्ड में विभिन्न टेम्प्लेट और मॉडल के प्रदर्शन को ट्रैक करने का अवसर देता है।
