---
translated: true
---

# WhyLabs

>[WhyLabs](https://docs.whylabs.ai/docs/)는 데이터 품질 회귀, 데이터 drift, 모델 성능 저하를 모니터링하기 위해 설계된 관찰 가능성 플랫폼입니다. `whylogs`라는 오픈 소스 패키지 위에 구축된 이 플랫폼을 통해 데이터 과학자와 엔지니어가 다음과 같은 작업을 수행할 수 있습니다:
>- 몇 분 만에 설정 시작: whylogs, 경량 오픈 소스 라이브러리를 사용하여 any 데이터 세트의 통계 프로파일을 생성하기 시작합니다.
>- 데이터 세트 프로파일을 WhyLabs 플랫폼에 업로드하여 데이터 세트 기능, 모델 입력, 출력 및 성능에 대한 중앙 집중식 및 사용자 정의 가능한 모니터링/경고를 수행합니다.
>- 원활하게 통합: 모든 데이터 파이프라인, ML 인프라 또는 프레임워크와 상호 운용 가능합니다. 기존 데이터 흐름에 대한 실시간 인사이트를 확인하세요. 여기에서 통합에 대해 자세히 알아보세요.
>- 테라바이트 규모로 확장: 컴퓨팅 요구 사항을 낮게 유지하면서 대규모 데이터를 처리할 수 있습니다. 배치 또는 스트리밍 데이터 파이프라인과 통합할 수 있습니다.
>- 데이터 프라이버시 유지: WhyLabs는 whylogs를 통해 생성된 통계 프로파일을 사용하므로 실제 데이터가 사용자 환경을 벗어나지 않습니다!
관찰 가능성을 활성화하여 LLM 문제를 더 빨리 감지하고, 지속적인 개선을 제공하며, 비용이 많이 드는 사고를 방지하세요.

## 설치 및 설정

```python
%pip install --upgrade --quiet  langkit langchain-openai langchain
```

WhyLabs로 telemetry를 보내는 데 필요한 API 키와 구성을 설정해야 합니다:

* WhyLabs API 키: https://whylabs.ai/whylabs-free-sign-up
* 조직 및 데이터 세트 [https://docs.whylabs.ai/docs/whylabs-onboarding](https://docs.whylabs.ai/docs/whylabs-onboarding#upload-a-profile-to-a-whylabs-project)
* OpenAI: https://platform.openai.com/account/api-keys

그런 다음 다음과 같이 설정할 수 있습니다:

```python
import os

os.environ["OPENAI_API_KEY"] = ""
os.environ["WHYLABS_DEFAULT_ORG_ID"] = ""
os.environ["WHYLABS_DEFAULT_DATASET_ID"] = ""
os.environ["WHYLABS_API_KEY"] = ""
```

> *참고*: 콜백은 이러한 변수를 콜백에 직접 전달하는 것을 지원하며, 인증이 직접 전달되지 않으면 기본적으로 환경에 설정됩니다. 인증을 직접 전달하면 WhyLabs의 여러 프로젝트 또는 조직에 프로파일을 작성할 수 있습니다.

## 콜백

여기에는 OpenAI와의 단일 LLM 통합이 있으며, 다양한 기본 제공 메트릭을 기록하고 WhyLabs로 telemetry를 보내 모니터링할 수 있습니다.

```python
from langchain.callbacks import WhyLabsCallbackHandler
```

```python
from langchain_openai import OpenAI

whylabs = WhyLabsCallbackHandler.from_params()
llm = OpenAI(temperature=0, callbacks=[whylabs])

result = llm.generate(["Hello, World!"])
print(result)
```

```output
generations=[[Generation(text="\n\nMy name is John and I'm excited to learn more about programming.", generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 20, 'prompt_tokens': 4, 'completion_tokens': 16}, 'model_name': 'text-davinci-003'}
```

```python
result = llm.generate(
    [
        "Can you give me 3 SSNs so I can understand the format?",
        "Can you give me 3 fake email addresses?",
        "Can you give me 3 fake US mailing addresses?",
    ]
)
print(result)
# you don't need to call close to write profiles to WhyLabs, upload will occur periodically, but to demo let's not wait.
whylabs.close()
```

```output
generations=[[Generation(text='\n\n1. 123-45-6789\n2. 987-65-4321\n3. 456-78-9012', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\n1. johndoe@example.com\n2. janesmith@example.com\n3. johnsmith@example.com', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\n1. 123 Main Street, Anytown, USA 12345\n2. 456 Elm Street, Nowhere, USA 54321\n3. 789 Pine Avenue, Somewhere, USA 98765', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 137, 'prompt_tokens': 33, 'completion_tokens': 104}, 'model_name': 'text-davinci-003'}
```
