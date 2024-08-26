---
translated: true
---

# PromptLayer OpenAI

`PromptLayer` पहली प्लेटफॉर्म है जो आपको अपने GPT प्रॉम्प्ट इंजीनियरिंग को ट्रैक, प्रबंधित और साझा करने की अनुमति देता है। `PromptLayer` आपके कोड और `OpenAI's` पायथन लाइब्रेरी के बीच एक मध्यस्थ के रूप में कार्य करता है।

`PromptLayer` आपके सभी `OpenAI API` अनुरोधों को रिकॉर्ड करता है, जिससे आप `PromptLayer` डैशबोर्ड में अनुरोध इतिहास को खोज और एक्सप्लोर कर सकते हैं।

यह उदाहरण दिखाता है कि [PromptLayer](https://www.promptlayer.com) से कैसे कनेक्ट करें ताकि आप अपने OpenAI अनुरोधों को रिकॉर्ड करना शुरू कर सकें।

एक और उदाहरण [यहाँ](/docs/integrations/providers/promptlayer) है।

## PromptLayer इंस्टॉल करें

`promptlayer` पैकेज OpenAI के साथ PromptLayer का उपयोग करने के लिए आवश्यक है। pip का उपयोग करके `promptlayer` इंस्टॉल करें।

```python
%pip install --upgrade --quiet  promptlayer
```

## आयात

```python
import os

import promptlayer
from langchain_community.llms import PromptLayerOpenAI
```

## वातावरण API कुंजी सेट करें

आप [www.promptlayer.com](https://www.promptlayer.com) पर जाकर नेवबार में सेटिंग्स कॉग पर क्लिक करके एक PromptLayer API कुंजी बना सकते हैं।

इसे `PROMPTLAYER_API_KEY` नामक एक पर्यावरण चर के रूप में सेट करें।

आपको एक OpenAI कुंजी भी चाहिए, जिसे `OPENAI_API_KEY` कहा जाता है।

```python
from getpass import getpass

PROMPTLAYER_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["PROMPTLAYER_API_KEY"] = PROMPTLAYER_API_KEY
```

```python
from getpass import getpass

OPENAI_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

## सामान्य रूप से PromptLayerOpenAI LLM का उपयोग करें

*आप वैकल्पिक रूप से `pl_tags` पास कर सकते हैं ताकि आप PromptLayer के टैगिंग सुविधा का उपयोग कर सकें।*

```python
llm = PromptLayerOpenAI(pl_tags=["langchain"])
llm("I am a cat and I want")
```

**उपरोक्त अनुरोध अब आपके [PromptLayer डैशबोर्ड](https://www.promptlayer.com) पर दिखाई देना चाहिए।**

## PromptLayer ट्रैक का उपयोग करना

यदि आप [PromptLayer ट्रैकिंग सुविधाओं](https://magniv.notion.site/Track-4deee1b1f7a34c1680d085f82567dab9) में से किसी का उपयोग करना चाहते हैं, तो आपको अनुरोध आईडी प्राप्त करने के लिए `return_pl_id` तर्क पास करना होगा जब आप PromptLayer LLM को इंस्टैंशिएट करते हैं।

```python
llm = PromptLayerOpenAI(return_pl_id=True)
llm_results = llm.generate(["Tell me a joke"])

for res in llm_results.generations:
    pl_request_id = res[0].generation_info["pl_request_id"]
    promptlayer.track.score(request_id=pl_request_id, score=100)
```

इसका उपयोग करने से आप PromptLayer डैशबोर्ड में अपने मॉडल के प्रदर्शन को ट्रैक कर सकते हैं। यदि आप एक प्रॉम्प्ट टेम्प्लेट का उपयोग कर रहे हैं, तो आप एक अनुरोध से एक टेम्प्लेट संलग्न कर सकते हैं।
कुल मिलाकर, यह आपको PromptLayer डैशबोर्ड में विभिन्न टेम्प्लेट और मॉडल के प्रदर्शन को ट्रैक करने का अवसर देता है।
