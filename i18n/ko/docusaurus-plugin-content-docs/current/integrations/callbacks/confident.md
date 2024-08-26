---
translated: true
---

# Confident

> [DeepEval](https://confident-ai.com) 패키지는 LLM을 위한 단위 테스트를 제공합니다.
> Confident를 사용하면 단위 테스트 및 통합 테스트를 통해 더 빠른 반복으로 강력한 언어 모델을 구축할 수 있습니다.
> 데이터 생성부터 테스트까지 반복의 각 단계를 지원합니다.

이 가이드에서는 LLM의 성능을 테스트하고 측정하는 방법을 보여줍니다. 성능을 측정하는 콜백을 사용하는 방법과 자체 메트릭을 정의하고 이를 대시보드에 기록하는 방법을 설명합니다.

DeepEval은 다음도 제공합니다:

- 합성 데이터 생성 방법
- 성능 측정 방법
- 시간 경과에 따른 결과를 모니터링하고 검토할 수 있는 대시보드

## 설치 및 설정

```python
%pip install --upgrade --quiet langchain langchain-openai deepeval langchain-chroma
```

### API 자격 증명 얻기

DeepEval API 자격 증명을 얻으려면 다음 단계를 따르세요:

1. https://app.confident-ai.com 으로 이동합니다.
2. "Organization"을 클릭합니다.
3. API 키를 복사합니다.

로그인 시 `implementation` 이름을 설정하라는 메시지가 표시됩니다. 구현 이름은 구현 유형을 설명하는 데 필요합니다. (프로젝트에 원하는 이름을 설정하세요. 설명적일수록 좋습니다.)

```python
!deepeval login
```

### DeepEval 설정

기본적으로 `DeepEvalCallbackHandler`를 사용하여 추적하려는 메트릭을 설정할 수 있습니다. 그러나 현재는 지원되는 메트릭이 제한적입니다(곧 더 많은 메트릭이 추가될 예정입니다). 현재 지원되는 메트릭은 다음과 같습니다:

- [답변 관련성](https://docs.confident-ai.com/docs/measuring_llm_performance/answer_relevancy)
- [편향성](https://docs.confident-ai.com/docs/measuring_llm_performance/debias)
- [유해성](https://docs.confident-ai.com/docs/measuring_llm_performance/non_toxic)

```python
from deepeval.metrics.answer_relevancy import AnswerRelevancy

# 여기서 우리는 답변이 최소한 관련성이 있는지 확인하고자 합니다.

answer_relevancy_metric = AnswerRelevancy(minimum_score=0.5)
```

## 시작하기

`DeepEvalCallbackHandler`를 사용하려면 `implementation_name`이 필요합니다.

```python
from langchain_community.callbacks.confident_callback import DeepEvalCallbackHandler

deepeval_callback = DeepEvalCallbackHandler(
    implementation_name="langchainQuickstart", metrics=[answer_relevancy_metric]
)
```

### 시나리오 1: LLM에 입력 제공

그런 다음 OpenAI와 함께 LLM에 입력을 제공합니다.

```python
from langchain_openai import OpenAI

llm = OpenAI(
    temperature=0,
    callbacks=[deepeval_callback],
    verbose=True,
    openai_api_key="<YOUR_API_KEY>",
)
output = llm.generate(
    [
        "What is the best evaluation tool out there? (no bias at all)",
    ]
)
```

```output
LLMResult(generations=[[Generation(text='\n\nQ: What did the fish say when he hit the wall? \nA: Dam.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nThe Moon \n\nThe moon is high in the midnight sky,\nSparkling like a star above.\nThe night so peaceful, so serene,\nFilling up the air with love.\n\nEver changing and renewing,\nA never-ending light of grace.\nThe moon remains a constant view,\nA reminder of life’s gentle pace.\n\nThrough time and space it guides us on,\nA never-fading beacon of hope.\nThe moon shines down on us all,\nAs it continues to rise and elope.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ. What did one magnet say to the other magnet?\nA. "I find you very attractive!"', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nThe world is charged with the grandeur of God.\nIt will flame out, like shining from shook foil;\nIt gathers to a greatness, like the ooze of oil\nCrushed. Why do men then now not reck his rod?\n\nGenerations have trod, have trod, have trod;\nAnd all is seared with trade; bleared, smeared with toil;\nAnd wears man's smudge and shares man's smell: the soil\nIs bare now, nor can foot feel, being shod.\n\nAnd for all this, nature is never spent;\nThere lives the dearest freshness deep down things;\nAnd though the last lights off the black West went\nOh, morning, at the brown brink eastward, springs —\n\nBecause the Holy Ghost over the bent\nWorld broods with warm breast and with ah! bright wings.\n\n~Gerard Manley Hopkins", generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ: What did one ocean say to the other ocean?\nA: Nothing, they just waved.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nA poem for you\n\nOn a field of green\n\nThe sky so blue\n\nA gentle breeze, the sun above\n\nA beautiful world, for us to love\n\nLife is a journey, full of surprise\n\nFull of joy and full of surprise\n\nBe brave and take small steps\n\nThe future will be revealed with depth\n\nIn the morning, when dawn arrives\n\nA fresh start, no reason to hide\n\nSomewhere down the road, there's a heart that beats\n\nBelieve in yourself, you'll always succeed.", generation_info={'finish_reason': 'stop', 'logprobs': None})]], llm_output={'token_usage': {'completion_tokens': 504, 'total_tokens': 528, 'prompt_tokens': 24}, 'model_name': 'text-davinci-003'})
```

그런 다음 `is_successful()` 메서드를 호출하여 메트릭이 성공했는지 확인할 수 있습니다.

```python
answer_relevancy_metric.is_successful()
# True/False를 반환합니다

```

이를 실행하면 아래 대시보드를 볼 수 있습니다.

![Dashboard](https://docs.confident-ai.com/assets/images/dashboard-screenshot-b02db73008213a211b1158ff052d969e.png)

### 시나리오 2: 콜백 없이 체인에서 LLM 추적

콜백 없이 체인에서 LLM을 추적하려면 끝에서 플러그인할 수 있습니다.

아래와 같이 간단한 체인을 정의할 수 있습니다.

```python
import requests
from langchain.chains import RetrievalQA
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

text_file_url = "https://raw.githubusercontent.com/hwchase17/chat-your-data/master/state_of_the_union.txt"

openai_api_key = "sk-XXX"

with open("state_of_the_union.txt", "w") as f:
    response = requests.get(text_file_url)
    f.write(response.text)

loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
docsearch = Chroma.from_documents(texts, embeddings)

qa = RetrievalQA.from_chain_type(
    llm=OpenAI(openai_api_key=openai_api_key),
    chain_type="stuff",
    retriever=docsearch.as_retriever(),
)

# 새로운 질문-응답 파이프라인 제공

query = "Who is the president?"
result = qa.run(query)
```

체인을 정의한 후 답변 유사성을 수동으로 확인할 수 있습니다.

```python
answer_relevancy_metric.measure(result, query)
answer_relevancy_metric.is_successful()
```

### 다음 단계는?

여기에서 [사용자 정의 메트릭을 생성](https://docs.confident-ai.com/docs/quickstart/custom-metrics)할 수 있습니다.

DeepEval은 [자동으로 단위 테스트 생성](https://docs.confident-ai.com/docs/quickstart/synthetic-data-creation), [환각 테스트](https://docs.confident-ai.com/docs/measuring_llm_performance/factual_consistency)와 같은 다른 기능도 제공합니다.

관심이 있으시면 GitHub 저장소 [https://github.com/confident-ai/deepeval](https://github.com/confident-ai/deepeval)을 확인하세요. LLM 성능 향상에 대한 PR 및 토론을 환영합니다.