---
translated: true
---

# OctoAI

[OctoAI](https://docs.octoai.cloud/docs)는 효율적인 컴퓨팅에 쉽게 접근할 수 있게 하고 사용자가 선택한 AI 모델을 애플리케이션에 통합할 수 있게 합니다. `OctoAI` 컴퓨팅 서비스는 AI 애플리케이션을 쉽게 실행, 튜닝 및 확장할 수 있게 해줍니다.

이 예제에서는 LangChain을 사용하여 `OctoAI` [LLM 엔드포인트](https://octoai.cloud/templates)와 상호 작용하는 방법을 살펴봅니다.

## 설정

예제 앱을 실행하려면 두 가지 간단한 단계를 수행하면 됩니다:

1. [OctoAI 계정 페이지](https://octoai.cloud/settings)에서 API 토큰을 가져옵니다.

2. 아래 코드 셀에 API 키를 붙여넣습니다.

참고: 다른 LLM 모델을 사용하려면 [Python에서 컨테이너 빌드하기](https://octo.ai/docs/bring-your-own-model/advanced-build-a-container-from-scratch-in-python) 및 [컨테이너에서 사용자 지정 엔드포인트 만들기](https://octo.ai/docs/bring-your-own-model/create-custom-endpoints-from-a-container/create-custom-endpoints-from-a-container)를 따라 모델을 컨테이너화하고 사용자 지정 OctoAI 엔드포인트를 만든 다음, `OCTOAI_API_BASE` 환경 변수를 업데이트하면 됩니다.

```python
import os

os.environ["OCTOAI_API_TOKEN"] = "OCTOAI_API_TOKEN"
```

```python
from langchain.chains import LLMChain
from langchain_community.llms.octoai_endpoint import OctoAIEndpoint
from langchain_core.prompts import PromptTemplate
```

## 예제

```python
template = """Below is an instruction that describes a task. Write a response that appropriately completes the request.\n Instruction:\n{question}\n Response: """
prompt = PromptTemplate.from_template(template)
```

```python
llm = OctoAIEndpoint(
    model="llama-2-13b-chat-fp16",
    max_tokens=200,
    presence_penalty=0,
    temperature=0.1,
    top_p=0.9,
)
```

```python
question = "Who was Leonardo da Vinci?"

llm_chain = LLMChain(prompt=prompt, llm=llm)

print(llm_chain.run(question))
```

레오나르도 다 빈치는 진정한 르네상스 인물이었습니다. 그는 1452년 이탈리아 빈치에서 태어났으며 예술, 과학, 공학, 수학 등 다양한 분야에서 활동했습니다. 그는 역사상 가장 위대한 화가 중 한 명으로 간주되며, 모나리자와 최후의 만찬이 가장 유명한 작품입니다. 예술 외에도 다 빈치는 공학과 해부학 분야에 큰 기여를 했으며, 그의 기계와 발명품 설계는 당시로서는 매우 앞서 있었습니다. 또한 그의 방대한 저널과 드로잉은 그의 사고와 아이디어를 이해하는 데 귀중한 정보를 제공합니다. 다 빈치의 유산은 오늘날 전 세계 예술가, 과학자, 사상가들에게 계속 영감을 주고 있습니다.
