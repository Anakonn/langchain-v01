---
translated: true
---

# Anyscale

[Anyscale](https://www.anyscale.com/)은 [Ray](https://www.ray.io/)라는 완전 관리형 플랫폼으로, 확장 가능한 AI 및 Python 애플리케이션을 구축, 배포 및 관리할 수 있습니다.

이 예제에서는 [Anyscale Endpoint](https://app.endpoints.anyscale.com/)와 상호 작용하는 방법을 살펴봅니다.

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

Ray를 사용하면 비동기 구현 없이 쿼리를 분산시킬 수 있습니다. 이는 Anyscale LLM 모델뿐만 아니라 `_acall` 또는 `_agenerate`가 구현되지 않은 다른 Langchain LLM 모델에도 적용됩니다.

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
