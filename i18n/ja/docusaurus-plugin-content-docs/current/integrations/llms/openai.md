---
translated: true
---

# OpenAI

[OpenAI](https://platform.openai.com/docs/introduction) は、さまざまなタスクに適した、さまざまなレベルの強力なモデルを提供しています。

この例では、LangChainを使って `OpenAI` [models](https://platform.openai.com/docs/models)を操作する方法について説明します。

```python
# get a token: https://platform.openai.com/account/api-keys

from getpass import getpass

OPENAI_API_KEY = getpass()
```

```python
import os

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

組織IDを指定する必要がある場合は、次のセルを使用できます。ただし、単一の組織に所属している場合や、デフォルトの組織を使用する場合は必要ありません。デフォルトの組織は[こちら](https://platform.openai.com/account/api-keys)で確認できます。

組織を指定するには、次のようにします:

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

OpenAI APIキーや組織IDを手動で指定する場合は、次のようにします:

```python
llm = OpenAI(openai_api_key="YOUR_API_KEY", openai_organization="YOUR_ORGANIZATION_ID")
```

openai_organizationパラメーターは、該当しない場合は削除してください。

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

明示的なプロキシの背後にいる場合は、http_clientを指定して通過させることができます。

```python
pip install httpx

import httpx

openai = OpenAI(model_name="gpt-3.5-turbo-instruct", http_client=httpx.Client(proxies="http://proxy.yourcompany.com:8080"))
```
