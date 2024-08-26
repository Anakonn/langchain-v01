---
sidebar_label: Azure ML Endpoint
translated: true
---

# AzureMLChatOnlineEndpoint

> [Azure Machine Learning](https://azure.microsoft.com/en-us/products/machine-learning/)은 머신 러닝 모델을 구축, 훈련 및 배포하는 플랫폼입니다. 사용자는 다양한 제공자의 기초 및 범용 모델을 제공하는 모델 카탈로그에서 배포할 모델 유형을 탐색할 수 있습니다.
>
> 일반적으로 예측(추론)을 소비하려면 모델을 배포해야 합니다. `Azure Machine Learning`에서는 [Online Endpoints](https://learn.microsoft.com/en-us/azure/machine-learning/concept-endpoints)를 사용하여 이러한 모델을 실시간 서비스로 배포합니다. 이 엔드포인트는 생산 작업의 인터페이스를 제공하는 `Endpoints`와 이를 제공하는 구현을 분리하는 `Deployments` 개념을 기반으로 합니다.

이 노트북에서는 `Azure Machine Learning Endpoint`에 호스팅된 채팅 모델을 사용하는 방법을 설명합니다.

```python
from langchain_community.chat_models.azureml_endpoint import AzureMLChatOnlineEndpoint
```

## 설정

모델을 [Azure ML에 배포](https://learn.microsoft.com/en-us/azure/machine-learning/how-to-use-foundation-models?view=azureml-api-2#deploying-foundation-models-to-endpoints-for-inferencing)하거나 [Azure AI 스튜디오에 배포](https://learn.microsoft.com/en-us/azure/ai-studio/how-to/deploy-models-open)하고 다음 매개변수를 얻어야 합니다:

- `endpoint_url`: 엔드포인트에서 제공하는 REST 엔드포인트 URL.
- `endpoint_api_type`: **전용 엔드포인트**에 모델을 배포할 때 `endpoint_type='dedicated'`을 사용합니다 (호스팅된 관리 인프라). **사용한 만큼 요금제**를 사용하여 모델을 배포할 때 `endpoint_type='serverless'`를 사용합니다 (서비스로서의 모델).
- `endpoint_api_key`: 엔드포인트에서 제공한 API 키

## 콘텐츠 포맷터

`content_formatter` 매개변수는 AzureML 엔드포인트의 요청 및 응답을 필요한 스키마에 맞게 변환하는 핸들러 클래스입니다. 모델 카탈로그에는 다양한 모델이 있으며, 각 모델이 데이터를 처리하는 방식이 다를 수 있으므로, 사용자가 데이터를 원하는 대로 변환할 수 있도록 `ContentFormatterBase` 클래스가 제공됩니다. 다음과 같은 콘텐츠 포맷터가 제공됩니다:

- `CustomOpenAIChatContentFormatter`: OpenAI API 사양에 따라 요청 및 응답 데이터를 형식화하는 LLaMa2-chat과 같은 모델에 대한 요청 및 응답 데이터를 형식화합니다.

_참고: `langchain.chat_models.azureml_endpoint.LlamaChatContentFormatter`는 `langchain.chat_models.azureml_endpoint.CustomOpenAIChatContentFormatter`로 대체될 예정입니다._

모델에 특정한 사용자 정의 콘텐츠 포맷터를 `langchain_community.llms.azureml_endpoint.ContentFormatterBase` 클래스를 상속하여 구현할 수 있습니다.

## 예제

다음 섹션에는 이 클래스를 사용하는 예제가 포함되어 있습니다:

### 예제: 실시간 엔드포인트를 사용한 채팅 완성

```python
from langchain_community.chat_models.azureml_endpoint import (
    AzureMLEndpointApiType,
    CustomOpenAIChatContentFormatter,
)
from langchain_core.messages import HumanMessage

chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/score",
    endpoint_api_type=AzureMLEndpointApiType.dedicated,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter(),
)
response = chat.invoke(
    [HumanMessage(content="콜라츠 추측이 해결될까요?")]
)
response
```

```output
AIMessage(content='  콜라츠 추측은 수학에서 가장 유명한 미해결 문제 중 하나로, 오랫동안 많은 연구와 연구의 대상이 되어왔습니다. 추측이 해결될 것인지 여부를 확실히 예측하는 것은 불가능하지만, 이것이 도전적이고 중요한 문제로 간주되는 몇 가지 이유가 있습니다:\n\n1. 간단하지만 어려운: 콜라츠 추측은 기만적으로 간단한 진술이지만 증명하거나 반증하기가 매우 어렵습니다. 그 단순함에도 불구하고, 이 추측은 수학의 가장 밝은 마음들 중 일부를 피하고 있으며, 여전히 이 분야에서 가장 유명한 열린 문제 중 하나입니다.\n2. 광범위한 함의: 콜라츠 추측은 수 이론, 대수학 및 분석을 포함한 수학의 많은 분야에 광범위한 영향을 미칩니다. 이 추측에 대한 해결책은 이러한 분야에 중요한 영향을 미칠 수 있으며, 새로운 통찰력과 발견으로 이어질 수 있습니다.\n3. 계산적 증거: 이 추측은 여전히 증명되지 않았지만, 광범위한 계산적 증거가 그 타당성을 뒷받침합니다. 사실, 시작 값이 2^64 (숫자)를 초과하지 않는 한, 이 추측에 대한 반례가 발견되지 않았습니다.', additional_kwargs={}, example=False)
```

### 예제: 사용한 만큼 요금제 배포를 사용한 채팅 완성 (서비스로서의 모델)

```python
chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/v1/chat/completions",
    endpoint_api_type=AzureMLEndpointApiType.serverless,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter,
)
response = chat.invoke(
    [HumanMessage(content="콜라츠 추측이 해결될까요?")]
)
response
```

추가 매개변수를 모델에 전달해야 하는 경우 `model_kwargs` 인수를 사용하십시오:

```python
chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/v1/chat/completions",
    endpoint_api_type=AzureMLEndpointApiType.serverless,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter,
    model_kwargs={"temperature": 0.8},
)
```

매개변수는 호출 중에도 전달할 수 있습니다:

```python
response = chat.invoke(
    [HumanMessage(content="콜라츠 추측이 해결될까요?")],
    max_tokens=512,
)
response
```