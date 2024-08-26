---
translated: true
---

# Tongyi Qwen

Tongyi Qwen एक बड़े पैमाने का भाषा मॉडल है जिसे अलीबाबा के डामो अकादमी द्वारा विकसित किया गया है। यह प्राकृतिक भाषा समझ और अर्थ विश्लेषण के आधार पर उपयोगकर्ता की मंशा को समझने में सक्षम है, जो प्राकृतिक भाषा में उपयोगकर्ता इनपुट पर आधारित है। यह विभिन्न डोमेन और कार्यों में उपयोगकर्ताओं को सेवाएं और सहायता प्रदान करता है। स्पष्ट और विस्तृत निर्देश प्रदान करके, आप अपनी उम्मीदों के अनुरूप बेहतर परिणाम प्राप्त कर सकते हैं।

## सेटअप करना

```python
# Install the package
%pip install --upgrade --quiet  dashscope
```

```python
# Get a new token: https://help.aliyun.com/document_detail/611472.html?spm=a2c4g.2399481.0.0
from getpass import getpass

DASHSCOPE_API_KEY = getpass()
```

```output
 ········
```

```python
import os

os.environ["DASHSCOPE_API_KEY"] = DASHSCOPE_API_KEY
```

```python
from langchain_community.llms import Tongyi
```

```python
Tongyi().invoke("What NFL team won the Super Bowl in the year Justin Bieber was born?")
```

```output
'Justin Bieber was born on March 1, 1994. The Super Bowl that took place in the same year was Super Bowl XXVIII, which was played on January 30, 1994. The winner of that Super Bowl was the Dallas Cowboys, who defeated the Buffalo Bills with a score of 30-13.'
```

## चेन में उपयोग करना

```python
from langchain_core.prompts import PromptTemplate
```

```python
llm = Tongyi()
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
chain = prompt | llm
```

```python
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

chain.invoke({"question": question})
```

```output
'Justin Bieber was born on March 1, 1994. The Super Bowl that took place in the same calendar year was Super Bowl XXVIII, which was played on January 30, 1994. The winner of Super Bowl XXVIII was the Dallas Cowboys, who defeated the Buffalo Bills with a score of 30-13.'
```
