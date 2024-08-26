---
translated: true
---

# GigaChat

यह नोटबुक दिखाता है कि LangChain का उपयोग [GigaChat](https://developers.sber.ru/portal/products/gigachat) के साथ कैसे किया जाता है।
उपयोग करने के लिए आपको ```gigachat``` पायथन पैकेज स्थापित करना होगा।

```python
%pip install --upgrade --quiet  gigachat
```

GigaChat क्रेडेंशियल प्राप्त करने के लिए आपको [खाता बनाना](https://developers.sber.ru/studio/login) और [API तक पहुंच प्राप्त करना](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart) होगा।

## उदाहरण

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
