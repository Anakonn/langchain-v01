---
translated: true
---

# ギガチャット

このノートブックでは、[GigaChat](https://developers.sber.ru/portal/products/gigachat)とLangChainを使用する方法を示します。
使用するには```gigachat``` Pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  gigachat
```

GigaChatの資格情報を取得するには、[アカウントを作成](https://developers.sber.ru/studio/login)し、[APIへのアクセスを取得](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart)する必要があります。

## 例

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
