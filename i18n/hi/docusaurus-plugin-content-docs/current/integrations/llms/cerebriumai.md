---
translated: true
---

# CerebriumAI

`Cerebrium` एक AWS Sagemaker वैकल्पिक है। यह [कई एलएलएम मॉडल](https://docs.cerebrium.ai/cerebrium/prebuilt-models/deployment) के लिए API पहुंच भी प्रदान करता है।

यह नोटबुक [CerebriumAI](https://docs.cerebrium.ai/introduction) के साथ Langchain का उपयोग करने के बारे में बताता है।

## cerebrium स्थापित करें

`cerebrium` पैकेज `CerebriumAI` API का उपयोग करने के लिए आवश्यक है। `pip3 install cerebrium` का उपयोग करके `cerebrium` स्थापित करें।

```python
# Install the package
!pip3 install cerebrium
```

## आयात

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import CerebriumAI
from langchain_core.prompts import PromptTemplate
```

## वातावरण API कुंजी सेट करें

सुनिश्चित करें कि आप CerebriumAI से अपनी API कुंजी प्राप्त करें। [यहां](https://dashboard.cerebrium.ai/login) देखें। आपको विभिन्न मॉडल परीक्षण करने के लिए 1 घंटे का मुफ्त सर्वरलेस जीपीयू कंप्यूट दिया जाता है।

```python
os.environ["CEREBRIUMAI_API_KEY"] = "YOUR_KEY_HERE"
```

## CerebriumAI उदाहरण बनाएं

आप मॉडल एंडपॉइंट यूआरएल, अधिकतम लंबाई, तापमान आदि जैसे विभिन्न पैरामीटर निर्दिष्ट कर सकते हैं। आपको एक एंडपॉइंट यूआरएल प्रदान करना होगा।

```python
llm = CerebriumAI(endpoint_url="YOUR ENDPOINT URL HERE")
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
