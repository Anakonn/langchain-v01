---
translated: true
---

# Argilla

> [Argilla](https://argilla.io/)는 LLM을 위한 오픈 소스 데이터 큐레이션 플랫폼입니다.
> Argilla를 사용하면, 인간과 기계의 피드백을 통해 빠른 데이터 큐레이션으로 강력한 언어 모델을 구축할 수 있습니다.
> 데이터 라벨링부터 모델 모니터링까지 MLOps 사이클의 각 단계를 지원합니다.

<a target="_blank" href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/callbacks/argilla.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

이 가이드에서는 `ArgillaCallbackHandler`를 사용하여 LLM의 입력 및 응답을 추적하고 Argilla에서 데이터셋을 생성하는 방법을 보여줍니다.

LLM의 입력 및 출력을 추적하여 미래의 미세 조정을 위한 데이터셋을 생성하는 것은 유용합니다. 이는 특히 질문 응답, 요약 또는 번역과 같은 특정 작업을 위해 LLM을 사용할 때 유용합니다.

## 설치 및 설정

```python
%pip install --upgrade --quiet langchain langchain-openai argilla
```

### API 자격 증명 얻기

Argilla API 자격 증명을 얻으려면 다음 단계를 따르세요:

1. Argilla UI로 이동합니다.
2. 프로필 사진을 클릭하고 "내 설정"으로 이동합니다.
3. 그런 다음 API 키를 복사합니다.

Argilla의 API URL은 Argilla UI의 URL과 동일합니다.

OpenAI API 자격 증명을 얻으려면 https://platform.openai.com/account/api-keys 를 방문하세요.

```python
import os

os.environ["ARGILLA_API_URL"] = "..."
os.environ["ARGILLA_API_KEY"] = "..."

os.environ["OPENAI_API_KEY"] = "..."
```

### Argilla 설정

`ArgillaCallbackHandler`를 사용하려면 LLM 실험을 추적하기 위해 Argilla에서 새로운 `FeedbackDataset`을 만들어야 합니다. 다음 코드를 사용하세요:

```python
import argilla as rg
```

```python
from packaging.version import parse as parse_version

if parse_version(rg.__version__) < parse_version("1.8.0"):
    raise RuntimeError(
        "`FeedbackDataset`는 Argilla v1.8.0 이상에서만 사용할 수 있습니다. `argilla`를 `pip install argilla --upgrade`로 업그레이드하세요."
    )
```

```python
dataset = rg.FeedbackDataset(
    fields=[
        rg.TextField(name="prompt"),
        rg.TextField(name="response"),
    ],
    questions=[
        rg.RatingQuestion(
            name="response-rating",
            description="응답의 품질을 어떻게 평가하시겠습니까?",
            values=[1, 2, 3, 4, 5],
            required=True,
        ),
        rg.TextQuestion(
            name="response-feedback",
            description="응답에 대한 피드백이 있습니까?",
            required=False,
        ),
    ],
    guidelines="응답의 품질을 평가하고 피드백을 제공해야 합니다.",
)

rg.init(
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)

dataset.push_to_argilla("langchain-dataset")
```

> 📌 참고: 현재 `FeedbackDataset.fields`로는 프롬프트-응답 쌍만 지원되므로, `ArgillaCallbackHandler`는 프롬프트(즉, LLM 입력)와 응답(즉, LLM 출력)만 추적합니다.

## 추적

`ArgillaCallbackHandler`를 사용하려면 다음 코드를 사용하거나 다음 섹션에 제시된 예제를 재현할 수 있습니다.

```python
from langchain_community.callbacks.argilla_callback import ArgillaCallbackHandler

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
```

### 시나리오 1: LLM 추적

먼저, 단일 LLM을 몇 번 실행하고 결과 프롬프트-응답 쌍을 Argilla에 캡처합니다.

```python
from langchain_core.callbacks.stdout import StdOutCallbackHandler
from langchain_openai import OpenAI

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
callbacks = [StdOutCallbackHandler(), argilla_callback]

llm = OpenAI(temperature=0.9, callbacks=callbacks)
llm.generate(["Tell me a joke", "Tell me a poem"] * 3)
```

```output
LLMResult(generations=[[Generation(text='\n\nQ: What did the fish say when he hit the wall? \nA: Dam.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nThe Moon \n\nThe moon is high in the midnight sky,\nSparkling like a star above.\nThe night so peaceful, so serene,\nFilling up the air with love.\n\nEver changing and renewing,\nA never-ending light of grace.\nThe moon remains a constant view,\nA reminder of life’s gentle pace.\n\nThrough time and space it guides us on,\nA never-fading beacon of hope.\nThe moon shines down on us all,\nAs it continues to rise and elope.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ. What did one magnet say to the other magnet?\nA. "I find you very attractive!"', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nThe world is charged with the grandeur of God.\nIt will flame out, like shining from shook foil;\nIt gathers to a greatness, like the ooze of oil\nCrushed. Why do men then now not reck his rod?\n\nGenerations have trod, have trod, have trod;\nAnd all is seared with trade; bleared, smeared with toil;\nAnd wears man's smudge and shares man's smell: the soil\nIs bare now, nor can foot feel, being shod.\n\nAnd for all this, nature is never spent;\nThere lives the dearest freshness deep down things;\nAnd though the last lights off the black West went\nOh, morning, at the brown brink eastward, springs —\n\nBecause the Holy Ghost over the bent\nWorld broods with warm breast and with ah! bright wings.\n\n~Gerard Manley Hopkins", generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ: What did one ocean say to the other ocean?\nA: Nothing, they just waved.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nA poem for you\n\nOn a field of green\n\nThe sky so blue\n\nA gentle breeze, the sun above\n\nA beautiful world, for us to love\n\nLife is a journey, full of surprise\n\nFull of joy and full of surprise\n\nBe brave and take small steps\n\nThe future will be revealed with depth\n\nIn the morning, when dawn arrives\n\nA fresh start, no reason to hide\n\nSomewhere down the road, there's a heart that beats\n\nBelieve in yourself, you'll always succeed.", generation_info={'finish_reason': 'stop', 'logprobs': None})]], llm_output={'token_usage': {'completion_tokens': 504, 'total_tokens': 528, 'prompt_tokens': 24}, 'model_name': 'text-davinci-003'})
```

![Argilla UI with LangChain LLM input-response](https://docs.argilla.io/en/latest/_images/llm.png)

### 시나리오 2: 체인에서 LLM 추적

그런 다음 프롬프트 템플릿을 사용하여 체인을 생성하고 Argilla에서 초기 프롬프트와 최종 응답을 추적할 수 있습니다.

```python
from langchain.chains import LLMChain
from langchain_core.callbacks.stdout import StdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
callbacks = [StdOutCallbackHandler(), argilla_callback]
llm = OpenAI(temperature=0.9, callbacks=callbacks)

template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=callbacks)

test_prompts = [{"title": "Documentary about Bigfoot in Paris"}]
synopsis_chain.apply(test_prompts)
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: Documentary about Bigfoot in Paris
Playwright: This is a synopsis for the above play:[0m

[1m> Finished chain.[0m
```

```output
[{'text': "\n\nDocumentary about Bigfoot in Paris focuses on the story of a documentary filmmaker and their search for evidence of the legendary Bigfoot creature in the city of Paris. The play follows the filmmaker as they explore the city, meeting people from all walks of life who have had encounters with the mysterious creature. Through their conversations, the filmmaker unravels the story of Bigfoot and finds out the truth about the creature's presence in Paris. As the story progresses, the filmmaker learns more and more about the mysterious creature, as well as the different perspectives of the people living in the city, and what they think of the creature. In the end, the filmmaker's findings lead them to some surprising and heartwarming conclusions about the creature's existence and the importance it holds in the lives of the people in Paris."}]
```

![Argilla UI with LangChain Chain input-response](https://docs.argilla.io/en/latest/_images/chain.png)

### 시나리오 3: 도구가 있는 에이전트 사용

마지막으로, 더 고급 워크플로로서 일부 도구를 사용하는 에이전트를 생성할 수 있습니다. `ArgillaCallbackHandler`는 입력 및 출력만 추적하며, 중간 단계/생각은 추적하지 않으므로 프롬프트가 주어지면 원래 프롬프트와 해당 프롬프트에 대한 최종 응답을 기록합니다.

> 이 시나리오에서는 Google 검색 API(Serp API)를 사용하므로 `google-search-results`를 `pip install google-search-results`로 설치하고, Serp API 키를 `os.environ["SERPAPI_API_KEY"] = "..."`로 설정해야 합니다(https://serpapi.com/dashboard에서 확인 가능). 그렇지 않으면 아래 예제가 작동하지 않습니다.

```python
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_core.callbacks.stdout import StdOutCallbackHandler
from langchain_openai import OpenAI

argilla_callback = ArgillaCallbackHandler(
    dataset_name="langchain-dataset",
    api_url=os.environ["ARGILLA_API_URL"],
    api_key=os.environ["ARGILLA_API_KEY"],
)
callbacks = [StdOutCallbackHandler(), argilla_callback]
llm = OpenAI(temperature=0.9, callbacks=callbacks)

tools = load_tools(["serpapi"], llm=llm, callbacks=callbacks)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    callbacks=callbacks,
)
agent.run("Who was the first president of the United States of America?")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to answer a historical question
Action: Search
Action Input: "who was the first president of the United States of America" [0m
Observation: [36;1m[1;3mGeorge Washington[0m
Thought:[32;1m[1;3m George Washington was the first president
Final Answer: George Washington was the first president of the United States of America.[0m

[1m> Finished chain.[0m
```

```output
'George Washington was the first president of the United States of America.'
```

![Argilla UI with LangChain Agent input-response](https://docs.argilla.io/en/latest/_images/agent.png)