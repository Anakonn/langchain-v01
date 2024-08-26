---
translated: true
---

# लॉग प्रॉबेबिलिटीज़ प्राप्त करें

कुछ चैट मॉडल को इस तरह कॉन्फ़िगर किया जा सकता है कि वे टोकन-स्तर की लॉग प्रॉबेबिलिटीज़ वापस करें। यह गाइड बताती है कि कई मॉडलों के लिए लॉगप्रॉब्स कैसे प्राप्त करें।

## OpenAI

LangChain x OpenAI पैकेज इंस्टॉल करें और अपना API कुंजी सेट करें।

```python
%pip install -qU langchain-openai
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

OpenAI API को लॉग प्रॉबेबिलिटीज़ वापस करने के लिए, हमें `logprobs=True` पैरामीटर कॉन्फ़िगर करने की आवश्यकता है।

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125").bind(logprobs=True)

msg = llm.invoke(("human", "how are you today"))
```

लॉगप्रॉब्स `response_metadata` के भाग के रूप में प्रत्येक आउटपुट संदेश में शामिल हैं:

```python
msg.response_metadata["logprobs"]["content"][:5]
```

```output
[{'token': 'As',
  'bytes': [65, 115],
  'logprob': -1.5358024,
  'top_logprobs': []},
 {'token': ' an',
  'bytes': [32, 97, 110],
  'logprob': -0.028062303,
  'top_logprobs': []},
 {'token': ' AI',
  'bytes': [32, 65, 73],
  'logprob': -0.009415812,
  'top_logprobs': []},
 {'token': ',', 'bytes': [44], 'logprob': -0.07371779, 'top_logprobs': []},
 {'token': ' I',
  'bytes': [32, 73],
  'logprob': -4.298773e-05,
  'top_logprobs': []}]
```

और स्ट्रीम किए गए संदेश टुकड़ों का भी हिस्सा हैं:

```python
ct = 0
full = None
for chunk in llm.stream(("human", "how are you today")):
    if ct < 5:
        full = chunk if full is None else full + chunk
        if "logprobs" in full.response_metadata:
            print(full.response_metadata["logprobs"]["content"])
    else:
        break
    ct += 1
```

```output
[]
[{'token': 'As', 'bytes': [65, 115], 'logprob': -1.7523563, 'top_logprobs': []}]
[{'token': 'As', 'bytes': [65, 115], 'logprob': -1.7523563, 'top_logprobs': []}, {'token': ' an', 'bytes': [32, 97, 110], 'logprob': -0.019908238, 'top_logprobs': []}]
[{'token': 'As', 'bytes': [65, 115], 'logprob': -1.7523563, 'top_logprobs': []}, {'token': ' an', 'bytes': [32, 97, 110], 'logprob': -0.019908238, 'top_logprobs': []}, {'token': ' AI', 'bytes': [32, 65, 73], 'logprob': -0.0093033705, 'top_logprobs': []}]
[{'token': 'As', 'bytes': [65, 115], 'logprob': -1.7523563, 'top_logprobs': []}, {'token': ' an', 'bytes': [32, 97, 110], 'logprob': -0.019908238, 'top_logprobs': []}, {'token': ' AI', 'bytes': [32, 65, 73], 'logprob': -0.0093033705, 'top_logprobs': []}, {'token': ',', 'bytes': [44], 'logprob': -0.08852102, 'top_logprobs': []}]
```
