---
translated: true
---

# 바세텐

>[바세텐](https://baseten.co)은 ML 모델을 성능, 확장성 및 비용 효율적으로 배포하고 제공할 수 있는 모든 인프라를 제공하는 업체입니다.

>모델 추론 플랫폼으로서 `바세텐`은 LangChain 생태계의 `Provider`입니다.
`바세텐` 통합은 현재 LLMs라는 단일 `Component`를 구현하고 있지만, 더 많은 것들이 계획되어 있습니다!

>`바세텐`을 통해 Llama 2 또는 Mistral과 같은 오픈 소스 모델과 전용 GPU에서 독점 또는 fine-tuned 모델을 실행할 수 있습니다. OpenAI와 같은 공급자를 사용하는 경우 바세텐 사용에는 몇 가지 차이점이 있습니다:

>* 토큰당 지불하는 대신 사용된 GPU 분당 지불합니다.
>* 바세텐의 모든 모델은 최대 사용자 정의를 위해 [Truss](https://truss.baseten.co/welcome)라는 오픈 소스 모델 패키징 프레임워크를 사용합니다.
>* [OpenAI ChatCompletions 호환 모델](https://docs.baseten.co/api-reference/openai)이 있지만 `Truss`를 사용하여 자체 I/O 사양을 정의할 수 있습니다.

>[모델 ID와 배포에 대해 자세히 알아보세요](https://docs.baseten.co/deploy/lifecycle).

>바세텐에 대해 자세히 알아보려면 [바세텐 문서](https://docs.baseten.co/)를 참조하세요.

## 설치 및 설정

바세텐 모델을 LangChain과 함께 사용하려면 다음 두 가지가 필요합니다:

- [바세텐 계정](https://baseten.co)
- [API 키](https://docs.baseten.co/observability/api-keys)

API 키를 `BASETEN_API_KEY`라는 환경 변수로 내보내세요.

```sh
export BASETEN_API_KEY="paste_your_api_key_here"
```

## LLMs

[사용 예제](/docs/integrations/llms/baseten)를 참조하세요.

```python
<!--IMPORTS:[{"imported": "Baseten", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.baseten.Baseten.html", "title": "Baseten"}]-->
from langchain_community.llms import Baseten
```
