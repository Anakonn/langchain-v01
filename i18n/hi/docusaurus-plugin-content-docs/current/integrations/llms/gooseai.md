---
translated: true
---

# GooseAI

`GooseAI` एक पूरी तरह से प्रबंधित एनएलपी-एज-ए-सर्विस है, जो एपीआई के माध्यम से प्रदान किया जाता है। GooseAI [इन मॉडलों](https://goose.ai/docs/models) तक पहुंच प्रदान करता है।

यह नोटबुक Langchain के साथ [GooseAI](https://goose.ai/) का उपयोग करने के बारे में बताता है।

## openai इंस्टॉल करें

GooseAI एपीआई का उपयोग करने के लिए `openai` पैकेज आवश्यक है। `pip install openai` का उपयोग करके `openai` इंस्टॉल करें।

```python
%pip install --upgrade --quiet  langchain-openai
```

## आयात

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import GooseAI
from langchain_core.prompts import PromptTemplate
```

## वातावरण एपीआई कुंजी सेट करें

सुनिश्चित करें कि आप GooseAI से अपनी एपीआई कुंजी प्राप्त करें। आप विभिन्न मॉडलों का परीक्षण करने के लिए $10 का मुफ्त क्रेडिट दिया जाता है।

```python
from getpass import getpass

GOOSEAI_API_KEY = getpass()
```

```python
os.environ["GOOSEAI_API_KEY"] = GOOSEAI_API_KEY
```

## GooseAI इंस्टेंस बनाएं

आप मॉडल नाम, अधिकतम टोकन उत्पन्न, तापमान आदि जैसे विभिन्न पैरामीटर निर्दिष्ट कर सकते हैं।

```python
llm = GooseAI()
```

## प्रश्न और उत्तर के लिए प्रोम्प्ट टेम्प्लेट बनाएं

हम प्रश्न और उत्तर के लिए एक प्रोम्प्ट टेम्प्लेट बनाएंगे।

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
