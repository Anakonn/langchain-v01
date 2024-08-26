---
translated: true
---

# मिनीमैक्स

[मिनीमैक्स](https://api.minimax.chat) एक चीनी स्टार्टअप है जो कंपनियों और व्यक्तियों के लिए प्राकृतिक भाषा प्रसंस्करण मॉडल प्रदान करता है।

यह उदाहरण लैंगचेन का उपयोग करके मिनीमैक्स के साथ बातचीत करने का प्रदर्शन करता है।

# सेटअप

इस नोटबुक को चलाने के लिए आपको एक [मिनीमैक्स खाता](https://api.minimax.chat), एक [API कुंजी](https://api.minimax.chat/user-center/basic-information/interface-key), और एक [समूह आईडी](https://api.minimax.chat/user-center/basic-information) की आवश्यकता होगी।

# एकल मॉडल कॉल

```python
from langchain_community.llms import Minimax
```

```python
# Load the model
minimax = Minimax(minimax_api_key="YOUR_API_KEY", minimax_group_id="YOUR_GROUP_ID")
```

```python
# Prompt the model
minimax("What is the difference between panda and bear?")
```

# श्रृंखलित मॉडल कॉल

```python
# get api_key and group_id: https://api.minimax.chat/user-center/basic-information
# We need `MINIMAX_API_KEY` and `MINIMAX_GROUP_ID`

import os

os.environ["MINIMAX_API_KEY"] = "YOUR_API_KEY"
os.environ["MINIMAX_GROUP_ID"] = "YOUR_GROUP_ID"
```

```python
from langchain.chains import LLMChain
from langchain_community.llms import Minimax
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = Minimax()
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NBA team won the Championship in the year Jay Zhou was born?"

llm_chain.run(question)
```
