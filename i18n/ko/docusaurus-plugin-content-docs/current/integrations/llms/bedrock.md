---
translated: true
---

# 베드록

>[Amazon Bedrock](https://aws.amazon.com/bedrock/)은 `AI21 Labs`, `Anthropic`, `Cohere`, `Meta`, `Stability AI`, `Amazon` 등 선도적인 AI 기업의 고성능 기반 모델(FM)을 단일 API를 통해 제공하는 완전 관리형 서비스입니다. 또한 보안, 프라이버시 및 책임감 있는 AI를 위한 광범위한 기능을 제공합니다. `Amazon Bedrock`을 사용하면 사용 사례에 적합한 최상위 FM을 쉽게 실험하고 평가할 수 있으며, 파인튜닝 및 `Retrieval Augmented Generation`(`RAG`) 등의 기술을 사용하여 사용자 데이터로 비공개로 사용자 지정할 수 있습니다. 또한 기업 시스템 및 데이터 소스를 사용하여 작업을 수행하는 에이전트를 구축할 수 있습니다. `Amazon Bedrock`은 서버리스이므로 인프라를 관리할 필요가 없으며, 이미 익숙한 AWS 서비스를 사용하여 생성 AI 기능을 안전하게 통합하고 배포할 수 있습니다.

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.llms import Bedrock

llm = Bedrock(
    credentials_profile_name="bedrock-admin", model_id="amazon.titan-text-express-v1"
)
```

### 대화 체인에서 사용하기

```python
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

conversation = ConversationChain(
    llm=llm, verbose=True, memory=ConversationBufferMemory()
)

conversation.predict(input="Hi there!")
```

### 스트리밍이 포함된 대화 체인

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import Bedrock

llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    model_id="amazon.titan-text-express-v1",
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
```

```python
conversation = ConversationChain(
    llm=llm, verbose=True, memory=ConversationBufferMemory()
)

conversation.predict(input="Hi there!")
```

### 사용자 지정 모델

```python
custom_llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    provider="cohere",
    model_id="<Custom model ARN>",  # ARN like 'arn:aws:bedrock:...' obtained via provisioning the custom model
    model_kwargs={"temperature": 1},
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)

conversation = ConversationChain(
    llm=custom_llm, verbose=True, memory=ConversationBufferMemory()
)
conversation.predict(input="What is the recipe of mayonnaise?")
```

### Amazon Bedrock 예제의 가드레일

## Amazon Bedrock(미리 보기)의 가드레일

[Amazon Bedrock의 가드레일](https://aws.amazon.com/bedrock/guardrails/)은 사용 사례별 정책을 기반으로 사용자 입력과 모델 응답을 평가하며, 기본 모델에 관계없이 추가적인 안전장치를 제공합니다. 가드레일은 Anthropic Claude, Meta Llama 2, Cohere Command, AI21 Labs Jurassic, Amazon Titan Text 등의 모델과 사용자 지정 모델에 적용할 수 있습니다.
**참고**: Amazon Bedrock의 가드레일은 현재 미리 보기 단계이며 일반적으로 제공되지 않습니다. 이 기능에 대한 액세스를 원하시면 일반적인 AWS 지원 담당자에게 문의하시기 바랍니다.
이 섹션에서는 추적 기능을 포함한 특정 가드레일이 적용된 Bedrock 언어 모델을 설정할 것입니다.

```python
from typing import Any

from langchain_core.callbacks import AsyncCallbackHandler


class BedrockAsyncCallbackHandler(AsyncCallbackHandler):
    # Async callback handler that can be used to handle callbacks from langchain.

    async def on_llm_error(self, error: BaseException, **kwargs: Any) -> Any:
        reason = kwargs.get("reason")
        if reason == "GUARDRAIL_INTERVENED":
            print(f"Guardrails: {kwargs}")


# Guardrails for Amazon Bedrock with trace
llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    model_id="<Model_ID>",
    model_kwargs={},
    guardrails={"id": "<Guardrail_ID>", "version": "<Version>", "trace": True},
    callbacks=[BedrockAsyncCallbackHandler()],
)
```
