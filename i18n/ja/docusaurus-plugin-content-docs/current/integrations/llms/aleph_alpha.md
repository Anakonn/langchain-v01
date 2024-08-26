---
translated: true
---

# Aleph Alpha

[The Luminous series](https://docs.aleph-alpha.com/docs/introduction/luminous/)は大規模言語モデルのファミリーです。

このサンプルでは、LangChainを使ってAleph Alphaモデルとやり取りする方法を説明します。

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
