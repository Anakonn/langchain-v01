---
translated: true
---

# DeepInfra

[DeepInfra](https://deepinfra.com/?utm_source=langchain)는 다양한 LLM과 [임베딩 모델](https://deepinfra.com/models?type=embeddings&utm_source=langchain)에 접근할 수 있는 서버리스 추론 서비스입니다. 이 노트북은 DeepInfra를 사용하여 LangChain과 채팅 모델을 활용하는 방법을 설명합니다.

## 환경 API 키 설정

DeepInfra에서 API 키를 반드시 받아야 합니다. [로그인](https://deepinfra.com/login?from=%2Fdash)하여 새로운 토큰을 받으십시오.

다양한 모델을 테스트하기 위해 1시간 동안 무료 서버리스 GPU 컴퓨팅 시간이 제공됩니다. (자세한 내용은 [여기](https://github.com/deepinfra/deepctl#deepctl)를 참조하십시오)
`deepctl auth token` 명령어를 사용하여 토큰을 출력할 수 있습니다.

```python
# 새로운 토큰 받기: https://deepinfra.com/login?from=%2Fdash

import os
from getpass import getpass

from langchain_community.chat_models import ChatDeepInfra
from langchain_core.messages import HumanMessage

DEEPINFRA_API_TOKEN = getpass()

# 또는 deepinfra_api_token 매개변수를 ChatDeepInfra 생성자에 전달할 수 있습니다.

os.environ["DEEPINFRA_API_TOKEN"] = DEEPINFRA_API_TOKEN

chat = ChatDeepInfra(model="meta-llama/Llama-2-7b-chat-hf")

messages = [
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    )
]
chat.invoke(messages)
```

## `ChatDeepInfra`는 비동기 및 스트리밍 기능도 지원합니다:

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
```

```python
await chat.agenerate([messages])
```

```python
chat = ChatDeepInfra(
    streaming=True,
    verbose=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
chat.invoke(messages)
```