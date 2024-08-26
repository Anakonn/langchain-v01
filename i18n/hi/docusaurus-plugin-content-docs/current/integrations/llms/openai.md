---
translated: true
---

# OpenAI

[OpenAI](https://platform.openai.com/docs/introduction) एक ऐसा मॉडल स्पेक्ट्रम प्रदान करता है जिसमें विभिन्न स्तरों की शक्ति होती है जो विभिन्न कार्यों के लिए उपयुक्त होती है।

यह उदाहरण `OpenAI` [मॉडल](https://platform.openai.com/docs/models) के साथ LangChain का उपयोग करने के बारे में बताता है।

```python
# get a token: https://platform.openai.com/account/api-keys

from getpass import getpass

OPENAI_API_KEY = getpass()
```

```python
import os

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

यदि आपको अपने संगठन आईडी को निर्दिष्ट करने की आवश्यकता है, तो आप निम्नलिखित सेल का उपयोग कर सकते हैं। हालांकि, यह आवश्यक नहीं है यदि आप केवल एक संगठन का हिस्सा हैं या अपने डिफ़ॉल्ट संगठन का उपयोग करने का इरादा रखते हैं। आप अपने डिफ़ॉल्ट संगठन [यहां](https://platform.openai.com/account/api-keys) देख सकते हैं।

अपने संगठन को निर्दिष्ट करने के लिए आप इसका उपयोग कर सकते हैं:

```python
OPENAI_ORGANIZATION = getpass()

os.environ["OPENAI_ORGANIZATION"] = OPENAI_ORGANIZATION
```

```python
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = OpenAI()
```

यदि आप मैन्युअल रूप से अपने OpenAI API कुंजी और/या संगठन आईडी को निर्दिष्ट करना चाहते हैं, तो आप निम्नलिखित का उपयोग कर सकते हैं:

```python
llm = OpenAI(openai_api_key="YOUR_API_KEY", openai_organization="YOUR_ORGANIZATION_ID")
```

यदि यह आप पर लागू नहीं होता है, तो openai_organization पैरामीटर को हटा दें।

```python
llm_chain = prompt | llm
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.invoke(question)
```

```output
' Justin Bieber was born on March 1, 1994. The Super Bowl is typically played in late January or early February. So, we need to look at the Super Bowl from 1994. In 1994, the Super Bowl was Super Bowl XXVIII, played on January 30, 1994. The winning team of that Super Bowl was the Dallas Cowboys.'
```

यदि आप एक स्पष्ट प्रॉक्सी के पीछे हैं, तो आप http_client को निर्दिष्ट कर सकते हैं ताकि यह उसके माध्यम से गुजर सके।

```python
pip install httpx

import httpx

openai = OpenAI(model_name="gpt-3.5-turbo-instruct", http_client=httpx.Client(proxies="http://proxy.yourcompany.com:8080"))
```
