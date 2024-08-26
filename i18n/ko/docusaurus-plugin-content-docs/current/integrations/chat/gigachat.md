---
translated: true
---

# GigaChat

이 노트북은 [GigaChat](https://developers.sber.ru/portal/products/gigachat)과 함께 LangChain을 사용하는 방법을 보여줍니다.
사용하려면 `gigachat` 파이썬 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet gigachat
```

GigaChat 자격 증명을 얻으려면 [계정을 생성](https://developers.sber.ru/studio/login)하고 [API 접근 권한을 얻어야](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart) 합니다.

## 예제

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
        content="당신은 당신이 아는 모든 것을 공유하는 유용한 AI입니다. 영어로 말하세요."
    ),
    HumanMessage(content="러시아의 수도는 어디인가요?"),
]

print(chat.invoke(messages).content)
```

```output
러시아의 수도는 모스크바입니다.
```