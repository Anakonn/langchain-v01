---
sidebar_label: Azure OpenAI
translated: true
---

# AzureChatOpenAI

> [Azure OpenAI 서비스](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview)는 GPT-4, GPT-3.5-Turbo 및 Embeddings 모델 시리즈를 포함한 OpenAI의 강력한 언어 모델에 대한 REST API 액세스를 제공합니다. 이러한 모델은 콘텐츠 생성, 요약, 시맨틱 검색, 자연어 코드 번역 등 특정 작업에 쉽게 적응할 수 있습니다. 사용자는 REST API, Python SDK 또는 Azure OpenAI Studio의 웹 기반 인터페이스를 통해 서비스를 이용할 수 있습니다.

이 노트북에서는 Azure에 호스팅된 OpenAI 엔드포인트에 연결하는 방법을 설명합니다. 먼저 `langchain-openai` 패키지를 설치해야 합니다.
%pip install -qU langchain-openai
다음으로, Azure OpenAI 서비스에 연결하는 데 도움이 되는 환경 변수를 설정해 보겠습니다. 이러한 값은 Azure 포털에서 찾을 수 있습니다.

```python
import os

os.environ["AZURE_OPENAI_API_KEY"] = "..."
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://<your-endpoint>.openai.azure.com/"
os.environ["AZURE_OPENAI_API_VERSION"] = "2023-06-01-preview"
os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"] = "chat"
```

다음으로, 모델을 구성하고 대화를 시작해 보겠습니다:

```python
from langchain_core.messages import HumanMessage
from langchain_openai import AzureChatOpenAI

model = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"],
)
```

```python
message = HumanMessage(
    content="Translate this sentence from English to French. I love programming."
)
model.invoke([message])
```

```output
AIMessage(content="J'adore programmer.", response_metadata={'token_usage': {'completion_tokens': 6, 'prompt_tokens': 19, 'total_tokens': 25}, 'model_name': 'gpt-35-turbo', 'system_fingerprint': None, 'prompt_filter_results': [{'prompt_index': 0, 'content_filter_results': {'hate': {'filtered': False, 'severity': 'safe'}, 'self_harm': {'filtered': False, 'severity': 'safe'}, 'sexual': {'filtered': False, 'severity': 'safe'}, 'violence': {'filtered': False, 'severity': 'safe'}}}], 'finish_reason': 'stop', 'logprobs': None, 'content_filter_results': {'hate': {'filtered': False, 'severity': 'safe'}, 'self_harm': {'filtered': False, 'severity': 'safe'}, 'sexual': {'filtered': False, 'severity': 'safe'}, 'violence': {'filtered': False, 'severity': 'safe'}}}, id='run-25ed88db-38f2-4b0c-a943-a03f217711a9-0')
```

## 모델 버전

Azure OpenAI 응답에는 사용된 모델의 이름을 나타내는 `model` 속성이 포함되어 있습니다. 그러나 원래 OpenAI 응답과 달리 Azure 배포에서 설정된 모델 버전이 포함되어 있지 않습니다. 이로 인해 응답을 생성하는 데 사용된 모델 버전을 알기 어려워져, 예를 들어 `OpenAICallbackHandler`를 사용한 잘못된 총 비용 계산 등의 문제가 발생할 수 있습니다.

이 문제를 해결하기 위해 `AzureChatOpenAI` 클래스에 `model_version` 매개변수를 전달할 수 있으며, 이는 llm 출력에 모델 이름에 추가됩니다. 이렇게 하면 서로 다른 모델 버전을 쉽게 구별할 수 있습니다.

```python
from langchain.callbacks import get_openai_callback
```

```python
model = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"],  # Azure에서 이 배포는 버전 0613을 가지고 있으며, 입력 및 출력 토큰은 별도로 계산됩니다
)
with get_openai_callback() as cb:
    model.invoke([message])
    print(f"Total Cost (USD): ${format(cb.total_cost, '.6f')}")  # 모델 버전을 지정하지 않으면 입력 및 출력 토큰 당 1k 당 0.002 USD의 고정 요금이 적용됩니다.
```

```output
Total Cost (USD): $0.000041
```

우리는 `AzureChatOpenAI` 생성자에 모델 버전을 제공할 수 있습니다. 이렇게 하면 Azure OpenAI에서 반환된 모델 이름에 추가되고 비용이 정확하게 계산됩니다.

```python
model0301 = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"],
    model_version="0301",
)
with get_openai_callback() as cb:
    model0301.invoke([message])
    print(f"Total Cost (USD): ${format(cb.total_cost, '.6f')}")
```

```output
Total Cost (USD): $0.000044
```