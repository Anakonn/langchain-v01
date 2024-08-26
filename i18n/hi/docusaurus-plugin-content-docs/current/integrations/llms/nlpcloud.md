---
translated: true
---

# एनएलपी क्लाउड

[एनएलपी क्लाउड](https://nlpcloud.io) उच्च प्रदर्शन पूर्व-प्रशिक्षित या कस्टम मॉडल प्रदान करता है जो एनईआर, भावना-विश्लेषण, वर्गीकरण, सारांश, पैरापेरेजिंग, व्याकरण और वर्तनी सुधार, कीवर्ड और कीफ्रेज निकालना, चैटबॉट, उत्पाद विवरण और विज्ञापन जनरेशन, इरादा वर्गीकरण, पाठ जनरेशन, छवि जनरेशन, ब्लॉग पोस्ट जनरेशन, कोड जनरेशन, प्रश्न उत्तर, स्वचालित भाषण पहचान, मशीन अनुवाद, भाषा पहचान, सेमेंटिक खोज, सेमेंटिक समानता, टोकनाइजेशन, पीओएस टैगिंग, एम्बेडिंग और निर्भरता पार्सिंग के लिए उपयोग किया जा सकता है। यह उत्पादन के लिए तैयार है और एक REST API के माध्यम से प्रदान किया जाता है।

यह उदाहरण `एनएलपी क्लाउड` [मॉडल](https://docs.nlpcloud.com/#models) के साथ LangChain का उपयोग करने के बारे में बताता है।

```python
%pip install --upgrade --quiet  nlpcloud
```

```python
# get a token: https://docs.nlpcloud.com/#authentication

from getpass import getpass

NLPCLOUD_API_KEY = getpass()
```

```output
 ········
```

```python
import os

os.environ["NLPCLOUD_API_KEY"] = NLPCLOUD_API_KEY
```

```python
from langchain.chains import LLMChain
from langchain_community.llms import NLPCloud
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = NLPCloud()
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```

```output
' Justin Bieber was born in 1994, so the team that won the Super Bowl that year was the San Francisco 49ers.'
```
