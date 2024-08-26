---
translated: true
---

# OpenAI

[OpenAI](https://platform.openai.com/docs/introduction)은 다양한 작업에 적합한 다양한 수준의 모델을 제공합니다.

이 예제에서는 `OpenAI` [모델](https://platform.openai.com/docs/models)과 상호 작용하는 방법을 LangChain을 사용하여 설명합니다.

```python
# get a token: https://platform.openai.com/account/api-keys

from getpass import getpass

OPENAI_API_KEY = getpass()
```

```python
import os

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

조직 ID를 지정해야 하는 경우 다음 셀을 사용할 수 있습니다. 그러나 단일 조직의 일부이거나 기본 조직을 사용할 계획인 경우에는 필요하지 않습니다. 기본 조직은 [여기](https://platform.openai.com/account/api-keys)에서 확인할 수 있습니다.

조직을 지정하려면 다음을 사용할 수 있습니다:

```python
OPENAI_ORGANIZATION = getpass()

os.environ["OPENAI_ORGANIZATION"] = OPENAI_ORGANIZATION
```

```python
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = OpenAI()
```

OpenAI API 키 및/또는 조직 ID를 수동으로 지정하려면 다음을 사용할 수 있습니다:

```python
llm = OpenAI(openai_api_key="YOUR_API_KEY", openai_organization="YOUR_ORGANIZATION_ID")
```

openai_organization 매개변수는 해당되지 않는 경우 제거하십시오.

```python
llm_chain = prompt | llm
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.invoke(question)
```

```output
' Justin Bieber was born on March 1, 1994. The Super Bowl is typically played in late January or early February. So, we need to look at the Super Bowl from 1994. In 1994, the Super Bowl was Super Bowl XXVIII, played on January 30, 1994. The winning team of that Super Bowl was the Dallas Cowboys.'
```

명시적 프록시 뒤에 있는 경우 http_client를 지정하여 통과시킬 수 있습니다.

```python
pip install httpx

import httpx

openai = OpenAI(model_name="gpt-3.5-turbo-instruct", http_client=httpx.Client(proxies="http://proxy.yourcompany.com:8080"))
```
