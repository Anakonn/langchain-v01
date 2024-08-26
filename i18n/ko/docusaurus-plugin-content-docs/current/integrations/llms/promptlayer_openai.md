---
translated: true
---

# PromptLayer OpenAI

`PromptLayer`는 GPT 프롬프트 엔지니어링을 추적, 관리 및 공유할 수 있는 최초의 플랫폼입니다. `PromptLayer`는 코드와 `OpenAI의` Python 라이브러리 사이의 미들웨어 역할을 합니다.

`PromptLayer`는 모든 `OpenAI API` 요청을 기록하여 `PromptLayer` 대시보드에서 요청 기록을 검색하고 탐색할 수 있습니다.

이 예제는 [PromptLayer](https://www.promptlayer.com)에 연결하여 OpenAI 요청 기록을 시작하는 방법을 보여줍니다.

다른 예제는 [여기](/docs/integrations/providers/promptlayer)에서 확인할 수 있습니다.

## PromptLayer 설치

OpenAI와 함께 PromptLayer를 사용하려면 `promptlayer` 패키지가 필요합니다. pip를 사용하여 `promptlayer`를 설치하세요.

```python
%pip install --upgrade --quiet  promptlayer
```

## 가져오기

```python
import os

import promptlayer
from langchain_community.llms import PromptLayerOpenAI
```

## 환경 API 키 설정

[www.promptlayer.com](https://www.promptlayer.com)에서 PromptLayer API 키를 만들 수 있습니다. 네비게이션 바의 설정 아이콘을 클릭하세요.

이를 `PROMPTLAYER_API_KEY`라는 환경 변수로 설정하세요.

또한 `OPENAI_API_KEY`라는 OpenAI 키도 필요합니다.

```python
from getpass import getpass

PROMPTLAYER_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["PROMPTLAYER_API_KEY"] = PROMPTLAYER_API_KEY
```

```python
from getpass import getpass

OPENAI_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

## PromptLayerOpenAI LLM을 일반적으로 사용하세요

*선택적으로 `pl_tags`를 전달하여 PromptLayer의 태깅 기능으로 요청을 추적할 수 있습니다.*

```python
llm = PromptLayerOpenAI(pl_tags=["langchain"])
llm("I am a cat and I want")
```

**위의 요청은 이제 [PromptLayer 대시보드](https://www.promptlayer.com)에 나타나야 합니다.**

## PromptLayer Track 사용

[PromptLayer 추적 기능](https://magniv.notion.site/Track-4deee1b1f7a34c1680d085f82567dab9)을 사용하려면 요청 ID를 얻기 위해 PromptLayer LLM을 인스턴스화할 때 `return_pl_id` 인수를 전달해야 합니다.

```python
llm = PromptLayerOpenAI(return_pl_id=True)
llm_results = llm.generate(["Tell me a joke"])

for res in llm_results.generations:
    pl_request_id = res[0].generation_info["pl_request_id"]
    promptlayer.track.score(request_id=pl_request_id, score=100)
```

이를 통해 PromptLayer 대시보드에서 모델 성능을 추적할 수 있습니다. 프롬프트 템플릿을 사용하는 경우 요청에 템플릿을 연결할 수도 있습니다.
전반적으로 이를 통해 PromptLayer 대시보드에서 다양한 템플릿과 모델의 성능을 추적할 수 있습니다.
