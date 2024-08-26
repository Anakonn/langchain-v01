---
translated: true
---

# ギガチャット

このノートブックは、[GigaChat](https://developers.sber.ru/portal/products/gigachat) と LangChain を使用する方法を示しています。
使用するには、```gigachat``` パイソンパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  gigachat
```

GigaChat のクレデンシャルを取得するには、[アカウントを作成](https://developers.sber.ru/studio/login) し、[API へのアクセスを取得](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart) する必要があります。

## 例

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
