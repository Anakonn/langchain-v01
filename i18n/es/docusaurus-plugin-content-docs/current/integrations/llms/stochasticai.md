---
translated: true
---

# StochasticAI

>[Plataforma de Aceleración Estocástica](https://docs.stochastic.ai/docs/introduction/) tiene como objetivo simplificar el ciclo de vida de un modelo de Deep Learning. Desde cargar y versionar el modelo, pasando por el entrenamiento, la compresión y la aceleración, hasta ponerlo en producción.

Este ejemplo explica cómo usar LangChain para interactuar con modelos `StochasticAI`.

Tienes que obtener la API_KEY y la API_URL [aquí](https://app.stochastic.ai/workspace/profile/settings?tab=profile).

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
