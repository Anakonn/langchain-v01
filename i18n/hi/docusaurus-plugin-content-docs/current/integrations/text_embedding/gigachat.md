---
translated: true
---

# GigaChat

यह नोटबुक दिखाता है कि LangChain का उपयोग [GigaChat embeddings](https://developers.sber.ru/portal/products/gigachat) के साथ कैसे किया जाता है।
उपयोग करने के लिए आपको ```gigachat``` पायथन पैकेज स्थापित करना होगा।

```python
%pip install --upgrade --quiet  gigachat
```

GigaChat credentials प्राप्त करने के लिए आपको [खाता बनाना](https://developers.sber.ru/studio/login) और [API तक पहुंच प्राप्त करना](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart) होगा।

## उदाहरण

```python
import os
from getpass import getpass

os.environ["GIGACHAT_CREDENTIALS"] = getpass()
```

```python
from langchain_community.embeddings import GigaChatEmbeddings

embeddings = GigaChatEmbeddings(verify_ssl_certs=False, scope="GIGACHAT_API_PERS")
```

```python
query_result = embeddings.embed_query("The quick brown fox jumps over the lazy dog")
```

```python
query_result[:5]
```

```output
[0.8398333191871643,
 -0.14180311560630798,
 -0.6161925792694092,
 -0.17103666067123413,
 1.2884578704833984]
```
