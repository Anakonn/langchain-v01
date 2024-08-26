---
translated: true
---

# Minimax

[Minimax](https://api.minimax.chat) est une startup chinoise qui fournit des modèles de traitement du langage naturel pour les entreprises et les particuliers.

Cet exemple montre comment utiliser Langchain pour interagir avec Minimax.

# Configuration

Pour exécuter ce notebook, vous aurez besoin d'un [compte Minimax](https://api.minimax.chat), d'une [clé API](https://api.minimax.chat/user-center/basic-information/interface-key) et d'un [ID de groupe](https://api.minimax.chat/user-center/basic-information).

# Appel de modèle unique

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

# Appels de modèle en chaîne

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
