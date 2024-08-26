---
translated: true
---

# GigaChat

Este cuaderno muestra cómo usar LangChain con [GigaChat](https://developers.sber.ru/portal/products/gigachat).
Para usar, necesitas instalar el paquete de Python ```gigachat```.

```python
%pip install --upgrade --quiet  gigachat
```

Para obtener las credenciales de GigaChat, necesitas [crear una cuenta](https://developers.sber.ru/studio/login) y [obtener acceso a la API](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart)

## Ejemplo

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
