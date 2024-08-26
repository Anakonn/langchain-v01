---
translated: true
---

# Obtenir les probabilités logarithmiques

Certains modèles de chat peuvent être configurés pour renvoyer les probabilités logarithmiques au niveau des jetons. Ce guide explique comment obtenir les logprobs pour un certain nombre de modèles.

## OpenAI

Installez le package LangChain x OpenAI et définissez votre clé API

```python
%pip install -qU langchain-openai
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

Pour que l'API OpenAI renvoie les probabilités logarithmiques, nous devons configurer le paramètre `logprobs=True`

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125").bind(logprobs=True)

msg = llm.invoke(("human", "how are you today"))
```

Les logprobs sont inclus dans chaque message de sortie dans le cadre de `response_metadata` :

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

Et font également partie des fragments de messages diffusés :

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
