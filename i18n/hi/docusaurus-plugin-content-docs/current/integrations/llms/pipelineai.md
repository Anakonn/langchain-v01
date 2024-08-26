---
translated: true
---

# PipelineAI

>[PipelineAI](https://pipeline.ai) आपको क्लाउड में अपने ML मॉडल को बड़े पैमाने पर चलाने देता है। यह कई LLM मॉडल तक [API पहुंच](https://pipeline.ai) भी प्रदान करता है।

यह नोटबुक [PipelineAI](https://docs.pipeline.ai/docs) के साथ Langchain का उपयोग करने के बारे में बताता है।

## PipelineAI उदाहरण

[यह उदाहरण दिखाता है कि PipelineAI कैसे LangChain के साथ एकीकृत है](https://docs.pipeline.ai/docs/langchain) और यह PipelineAI द्वारा बनाया गया है।

## सेटअप

`pipeline-ai` लाइब्रेरी का उपयोग करने के लिए `PipelineAI` API, अर्थात् `Pipeline Cloud` का उपयोग करना आवश्यक है। `pip install pipeline-ai` का उपयोग करके `pipeline-ai` स्थापित करें।

```python
# Install the package
%pip install --upgrade --quiet  pipeline-ai
```

## उदाहरण

### आयात

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import PipelineAI
from langchain_core.prompts import PromptTemplate
```

### पर्यावरण API कुंजी सेट करें

सुनिश्चित करें कि आप PipelineAI से अपनी API कुंजी प्राप्त करें। [क्लाउड त्वरित शुरुआत गाइड](https://docs.pipeline.ai/docs/cloud-quickstart) देखें। आपको 30 दिनों का मुफ्त ट्रायल और 10 घंटे का सर्वरलेस GPU कंप्यूट मिलेगा ताकि आप विभिन्न मॉडल का परीक्षण कर सकें।

```python
os.environ["PIPELINE_API_KEY"] = "YOUR_API_KEY_HERE"
```

## PipelineAI इंस्टेंस बनाएं

PipelineAI को इंस्टैंशिएट करते समय, आपको उस पाइपलाइन की पहचान या टैग निर्दिष्ट करनी होगी जिसका आप उपयोग करना चाहते हैं, उदाहरण के लिए `pipeline_key = "public/gpt-j:base"। फिर आप पाइपलाइन-विशिष्ट कीवर्ड तर्कों को पास करने का विकल्प रखते हैं:

```python
llm = PipelineAI(pipeline_key="YOUR_PIPELINE_KEY", pipeline_kwargs={...})
```

### प्रॉम्प्ट टेम्प्लेट बनाएं

हम प्रश्न और उत्तर के लिए एक प्रॉम्प्ट टेम्प्लेट बनाएंगे।

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

### LLMChain प्रारंभ करें

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

### LLMChain चलाएं

एक प्रश्न प्रदान करें और LLMChain चलाएं।

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
