---
translated: true
---

# 로그 확률 가져오기

특정 채팅 모델은 토큰 수준의 로그 확률을 반환하도록 구성할 수 있습니다. 이 가이드에서는 여러 모델에 대한 logprobs를 가져오는 방법을 설명합니다.

## OpenAI

LangChain x OpenAI 패키지를 설치하고 API 키를 설정하세요.

```python
%pip install -qU langchain-openai
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

OpenAI API에서 로그 확률을 반환하려면 `logprobs=True` 매개변수를 구성해야 합니다.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125").bind(logprobs=True)

msg = llm.invoke(("human", "how are you today"))
```

logprobs는 `response_metadata`의 일부로 각 출력 메시지에 포함됩니다.

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

스트리밍 메시지 청크에도 포함됩니다.

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
