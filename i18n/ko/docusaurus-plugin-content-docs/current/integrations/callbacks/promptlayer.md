---
translated: true
---

# PromptLayer

> [PromptLayer](https://docs.promptlayer.com/introduction)은 프롬프트 엔지니어링을 위한 플랫폼입니다. 요청을 시각화하고, 프롬프트 버전을 관리하며, 사용량을 추적하는 LLM 가시성 도구를 제공합니다.
>
> `PromptLayer`는 LangChain과 직접 통합되는 LLM을 제공하지만, 콜백을 사용하는 것이 `PromptLayer`를 LangChain과 통합하는 권장 방법입니다.

이 가이드에서는 `PromptLayerCallbackHandler`를 설정하는 방법을 다룹니다.

더 많은 정보는 [PromptLayer 문서](https://docs.promptlayer.com/languages/langchain)를 참조하세요.

## 설치 및 설정

```python
%pip install --upgrade --quiet promptlayer
```

### API 자격 증명 얻기

PromptLayer 계정이 없다면 [promptlayer.com](https://www.promptlayer.com)에서 계정을 생성하세요. 그런 다음 네비게이션 바의 설정 아이콘을 클릭하여 API 키를 얻고, 이를 `PROMPTLAYER_API_KEY`라는 환경 변수로 설정합니다.

## 사용법

`PromptLayerCallbackHandler`를 사용하는 것은 매우 간단합니다. 두 개의 선택적 인수를 받을 수 있습니다:

1. `pl_tags` - PromptLayer에서 태그로 추적될 문자열 리스트 (선택적).
2. `pl_id_callback` - `promptlayer_request_id`를 인수로 받는 선택적 함수. 이 ID는 PromptLayer의 모든 추적 기능과 함께 메타데이터, 점수 및 프롬프트 사용량을 추적하는 데 사용할 수 있습니다.

## 간단한 OpenAI 예제

이 간단한 예제에서는 `PromptLayerCallbackHandler`를 `ChatOpenAI`와 함께 사용합니다. `chatopenai`라는 PromptLayer 태그를 추가합니다.

```python
import promptlayer  # 잊지 말고 추가하세요 🍰
from langchain_community.callbacks.promptlayer_callback import (
    PromptLayerCallbackHandler,
)
```

```python
from langchain.schema import (
    HumanMessage,
)
from langchain_openai import ChatOpenAI

chat_llm = ChatOpenAI(
    temperature=0,
    callbacks=[PromptLayerCallbackHandler(pl_tags=["chatopenai"])],
)
llm_results = chat_llm.invoke(
    [
        HumanMessage(content="What comes after 1,2,3 ?"),
        HumanMessage(content="Tell me another joke?"),
    ]
)
print(llm_results)
```

## GPT4All 예제

```python
from langchain_community.llms import GPT4All

model = GPT4All(model="./models/gpt4all-model.bin", n_ctx=512, n_threads=8)
callbacks = [PromptLayerCallbackHandler(pl_tags=["langchain", "gpt4all"])]

response = model.invoke(
    "Once upon a time, ",
    config={"callbacks": callbacks},
)
```

## 전체 기능 예제

이 예제에서는 `PromptLayer`의 더 많은 기능을 사용합니다.

PromptLayer를 사용하면 프롬프트 템플릿을 시각적으로 생성, 버전 관리 및 추적할 수 있습니다. [Prompt Registry](https://docs.promptlayer.com/features/prompt-registry)를 사용하여 `example`이라는 프롬프트 템플릿을 프로그래밍 방식으로 가져올 수 있습니다.

또한 `promptlayer_request_id`를 받아서 점수, 메타데이터를 기록하고 사용된 프롬프트 템플릿을 연결하는 `pl_id_callback` 함수를 정의합니다. [추적에 대한 자세한 내용은 문서](https://docs.promptlayer.com/features/prompt-history/request-id)를 참조하세요.

```python
from langchain_openai import OpenAI

def pl_id_callback(promptlayer_request_id):
    print("prompt layer id ", promptlayer_request_id)
    promptlayer.track.score(
        request_id=promptlayer_request_id, score=100
    )  # 점수는 0-100 사이의 정수
    promptlayer.track.metadata(
        request_id=promptlayer_request_id, metadata={"foo": "bar"}
    )  # 메타데이터는 PromptLayer에서 추적되는 key-value 쌍의 딕셔너리
    promptlayer.track.prompt(
        request_id=promptlayer_request_id,
        prompt_name="example",
        prompt_input_variables={"product": "toasters"},
        version=1,
    )  # 요청을 프롬프트 템플릿에 연결

openai_llm = OpenAI(
    model_name="gpt-3.5-turbo-instruct",
    callbacks=[PromptLayerCallbackHandler(pl_id_callback=pl_id_callback)],
)

example_prompt = promptlayer.prompts.get("example", version=1, langchain=True)
openai_llm.invoke(example_prompt.format(product="toasters"))
```

설정 후 모든 요청이 PromptLayer 대시보드에 표시됩니다. 이 콜백은 LangChain에 구현된 모든 LLM과 함께 작동합니다.