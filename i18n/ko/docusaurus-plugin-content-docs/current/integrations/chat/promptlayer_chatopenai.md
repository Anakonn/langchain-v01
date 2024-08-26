---
sidebar_label: PromptLayer ChatOpenAI
translated: true
---

# PromptLayerChatOpenAI

이 예제는 [PromptLayer](https://www.promptlayer.com)에 연결하여 ChatOpenAI 요청을 기록하는 방법을 보여줍니다.

## PromptLayer 설치

OpenAI와 함께 PromptLayer를 사용하려면 `promptlayer` 패키지가 필요합니다. pip을 사용하여 `promptlayer`를 설치합니다.

```python
pip install promptlayer
```

## 가져오기

```python
import os

from langchain_community.chat_models import PromptLayerChatOpenAI
from langchain_core.messages import HumanMessage
```

## 환경 API 키 설정

네비게이션 바의 설정 아이콘을 클릭하여 [www.promptlayer.com](https://www.promptlayer.com)에서 PromptLayer API 키를 생성할 수 있습니다.

이 키를 `PROMPTLAYER_API_KEY`라는 환경 변수로 설정합니다.

```python
os.environ["PROMPTLAYER_API_KEY"] = "**********"
```

## PromptLayerOpenAI LLM을 일반적으로 사용

_원하는 경우 `pl_tags`를 전달하여 PromptLayer의 태그 기능으로 요청을 추적할 수 있습니다._

```python
chat = PromptLayerChatOpenAI(pl_tags=["langchain"])
chat([HumanMessage(content="I am a cat and I want")])
```

```output
AIMessage(content='to take a nap in a cozy spot. I search around for a suitable place and finally settle on a soft cushion on the window sill. I curl up into a ball and close my eyes, relishing the warmth of the sun on my fur. As I drift off to sleep, I can hear the birds chirping outside and feel the gentle breeze blowing through the window. This is the life of a contented cat.', additional_kwargs={})
```

**위 요청은 이제 [PromptLayer 대시보드](https://www.promptlayer.com)에 나타나야 합니다.**

## PromptLayer Track 사용

[PromptLayer 추적 기능](https://magniv.notion.site/Track-4deee1b1f7a34c1680d085f82567dab9)을 사용하려면 PromptLayer LLM을 인스턴스화할 때 `return_pl_id` 인수를 전달하여 요청 ID를 가져와야 합니다.

```python
import promptlayer

chat = PromptLayerChatOpenAI(return_pl_id=True)
chat_results = chat.generate([[HumanMessage(content="I am a cat and I want")]])

for res in chat_results.generations:
    pl_request_id = res[0].generation_info["pl_request_id"]
    promptlayer.track.score(request_id=pl_request_id, score=100)
```

이를 사용하면 PromptLayer 대시보드에서 모델의 성능을 추적할 수 있습니다. 프롬프트 템플릿을 사용하는 경우, 템플릿을 요청에 연결할 수도 있습니다. 전체적으로 이는 PromptLayer 대시보드에서 다양한 템플릿과 모델의 성능을 추적할 수 있는 기회를 제공합니다.