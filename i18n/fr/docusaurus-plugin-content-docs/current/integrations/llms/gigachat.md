---
translated: true
---

# GigaChat

Ce notebook montre comment utiliser LangChain avec [GigaChat](https://developers.sber.ru/portal/products/gigachat).
Pour l'utiliser, vous devez installer le package python ```gigachat```.

```python
%pip install --upgrade --quiet  gigachat
```

Pour obtenir les identifiants GigaChat, vous devez [créer un compte](https://developers.sber.ru/studio/login) et [obtenir l'accès à l'API](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart)

## Exemple

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
