---
translated: true
---

# Anyscale

[Anyscale](https://www.anyscale.com/) es una plataforma [Ray](https://www.ray.io/) totalmente administrada, en la que puede crear, implementar y administrar aplicaciones de IA y Python escalables.

Este ejemplo explica cómo usar LangChain para interactuar con [Anyscale Endpoint](https://app.endpoints.anyscale.com/).

```python
ANYSCALE_API_BASE = "..."
ANYSCALE_API_KEY = "..."
ANYSCALE_MODEL_NAME = "..."
```

```python
import os

os.environ["ANYSCALE_API_BASE"] = ANYSCALE_API_BASE
os.environ["ANYSCALE_API_KEY"] = ANYSCALE_API_KEY
```

```python
from langchain.chains import LLMChain
from langchain_community.llms import Anyscale
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = Anyscale(model_name=ANYSCALE_MODEL_NAME)
```

```python
llm_chain = prompt | llm
```

```python
question = "When was George Washington president?"

llm_chain.invoke({"question": question})
```

Con Ray, podemos distribuir las consultas sin una implementación asincrónica. Esto no solo se aplica al modelo LLM de Anyscale, sino a cualquier otro modelo LLM de Langchain que no tenga implementado `_acall` o `_agenerate`.

```python
prompt_list = [
    "When was George Washington president?",
    "Explain to me the difference between nuclear fission and fusion.",
    "Give me a list of 5 science fiction books I should read next.",
    "Explain the difference between Spark and Ray.",
    "Suggest some fun holiday ideas.",
    "Tell a joke.",
    "What is 2+2?",
    "Explain what is machine learning like I am five years old.",
    "Explain what is artifical intelligence.",
]
```

```python
import ray


@ray.remote(num_cpus=0.1)
def send_query(llm, prompt):
    resp = llm.invoke(prompt)
    return resp


futures = [send_query.remote(llm, prompt) for prompt in prompt_list]
results = ray.get(futures)
```
