---
translated: true
---

# SambaNova

**[SambaNova](https://sambanova.ai/)**의 [Sambaverse](https://sambaverse.sambanova.ai/) 및 [Sambastudio](https://sambanova.ai/technology/full-stack-ai-platform)는 자신만의 오픈 소스 모델을 실행할 수 있는 플랫폼입니다.

이 예제에서는 LangChain을 사용하여 SambaNova 모델과 상호 작용하는 방법을 설명합니다.

## Sambaverse

**Sambaverse**를 사용하면 여러 오픈 소스 모델과 상호 작용할 수 있습니다. [playground](https://sambaverse.sambanova.ai/playground)에서 사용 가능한 모델 목록을 확인하고 상호 작용할 수 있습니다. **Sambaverse의 무료 제공은 성능이 제한됩니다.** 생산 토큰 당 초당 성능, 볼륨 처리량 및 총 소유 비용(TCO)이 10배 낮은 SambaNova를 평가할 준비가 된 기업은 [문의](https://sambaverse.sambanova.ai/contact-us)하여 제한이 없는 평가 인스턴스를 받을 수 있습니다.

Sambaverse 모델에 액세스하려면 API 키가 필요합니다. 키를 받으려면 [sambaverse.sambanova.ai](https://sambaverse.sambanova.ai/)에서 계정을 만드세요.

스트리밍 예측을 실행하려면 [sseclient-py](https://pypi.org/project/sseclient-py/) 패키지가 필요합니다.

```python
%pip install --quiet sseclient-py==1.8.0
```

API 키를 환경 변수로 등록하세요:

```python
import os

sambaverse_api_key = "<Your sambaverse API key>"

# Set the environment variables
os.environ["SAMBAVERSE_API_KEY"] = sambaverse_api_key
```

LangChain에서 Sambaverse 모델을 직접 호출하세요!

```python
from langchain_community.llms.sambanova import Sambaverse

llm = Sambaverse(
    sambaverse_model_name="Meta/llama-2-7b-chat-hf",
    streaming=False,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        "process_prompt": True,
        "select_expert": "llama-2-7b-chat-hf",
        # "repetition_penalty": {"type": "float", "value": "1"},
        # "top_k": {"type": "int", "value": "50"},
        # "top_p": {"type": "float", "value": "1"}
    },
)

print(llm.invoke("Why should I use open source models?"))
```

## SambaStudio

**SambaStudio**를 사용하면 자신이 미세 조정한 오픈 소스 모델을 학습, 일괄 추론 작업 실행 및 온라인 추론 엔드포인트에 배포할 수 있습니다.

모델을 배포하려면 SambaStudio 환경이 필요합니다. 자세한 내용은 [sambanova.ai/products/enterprise-ai-platform-sambanova-suite](https://sambanova.ai/products/enterprise-ai-platform-sambanova-suite)에서 확인하세요.

스트리밍 예측을 실행하려면 [sseclient-py](https://pypi.org/project/sseclient-py/) 패키지가 필요합니다.

```python
%pip install --quiet sseclient-py==1.8.0
```

환경 변수를 등록하세요:

```python
import os

sambastudio_base_url = "<Your SambaStudio environment URL>"
sambastudio_project_id = "<Your SambaStudio project id>"
sambastudio_endpoint_id = "<Your SambaStudio endpoint id>"
sambastudio_api_key = "<Your SambaStudio endpoint API key>"

# Set the environment variables
os.environ["SAMBASTUDIO_BASE_URL"] = sambastudio_base_url
os.environ["SAMBASTUDIO_PROJECT_ID"] = sambastudio_project_id
os.environ["SAMBASTUDIO_ENDPOINT_ID"] = sambastudio_endpoint_id
os.environ["SAMBASTUDIO_API_KEY"] = sambastudio_api_key
```

LangChain에서 SambaStudio 모델을 직접 호출하세요!

```python
from langchain_community.llms.sambanova import SambaStudio

llm = SambaStudio(
    streaming=False,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        # "repetition_penalty": {"type": "float", "value": "1"},
        # "top_k": {"type": "int", "value": "50"},
        # "top_logprobs": {"type": "int", "value": "0"},
        # "top_p": {"type": "float", "value": "1"}
    },
)

print(llm.invoke("Why should I use open source models?"))
```
