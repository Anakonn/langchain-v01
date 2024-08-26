---
sidebar_label: एंथ्रोपिक
translated: true
---

# एंथ्रोपिकएलएलएम

यह उदाहरण `एंथ्रोपिक` मॉडल के साथ LangChain का उपयोग करने के बारे में बताता है।

नोट: एंथ्रोपिकएलएलएम केवल पुराने क्लॉड 2 मॉडल का समर्थन करता है। नवीनतम क्लॉड 3 मॉडल का उपयोग करने के लिए, कृपया [`ChatAnthropic`](/docs/integrations/chat/anthropic) का उपयोग करें।

## इंस्टॉलेशन

```python
%pip install -qU langchain-anthropic
```

## पर्यावरण सेटअप

हमें एक [एंथ्रोपिक](https://console.anthropic.com/settings/keys) API कुंजी प्राप्त करने और `ANTHROPIC_API_KEY` पर्यावरण चर को सेट करने की आवश्यकता होगी:

```python
import os
from getpass import getpass

os.environ["ANTHROPIC_API_KEY"] = getpass()
```

## उपयोग

```python
from langchain_anthropic import AnthropicLLM
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

model = AnthropicLLM(model="claude-2.1")

chain = prompt | model

chain.invoke({"question": "What is LangChain?"})
```

```output
'\nLangChain is a decentralized blockchain network that leverages AI and machine learning to provide language translation services.'
```
