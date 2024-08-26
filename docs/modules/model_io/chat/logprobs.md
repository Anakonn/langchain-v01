---
canonical: https://python.langchain.com/v0.1/docs/modules/model_io/chat/logprobs
translated: false
---

# Get log probabilities

Certain chat models can be configured to return token-level log probabilities. This guide walks through how to get logprobs for a number of models.

## OpenAI

Install the LangChain x OpenAI package and set your API key

```python
%pip install -qU langchain-openai
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

For the OpenAI API to return log probabilities we need to configure the `logprobs=True` param

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125").bind(logprobs=True)

msg = llm.invoke(("human", "how are you today"))
```

The logprobs are included on each output Message as part of the `response_metadata`:

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

And are part of streamed Message chunks as well:

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