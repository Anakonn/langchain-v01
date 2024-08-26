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
