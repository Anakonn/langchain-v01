---
translated: true
---

# ForefrontAI

`Forefront` प्लेटफ़ॉर्म आपको [ओपन-सोर्स लार्ज लैंग्वेज मॉडल](https://docs.forefront.ai/forefront/master/models) को फ़ाइन-ट्यून और उपयोग करने की क्षमता देता है।

यह नोटबुक [ForefrontAI](https://www.forefront.ai/) के साथ Langchain का उपयोग करने के बारे में बताता है।

## आयात

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import ForefrontAI
from langchain_core.prompts import PromptTemplate
```

## वातावरण API कुंजी सेट करें

सुनिश्चित करें कि आप अपनी API कुंजी ForefrontAI से प्राप्त करें। आपको विभिन्न मॉडल का परीक्षण करने के लिए 5 दिन का मुफ्त ट्रायल दिया जाता है।

```python
# get a new token: https://docs.forefront.ai/forefront/api-reference/authentication

from getpass import getpass

FOREFRONTAI_API_KEY = getpass()
```

```python
os.environ["FOREFRONTAI_API_KEY"] = FOREFRONTAI_API_KEY
```

## ForefrontAI उदाहरण बनाएं

आप मॉडल एंडपॉइंट URL, लंबाई, तापमान आदि जैसे विभिन्न पैरामीटर निर्दिष्ट कर सकते हैं। आपको एक एंडपॉइंट URL प्रदान करना होगा।

```python
llm = ForefrontAI(endpoint_url="YOUR ENDPOINT URL HERE")
```

## एक प्रॉम्प्ट टेम्प्लेट बनाएं

हम प्रश्न और उत्तर के लिए एक प्रॉम्प्ट टेम्प्लेट बनाएंगे।

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## LLMChain प्रारंभ करें

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## LLMChain चलाएं

एक प्रश्न प्रदान करें और LLMChain चलाएं।

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
