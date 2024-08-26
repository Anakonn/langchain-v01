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
from langchain_community.chat_models import GigaChat

chat = GigaChat(verify_ssl_certs=False, scope="GIGACHAT_API_PERS")
```

```python
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage(
        content="You are a helpful AI that shares everything you know. Talk in English."
    ),
    HumanMessage(content="What is capital of Russia?"),
]

print(chat.invoke(messages).content)
```

```output
The capital of Russia is Moscow.
```
