---
sidebar_label: Baidu Qianfan
translated: true
---

# QianfanChatEndpoint

Baidu AI Cloud Qianfan Platform은 기업 개발자를 위한 원스톱 대형 모델 개발 및 서비스 운영 플랫폼입니다. Qianfan은 Wenxin Yiyan (ERNIE-Bot) 모델과 타사 오픈 소스 모델을 제공할 뿐만 아니라 다양한 AI 개발 도구와 전체 개발 환경을 제공하여 고객이 대형 모델 애플리케이션을 쉽게 사용하고 개발할 수 있도록 합니다.

기본적으로 이러한 모델은 다음 유형으로 분류됩니다:

- Embedding
- Chat
- Completion

이 노트북에서는 `langchain/chat_models` 패키지에 해당하는 `Chat`에서 [Qianfan](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html)을 사용하는 방법을 소개합니다:

## API 초기화

Baidu Qianfan을 기반으로 LLM 서비스를 사용하려면 다음 매개변수를 초기화해야 합니다:

환경 변수에서 AK, SK를 초기화하거나 매개변수를 직접 초기화할 수 있습니다:

```base
export QIANFAN_AK=XXX
export QIANFAN_SK=XXX
```

## 현재 지원되는 모델:

- ERNIE-Bot-turbo (기본 모델)
- ERNIE-Bot
- BLOOMZ-7B
- Llama-2-7b-chat
- Llama-2-13b-chat
- Llama-2-70b-chat
- Qianfan-BLOOMZ-7B-compressed
- Qianfan-Chinese-Llama-2-7B
- ChatGLM2-6B-32K
- AquilaChat-7B

## 설정

```python
"""기본 초기화 및 호출"""
import os

from langchain_community.chat_models import QianfanChatEndpoint
from langchain_core.language_models.chat_models import HumanMessage

os.environ["QIANFAN_AK"] = "Your_api_key"
os.environ["QIANFAN_SK"] = "You_secret_Key"
```

## 사용법

```python
chat = QianfanChatEndpoint(streaming=True)
messages = [HumanMessage(content="Hello")]
chat.invoke(messages)
```

```output
AIMessage(content='您好！请问您需要什么帮助？我将尽力回答您的问题。')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='您好！有什么我可以帮助您的吗？')
```

```python
chat.batch([messages])
```

```output
[AIMessage(content='您好！有什么我可以帮助您的吗？')]
```

### 스트리밍

```python
try:
    for chunk in chat.stream(messages):
        print(chunk.content, end="", flush=True)
except TypeError as e:
    print("")
```

```output
您好！有什么我可以帮助您的吗？
```

## Qianfan에서 다른 모델 사용

기본 모델은 ERNIE-Bot-turbo입니다. Ernie Bot 또는 타사 오픈 소스 모델을 기반으로 자체 모델을 배포하려는 경우 다음 단계를 따르십시오:

1. (선택 사항, 모델이 기본 모델에 포함된 경우 건너뜀) Qianfan 콘솔에서 모델을 배포하고 맞춤형 배포 엔드포인트를 얻습니다.
2. 초기화에서 `endpoint` 필드를 설정합니다:

```python
chatBot = QianfanChatEndpoint(
    streaming=True,
    model="ERNIE-Bot",
)

messages = [HumanMessage(content="Hello")]
chatBot.invoke(messages)
```

```output
AIMessage(content='Hello，可以回答问题了，我会竭尽全力为您解答，请问有什么问题吗？')
```

## 모델 매개변수:

현재 `ERNIE-Bot` 및 `ERNIE-Bot-turbo`만 아래 모델 매개변수를 지원하며, 향후 더 많은 모델을 지원할 예정입니다.

- temperature
- top_p
- penalty_score

```python
chat.invoke(
    [HumanMessage(content="Hello")],
    **{"top_p": 0.4, "temperature": 0.1, "penalty_score": 1},
)
```

```output
AIMessage(content='您好！有什么我可以帮助您的吗？')
```