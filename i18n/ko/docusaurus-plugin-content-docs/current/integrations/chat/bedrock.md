---
sidebar_label: Bedrock
translated: true
---

# ChatBedrock

> [Amazon Bedrock](https://aws.amazon.com/bedrock/)는 `AI21 Labs`, `Anthropic`, `Cohere`, `Meta`, `Stability AI`, `Amazon` 등 주요 AI 회사의 고성능 기초 모델(FMs)을 단일 API를 통해 제공하는 완전 관리형 서비스입니다. 또한, 보안, 프라이버시 및 책임 있는 AI를 갖춘 생성형 AI 애플리케이션을 구축하는 데 필요한 광범위한 기능을 제공합니다. `Amazon Bedrock`을 사용하면 사용 사례에 맞는 최고 FMs를 쉽게 실험하고 평가할 수 있으며, 세밀 조정 및 `Retrieval Augmented Generation`(`RAG`)과 같은 기술을 사용하여 데이터를 사용하여 모델을 맞춤화하고, 기업 시스템 및 데이터 소스를 사용하여 작업을 수행하는 에이전트를 구축할 수 있습니다. `Amazon Bedrock`은 서버리스이므로 인프라를 관리할 필요가 없으며, 이미 익숙한 AWS 서비스를 사용하여 애플리케이션에 생성형 AI 기능을 안전하게 통합하고 배포할 수 있습니다.

```python
%pip install --upgrade --quiet  langchain-aws
```

```output
Note: you may need to restart the kernel to use updated packages.
```

```python
from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage
```

```python
chat = ChatBedrock(
    model_id="anthropic.claude-3-sonnet-20240229-v1:0",
    model_kwargs={"temperature": 0.1},
)
```

```python
messages = [
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    )
]
chat.invoke(messages)
```

```output
AIMessage(content="Voici la traduction en français :\n\nJ'aime la programmation.", additional_kwargs={'usage': {'prompt_tokens': 20, 'completion_tokens': 21, 'total_tokens': 41}}, response_metadata={'model_id': 'anthropic.claude-3-sonnet-20240229-v1:0', 'usage': {'prompt_tokens': 20, 'completion_tokens': 21, 'total_tokens': 41}}, id='run-994f0362-0e50-4524-afad-3c4f5bb11328-0')
```

### 스트리밍

응답을 스트리밍하려면 실행 가능한 `.stream()` 메서드를 사용할 수 있습니다.

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
Voici la traduction en français :

J'aime la programmation.
```