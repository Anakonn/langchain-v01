---
translated: true
---

# Aleph Alpha

[The Luminous series](https://docs.aleph-alpha.com/docs/introduction/luminous/)는 대규모 언어 모델의 제품군입니다.

이 예제에서는 LangChain을 사용하여 Aleph Alpha 모델과 상호 작용하는 방법을 설명합니다.

```python
# Install the package
%pip install --upgrade --quiet  aleph-alpha-client
```

```python
# create a new token: https://docs.aleph-alpha.com/docs/account/#create-a-new-token

from getpass import getpass

ALEPH_ALPHA_API_KEY = getpass()
```

```output
········
```

```python
from langchain_community.llms import AlephAlpha
from langchain_core.prompts import PromptTemplate
```

```python
template = """Q: {question}

A:"""

prompt = PromptTemplate.from_template(template)
```

```python
llm = AlephAlpha(
    model="luminous-extended",
    maximum_tokens=20,
    stop_sequences=["Q:"],
    aleph_alpha_api_key=ALEPH_ALPHA_API_KEY,
)
```

```python
llm_chain = prompt | llm
```

```python
question = "What is AI?"

llm_chain.invoke({"question": question})
```

```output
' Artificial Intelligence is the simulation of human intelligence processes by machines.\n\n'
```
