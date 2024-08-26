---
sidebar_label: PremAI
translated: true
---

# ChatPremAI

> [PremAI](https://app.premai.io)는 사용자가 사용자 경험과 전체적인 성장을 더 많이 집중할 수 있도록 최소한의 노력으로 강력한 생산 준비된 GenAI 기반 애플리케이션을 구축할 수 있는 통합 플랫폼입니다.

이 예제는 `ChatPremAI`와 상호 작용하기 위해 LangChain을 사용하는 방법을 다룹니다.

### 설치 및 설정

먼저 langchain과 premai-sdk를 설치합니다. 다음 명령을 입력하여 설치할 수 있습니다:

```bash
pip install premai langchain
```

계속 진행하기 전에 PremAI에 계정을 만들고 프로젝트를 시작했는지 확인하십시오. 그렇지 않다면, 무료로 시작하는 방법은 다음과 같습니다:

1. 처음 방문하는 경우 [PremAI](https://app.premai.io/accounts/login/)에 로그인하고 [여기](https://app.premai.io/api_keys/)에서 API 키를 생성하십시오.

2. [app.premai.io](https://app.premai.io)로 이동하면 프로젝트 대시보드로 이동합니다.

3. 프로젝트를 생성하면 프로젝트 ID가 생성됩니다. 이 ID는 배포된 애플리케이션과 상호 작용하는 데 도움이 됩니다.

4. LaunchPad(🚀 아이콘이 있는 곳)로 이동합니다. 그리고 원하는 모델을 배포하십시오. 기본 모델은 `gpt-4`입니다. 또한 최대 토큰, 온도 등 다양한 생성 매개변수를 설정하고 시스템 프롬프트를 미리 설정할 수 있습니다.

첫 번째 배포된 PremAI 애플리케이션을 축하합니다 🎉 이제 LangChain을 사용하여 애플리케이션과 상호 작용할 수 있습니다.

```python
from langchain_community.chat_models import ChatPremAI
from langchain_core.messages import HumanMessage, SystemMessage
```

## LangChain에서 ChatPremAI 인스턴스 설정

필요한 모듈을 가져온 후, 클라이언트를 설정합니다. 지금은 `project_id`가 8이라고 가정합니다. 하지만 프로젝트 ID를 사용하지 않으면 오류가 발생할 것입니다.

PremAI와 LangChain을 사용하려면 모델 이름이나 매개변수를 설정할 필요가 없습니다. 모든 것은 LaunchPad 모델의 기본 모델 이름과 매개변수를 사용합니다.

`참고:` 클라이언트를 설정할 때 `model_name` 또는 `temperature`와 같은 매개변수를 변경하면 기존의 기본 구성이 덮어쓰여집니다.

```python
import getpass
import os

# 첫 번째 단계는 환경 변수를 설정하는 것입니다.

# 모델을 인스턴스화할 때 API 키를 전달할 수도 있지만, 환경 변수로 설정하는 것이 최선의 방법입니다.

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")
```

```python
# 기본적으로 플랫폼을 통해 배포된 모델을 사용합니다.

# 제 경우에는 "claude-3-haiku"입니다.

chat = ChatPremAI(project_id=8)
```

## 모델 호출

이제 모든 설정이 완료되었습니다. 이제 애플리케이션과 상호 작용을 시작할 수 있습니다. `ChatPremAI`는 두 가지 메서드를 지원합니다: `invoke` (이는 `generate`와 동일)와 `stream`.

첫 번째는 정적 결과를 제공합니다. 반면 두 번째는 토큰을 하나씩 스트리밍합니다. 다음은 채팅과 같은 완성을 생성하는 방법입니다.

### 생성

```python
human_message = HumanMessage(content="Who are you?")

response = chat.invoke([human_message])
print(response.content)
```

```output
I am an artificial intelligence created by Anthropic. I'm here to help with a wide variety of tasks, from research and analysis to creative projects and open-ended conversation. I have general knowledge and capabilities, but I'm not a real person - I'm an AI assistant. Please let me know if you have any other questions!
```

위의 결과가 흥미롭죠? 기본 LaunchPad 시스템 프롬프트를 다음과 같이 설정했습니다: `항상 해적처럼 말하세요`. 필요하면 기본 시스템 프롬프트를 재정의할 수도 있습니다. 다음은 그 방법입니다.

```python
system_message = SystemMessage(content="You are a friendly assistant.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

```output
AIMessage(content="I am an artificial intelligence created by Anthropic. My purpose is to assist and converse with humans in a friendly and helpful way. I have a broad knowledge base that I can use to provide information, answer questions, and engage in discussions on a wide range of topics. Please let me know if you have any other questions - I'm here to help!")
```

모델을 호출할 때 생성 매개변수를 변경할 수도 있습니다. 다음은 그 방법입니다.

```python
chat.invoke([system_message, human_message], temperature=0.7, max_tokens=10, top_p=0.95)
```

```output
AIMessage(content='I am an artificial intelligence created by Anthropic')
```

### 중요한 참고 사항

계속 진행하기 전에, 현재 버전의 ChatPrem은 [n](https://platform.openai.com/docs/api-reference/chat/create#chat-create-n)과 [stop](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stop) 매개변수를 지원하지 않는다는 점을 유의하십시오.

위의 두 매개변수는 향후 버전에서 지원될 예정입니다.

### 스트리밍

마지막으로, 동적 채팅과 같은 애플리케이션을 위한 토큰 스트리밍을 수행하는 방법은 다음과 같습니다.

```python
import sys

for chunk in chat.stream("hello how are you"):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
Hello! As an AI language model, I don't have feelings or a physical state, but I'm functioning properly and ready to assist you with any questions or tasks you might have. How can I help you today?
```

위와 유사하게, 시스템 프롬프트와 생성 매개변수를 재정의하려면 다음과 같이 할 수 있습니다.

```python
import sys

# 실험적인 이유로 시스템 프롬프트를 재정의하려는 경우에도 가능합니다.

# 그러나 이미 배포된 모델의 시스템 프롬프트를 재정의하는 것은 권장되지 않습니다.

for chunk in chat.stream(
    "hello how are you",
    system_prompt="act like a dog",
    temperature=0.7,
    max_tokens=200,
):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
Hello! As an AI language model, I don't have feelings or a physical form, but I'm functioning properly and ready to assist you. How can I help you today?
```