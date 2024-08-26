---
sidebar_label: Moonshot
translated: true
---

# MoonshotChat

[Moonshot](https://platform.moonshot.cn/)은 기업과 개인을 위한 LLM 서비스를 제공하는 중국 스타트업입니다.

이 예제에서는 LangChain을 사용하여 Moonshot Inference for Chat와 상호작용하는 방법을 설명합니다.

```python
import os

# https://platform.moonshot.cn/console/api-keys에서 API 키를 생성하세요

os.environ["MOONSHOT_API_KEY"] = "MOONSHOT_API_KEY"
```

```python
from langchain_community.chat_models.moonshot import MoonshotChat
from langchain_core.messages import HumanMessage, SystemMessage
```

```python
chat = MoonshotChat()
# 또는 특정 모델을 사용합니다

# 사용 가능한 모델: https://platform.moonshot.cn/docs

# chat = MoonshotChat(model="moonshot-v1-128k")

```

```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    ),
]

chat.invoke(messages)
```