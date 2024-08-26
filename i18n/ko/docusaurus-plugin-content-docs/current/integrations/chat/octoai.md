---
translated: true
---

# ChatOctoAI

[OctoAI](https://docs.octoai.cloud/docs)는 효율적인 컴퓨팅에 쉽게 접근할 수 있게 하며, 사용자가 AI 모델을 애플리케이션에 통합할 수 있도록 지원합니다. `OctoAI` 컴퓨팅 서비스는 AI 애플리케이션을 쉽게 실행, 튜닝 및 확장할 수 있도록 도와줍니다.

이 노트북은 [OctoAI 엔드포인트](https://octoai.cloud/text)를 위한 `langchain.chat_models.ChatOctoAI`의 사용 예시를 보여줍니다.

## 설정

예제 앱을 실행하기 위해 두 가지 간단한 단계가 필요합니다:

1. [OctoAI 계정 페이지](https://octoai.cloud/settings)에서 API 토큰을 받습니다.
2. 아래 코드 셀에 API 토큰을 붙여넣거나 `octoai_api_token` 키워드 인수를 사용합니다.

참고: [사용 가능한 모델](https://octoai.cloud/text?selectedTags=Chat) 외의 다른 모델을 사용하려면, [Python에서 컨테이너 빌드하기](https://octo.ai/docs/bring-your-own-model/advanced-build-a-container-from-scratch-in-python) 및 [컨테이너에서 사용자 정의 엔드포인트 생성하기](https://octo.ai/docs/bring-your-own-model/create-custom-endpoints-from-a-container/create-custom-endpoints-from-a-container)를 따라 모델을 컨테이너화하고 사용자 정의 OctoAI 엔드포인트를 생성한 다음 `OCTOAI_API_BASE` 환경 변수를 업데이트하면 됩니다.

```python
import os

os.environ["OCTOAI_API_TOKEN"] = "OCTOAI_API_TOKEN"
```

```python
from langchain_community.chat_models import ChatOctoAI
from langchain_core.messages import HumanMessage, SystemMessage
```

## 예제

```python
chat = ChatOctoAI(max_tokens=300, model_name="mixtral-8x7b-instruct")
```

```python
messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Tell me about Leonardo da Vinci briefly."),
]
print(chat(messages).content)
```

```output
Leonardo da Vinci (1452-1519) was an Italian polymath who is often considered one of the greatest painters in history. However, his genius extended far beyond art. He was also a scientist, inventor, mathematician, engineer, anatomist, geologist, and cartographer.

Da Vinci is best known for his paintings such as the Mona Lisa, The Last Supper, and The Virgin of the Rocks. His scientific studies were ahead of his time, and his notebooks contain detailed drawings and descriptions of various machines, human anatomy, and natural phenomena.

Despite never receiving a formal education, da Vinci's insatiable curiosity and observational skills made him a pioneer in many fields. His work continues to inspire and influence artists, scientists, and thinkers today.
```