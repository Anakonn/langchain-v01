---
translated: true
---

# GigaChat

이 노트북은 [GigaChat](https://developers.sber.ru/portal/products/gigachat)과 함께 LangChain을 사용하는 방법을 보여줍니다.
사용하려면 ```gigachat``` Python 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  gigachat
```

GigaChat 자격 증명을 얻으려면 [계정을 생성](https://developers.sber.ru/studio/login)하고 [API에 대한 액세스를 받아야](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart) 합니다.

## 예시

```python
import os
from getpass import getpass

os.environ["GIGACHAT_CREDENTIALS"] = getpass()
```

```python
from langchain_community.llms import GigaChat

llm = GigaChat(verify_ssl_certs=False, scope="GIGACHAT_API_PERS")
```

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = "What is capital of {country}?"

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

generated = llm_chain.invoke(input={"country": "Russia"})
print(generated["text"])
```

```output
The capital of Russia is Moscow.
```
