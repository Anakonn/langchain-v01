---
translated: true
---

# StochasticAI

>[Stochastic Acceleration Platform](https://docs.stochastic.ai/docs/introduction/) は、Deep Learning モデルのライフサイクルを簡素化することを目的としています。モデルのアップロードとバージョン管理、トレーニング、圧縮、高速化、そして本番環境への導入まで、すべての工程をサポートします。

この例では、LangChain を使って `StochasticAI` モデルとやり取りする方法を説明します。

API_KEY と API_URL は[こちら](https://app.stochastic.ai/workspace/profile/settings?tab=profile)から取得する必要があります。

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
