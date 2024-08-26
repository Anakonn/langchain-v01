---
translated: true
---

# PremAI

>[PremAI](https://app.premai.io)는 사용자 경험과 전반적인 성장에 더 집중할 수 있도록 최소한의 노력으로 강력한 프로덕션 준비 GenAI 기반 애플리케이션을 구축할 수 있는 통합 플랫폼입니다.

## ChatPremAI

이 예제에서는 `ChatPremAI`를 사용하여 다양한 채팅 모델과 상호 작용하는 방법을 살펴봅니다.

### 설치 및 설정

먼저 langchain과 premai-sdk를 설치합니다. 다음 명령어를 입력하여 설치할 수 있습니다:

```bash
pip install premai langchain
```

계속 진행하기 전에 PremAI에 계정을 만들고 이미 프로젝트를 시작했는지 확인하세요. 그렇지 않다면 다음과 같이 무료로 시작할 수 있습니다:

1. [PremAI](https://app.premai.io/accounts/login/)에 로그인하고, 처음 오신 경우 [여기](https://app.premai.io/api_keys/)에서 API 키를 생성하세요.

2. [app.premai.io](https://app.premai.io)로 이동하면 프로젝트 대시보드로 이동합니다.

3. 프로젝트를 생성하면 프로젝트 ID(ID로 표시)가 생성됩니다. 이 ID를 사용하여 배포된 애플리케이션과 상호 작용할 수 있습니다.

4. LaunchPad(🚀 아이콘이 있는 곳)로 이동하여 원하는 모델을 배포하세요. 기본 모델은 `gpt-4`입니다. 생성 매개변수(최대 토큰, 온도 등)를 설정하고 시스템 프롬프트를 사전 설정할 수도 있습니다.

축하합니다! PremAI에 첫 번째 애플리케이션을 배포했습니다 🎉 이제 langchain을 사용하여 애플리케이션과 상호 작용할 수 있습니다.

```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "PremAI"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.system.SystemMessage.html", "title": "PremAI"}, {"imported": "ChatPremAI", "source": "langchain_community.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.premai.ChatPremAI.html", "title": "PremAI"}]-->
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.chat_models import ChatPremAI
```

### LangChain에서 ChatPrem 인스턴스 설정

필요한 모듈을 가져온 후 클라이언트를 설정합니다. 지금은 `project_id`가 8이라고 가정하겠지만, 반드시 자신의 프로젝트 ID를 사용해야 합니다.

langchain에서 prem을 사용하려면 모델 이름이나 매개변수를 전달할 필요가 없습니다. 모든 것이 LaunchPad 모델의 기본 모델 이름과 매개변수를 사용합니다.

`참고:` `model_name` 또는 `temperature`와 같은 다른 매개변수를 클라이언트 설정 시 전달하면 기존 기본 구성을 덮어씁니다.

```python
import os
import getpass

if "PREMAI_API_KEY" not in os.environ:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")

chat = ChatPremAI(project_id=8)
```

### 모델 호출

이제 모든 것이 준비되었습니다. 애플리케이션과 상호 작용할 수 있습니다. `ChatPremAI`는 `invoke`(생성과 동일) 및 `stream` 두 가지 메서드를 지원합니다.

첫 번째 메서드는 정적 결과를 제공하고, 두 번째 메서드는 토큰을 하나씩 스트리밍합니다. 채팅 스타일 완성을 생성하는 방법은 다음과 같습니다.

### 생성

```python
human_message = HumanMessage(content="Who are you?")

chat.invoke([human_message])
```

흥미롭네요, 그렇죠? 저는 기본 LaunchPad 시스템 프롬프트를 "항상 해적처럼 말하세요"로 설정했습니다. 필요한 경우 기본 시스템 프롬프트를 재정의할 수도 있습니다.

```python
system_message = SystemMessage(content="You are a friendly assistant.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

모델을 호출할 때 생성 매개변수를 변경할 수도 있습니다. 다음과 같이 할 수 있습니다:

```python
chat.invoke(
    [system_message, human_message],
    temperature = 0.7, max_tokens = 20, top_p = 0.95
)
```

### 중요 참고 사항:

계속 진행하기 전에 현재 ChatPrem 버전에서는 [n](https://platform.openai.com/docs/api-reference/chat/create#chat-create-n) 및 [stop](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stop) 매개변수를 지원하지 않는다는 점에 유의하세요.

향후 버전에서 이 두 매개변수를 지원할 예정입니다.

### 스트리밍

마지막으로 동적 채팅 애플리케이션을 위한 토큰 스트리밍 방법은 다음과 같습니다.

```python
import sys

for chunk in chat.stream("hello how are you"):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

위와 마찬가지로 시스템 프롬프트와 생성 매개변수를 재정의하려면 다음과 같이 할 수 있습니다.

```python
import sys

for chunk in chat.stream(
    "hello how are you",
    system_prompt = "You are an helpful assistant", temperature = 0.7, max_tokens = 20
):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

## 임베딩

이 섹션에서는 `PremEmbeddings`를 사용하여 다양한 임베딩 모델에 액세스하는 방법을 살펴보겠습니다. 먼저 필요한 모듈을 가져오고 임베딩 객체를 정의해 보겠습니다.

```python
from langchain_community.embeddings import PremEmbeddings
```

클라이언트를 설정했습니다. 지금은 `project_id`가 8이라고 가정하겠지만, 반드시 자신의 프로젝트 ID를 사용해야 합니다.

```python

import os
import getpass

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")

# Define a model as a required parameter here since there is no default embedding model

model = "text-embedding-3-large"
embedder = PremEmbeddings(project_id=8, model=model)
```

임베딩 모델을 정의했습니다. 다양한 임베딩 모델을 지원합니다. 지원되는 임베딩 모델 목록은 다음과 같습니다.

| 제공업체    | Slug                                     | 컨텍스트 토큰 |
|-------------|------------------------------------------|----------------|
| cohere      | embed-english-v3.0                       | N/A            |
| openai      | text-embedding-3-small                   | 8191           |
| openai      | text-embedding-3-large                   | 8191           |
| openai      | text-embedding-ada-002                   | 8191           |
| replicate   | replicate/all-mpnet-base-v2              | N/A            |
| together    | togethercomputer/Llama-2-7B-32K-Instruct | N/A            |
| mistralai   | mistral-embed                            | 4096           |

모델을 변경하려면 `slug`를 복사하고 해당 임베딩 모델에 액세스하면 됩니다. 이제 단일 쿼리와 다중 쿼리(문서라고도 함)로 임베딩 모델을 사용해 보겠습니다.

```python
query = "Hello, this is a test query"
query_result = embedder.embed_query(query)

# Let's print the first five elements of the query embedding vector

print(query_result[:5])
```

마지막으로 문서를 임베딩해 보겠습니다.

```python
documents = [
    "This is document1",
    "This is document2",
    "This is document3"
]

doc_result = embedder.embed_documents(documents)

# Similar to the previous result, let's print the first five element
# of the first document vector

print(doc_result[0][:5])
```
