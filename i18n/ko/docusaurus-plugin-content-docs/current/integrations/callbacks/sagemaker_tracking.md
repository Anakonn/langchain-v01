---
translated: true
---

# SageMaker Tracking

> [Amazon SageMaker](https://aws.amazon.com/sagemaker/)는 기계 학습(ML) 모델을 신속하고 쉽게 구축, 훈련 및 배포할 수 있는 완전 관리형 서비스입니다.

> [Amazon SageMaker Experiments](https://docs.aws.amazon.com/sagemaker/latest/dg/experiments.html)는 ML 실험 및 모델 버전을 조직, 추적, 비교 및 평가할 수 있는 `Amazon SageMaker`의 기능입니다.

이 노트북에서는 LangChain Callback을 사용하여 프롬프트 및 기타 LLM 하이퍼파라미터를 `SageMaker Experiments`에 로그하고 추적하는 방법을 보여줍니다. 여기에서는 다양한 시나리오를 통해 기능을 시연합니다:

- **시나리오 1**: _단일 LLM_ - 주어진 프롬프트에 따라 출력을 생성하는 단일 LLM 모델을 사용하는 경우.
- **시나리오 2**: _순차 체인_ - 두 개의 LLM 모델로 구성된 순차 체인을 사용하는 경우.
- **시나리오 3**: _도구가 있는 에이전트(Chain of Thought)_ - LLM 외에도 여러 도구(검색 및 수학)를 사용하는 경우.

이 노트북에서는 각 시나리오에서 프롬프트를 기록하기 위해 단일 실험을 만듭니다.

## 설치 및 설정

```python
%pip install --upgrade --quiet sagemaker
%pip install --upgrade --quiet langchain-openai
%pip install --upgrade --quiet google-search-results
```

먼저 필요한 API 키를 설정합니다:

- OpenAI: https://platform.openai.com/account/api-keys (OpenAI LLM 모델용)
- Google SERP API: https://serpapi.com/manage-api-key (Google 검색 도구용)

```python
import os

## 여기에 API 키를 추가하세요

os.environ["OPENAI_API_KEY"] = "<ADD-KEY-HERE>"
os.environ["SERPAPI_API_KEY"] = "<ADD-KEY-HERE>"
```

```python
from langchain_community.callbacks.sagemaker_callback import SageMakerCallbackHandler
```

```python
from langchain.agents import initialize_agent, load_tools
from langchain.chains import LLMChain, SimpleSequentialChain
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from sagemaker.analytics import ExperimentAnalytics
from sagemaker.experiments.run import Run
from sagemaker.session import Session
```

## LLM 프롬프트 추적

```python
# LLM 하이퍼파라미터

HPARAMS = {
    "temperature": 0.1,
    "model_name": "gpt-3.5-turbo-instruct",
}

# 프롬프트 로그를 저장할 버킷 (기본 버킷을 사용하려면 `None` 사용)

BUCKET_NAME = None

# 실험 이름

EXPERIMENT_NAME = "langchain-sagemaker-tracker"

# 주어진 버킷으로 SageMaker 세션 생성

session = Session(default_bucket=BUCKET_NAME)
```

### 시나리오 1 - LLM

```python
RUN_NAME = "run-scenario-1"
PROMPT_TEMPLATE = "tell me a joke about {topic}"
INPUT_VARIABLES = {"topic": "fish"}
```

```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # SageMaker Callback 생성
    sagemaker_callback = SageMakerCallbackHandler(run)

    # 콜백이 있는 LLM 모델 정의
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # 프롬프트 템플릿 생성
    prompt = PromptTemplate.from_template(template=PROMPT_TEMPLATE)

    # LLM 체인 생성
    chain = LLMChain(llm=llm, prompt=prompt, callbacks=[sagemaker_callback])

    # 체인 실행
    chain.run(**INPUT_VARIABLES)

    # 콜백 재설정
    sagemaker_callback.flush_tracker()
```

### 시나리오 2 - 순차 체인

```python
RUN_NAME = "run-scenario-2"

PROMPT_TEMPLATE_1 = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
PROMPT_TEMPLATE_2 = """You are a play critic from the New York Times. Given the synopsis of play, it is your job to write a review for that play.
Play Synopsis: {synopsis}
Review from a New York Times play critic of the above play:"""

INPUT_VARIABLES = {
    "input": "documentary about good video games that push the boundary of game design"
}
```

```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # SageMaker Callback 생성
    sagemaker_callback = SageMakerCallbackHandler(run)

    # 체인용 프롬프트 템플릿 생성
    prompt_template1 = PromptTemplate.from_template(template=PROMPT_TEMPLATE_1)
    prompt_template2 = PromptTemplate.from_template(template=PROMPT_TEMPLATE_2)

    # 콜백이 있는 LLM 모델 정의
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # 체인1 생성
    chain1 = LLMChain(llm=llm, prompt=prompt_template1, callbacks=[sagemaker_callback])

    # 체인2 생성
    chain2 = LLMChain(llm=llm, prompt=prompt_template2, callbacks=[sagemaker_callback])

    # 순차 체인 생성
    overall_chain = SimpleSequentialChain(
        chains=[chain1, chain2], callbacks=[sagemaker_callback]
    )

    # 전체 순차 체인 실행
    overall_chain.run(**INPUT_VARIABLES)

    # 콜백 재설정
    sagemaker_callback.flush_tracker()
```

### 시나리오 3 - 도구가 있는 에이전트

```python
RUN_NAME = "run-scenario-3"
PROMPT_TEMPLATE = "Who is the oldest person alive? And what is their current age raised to the power of 1.51?"
```

```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # SageMaker Callback 생성
    sagemaker_callback = SageMakerCallbackHandler(run)

    # 콜백이 있는 LLM 모델 정의
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # 도구 정의
    tools = load_tools(["serpapi", "llm-math"], llm=llm, callbacks=[sagemaker_callback])

    # 모든 도구로 에이전트 초기화
    agent = initialize_agent(
        tools, llm, agent="zero-shot-react-description", callbacks=[sagemaker_callback]
    )

    # 에이전트 실행
    agent.run(input=PROMPT_TEMPLATE)

    # 콜백 재설정
    sagemaker_callback.flush_tracker()
```

## 로그 데이터 로드

프롬프트가 기록되면 이를 로드하고 Pandas DataFrame으로 변환할 수 있습니다.

```python
# 로드

logs = ExperimentAnalytics(experiment_name=EXPERIMENT_NAME)

# pandas 데이터프레임으로 변환

df = logs.dataframe(force_refresh=True)

print(df.shape)
df.head()
```

위에서 볼 수 있듯이 실험에는 각 시나리오에 해당하는 세 개의 실행(행)이 있습니다. 각 실행은 프롬프트 및 관련 LLM 설정/하이퍼파라미터를 json으로 기록하고 s3 버킷에 저장합니다. 각 json 경로에서 로그 데이터를 로드하고 탐색해 보세요.