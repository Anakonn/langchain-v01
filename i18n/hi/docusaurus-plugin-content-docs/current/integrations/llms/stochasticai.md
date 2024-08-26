---
translated: true
---

# StochasticAI

>[Stochastic Acceleration Platform](https://docs.stochastic.ai/docs/introduction/) का उद्देश्य एक Deep Learning मॉडल के जीवन चक्र को सरल बनाना है। मॉडल अपलोड और संस्करण करने से लेकर प्रशिक्षण, संकुचन और त्वरण तक और फिर उसे उत्पादन में लाने तक।

यह उदाहरण LangChain का उपयोग करके `StochasticAI` मॉडल के साथ कैसे काम करें, इसके बारे में बताता है।

आपको [यहाँ](https://app.stochastic.ai/workspace/profile/settings?tab=profile) से API_KEY और API_URL प्राप्त करना होगा।

```python
from getpass import getpass

STOCHASTICAI_API_KEY = getpass()
```

```output
 ········
```

```python
import os

os.environ["STOCHASTICAI_API_KEY"] = STOCHASTICAI_API_KEY
```

```python
YOUR_API_URL = getpass()
```

```output
 ········
```

```python
from langchain.chains import LLMChain
from langchain_community.llms import StochasticAI
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = StochasticAI(api_url=YOUR_API_URL)
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```

```output
"\n\nStep 1: In 1999, the St. Louis Rams won the Super Bowl.\n\nStep 2: In 1999, Beiber was born.\n\nStep 3: The Rams were in Los Angeles at the time.\n\nStep 4: So they didn't play in the Super Bowl that year.\n"
```
