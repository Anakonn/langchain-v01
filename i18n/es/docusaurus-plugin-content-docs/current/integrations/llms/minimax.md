---
translated: true
---

# Minimax

[Minimax](https://api.minimax.chat) es una startup china que proporciona modelos de procesamiento de lenguaje natural para empresas e individuos.

Este ejemplo demuestra el uso de Langchain para interactuar con Minimax.

# Configuración

Para ejecutar este cuaderno, necesitará una [cuenta de Minimax](https://api.minimax.chat), una [clave API](https://api.minimax.chat/user-center/basic-information/interface-key) y un [ID de grupo](https://api.minimax.chat/user-center/basic-information).

# Llamada a un solo modelo

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

# Llamadas encadenadas a modelos

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
