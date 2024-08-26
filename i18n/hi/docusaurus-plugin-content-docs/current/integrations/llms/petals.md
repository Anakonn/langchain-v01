---
translated: true
---

# पत्ते

`पत्ते` घर पर 100B+ भाषा मॉडल्स को BitTorrent-शैली में चलाता है।

यह नोटबुक Langchain के साथ [पत्ते](https://github.com/bigscience-workshop/petals) का उपयोग करने के बारे में जाता है।

## पत्ते इंस्टॉल करें

`पत्ते` पैकेज Petals API का उपयोग करने के लिए आवश्यक है। `pip3 install petals` का उपयोग करके `पत्ते` इंस्टॉल करें।

Apple Silicon(M1/M2) उपयोगकर्ताओं के लिए कृपया [https://github.com/bigscience-workshop/petals/issues/147#issuecomment-1365379642](https://github.com/bigscience-workshop/petals/issues/147#issuecomment-1365379642) इस गाइड का पालन करें पत्ते को इंस्टॉल करने के लिए।

```python
!pip3 install petals
```

## आयात

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import Petals
from langchain_core.prompts import PromptTemplate
```

## वातावरण API कुंजी सेट करें

सुनिश्चित करें कि आप Huggingface से [अपनी API कुंजी](https://huggingface.co/docs/api-inference/quicktour#get-your-api-token) प्राप्त करें।

```python
from getpass import getpass

HUGGINGFACE_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["HUGGINGFACE_API_KEY"] = HUGGINGFACE_API_KEY
```

## पत्ते उदाहरण बनाएं

आप मॉडल नाम, अधिकतम नए टोकन, तापमान आदि जैसे विभिन्न पैरामीटर निर्दिष्ट कर सकते हैं।

```python
# this can take several minutes to download big files!

llm = Petals(model_name="bigscience/bloom-petals")
```

```output
Downloading:   1%|▏                        | 40.8M/7.19G [00:24<15:44, 7.57MB/s]
```

## प्रश्न और उत्तर के लिए प्रॉम्प्ट टेम्प्लेट बनाएं

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
