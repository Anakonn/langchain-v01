---
translated: true
---

# GigaChat

Ce notebook montre comment utiliser LangChain avec les [embeddings GigaChat](https://developers.sber.ru/portal/products/gigachat).
Pour l'utiliser, vous devez installer le package python ```gigachat```.

```python
%pip install --upgrade --quiet  gigachat
```

Pour obtenir les identifiants GigaChat, vous devez [créer un compte](https://developers.sber.ru/studio/login) et [accéder à l'API](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart)

## Exemple

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
