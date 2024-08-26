---
translated: true
---

# 확률적 AI

>[확률적 가속 플랫폼](https://docs.stochastic.ai/docs/introduction/)은 딥러닝 모델의 생명 주기를 단순화하는 것을 목표로 합니다. 모델 업로드 및 버전 관리, 학습, 압축 및 가속화, 그리고 운영 배포까지 모든 과정을 지원합니다.

이 예제에서는 LangChain을 사용하여 `StochasticAI` 모델과 상호 작용하는 방법을 설명합니다.

API_KEY와 API_URL은 [여기](https://app.stochastic.ai/workspace/profile/settings?tab=profile)에서 얻을 수 있습니다.

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
