---
translated: true
---

# PipelineAI

>[PipelineAI](https://pipeline.ai)는 클라우드에서 ML 모델을 대규모로 실행할 수 있게 해줍니다. 또한 [여러 LLM 모델](https://pipeline.ai)에 대한 API 액세스를 제공합니다.

이 노트북은 [PipelineAI](https://docs.pipeline.ai/docs)와 함께 Langchain을 사용하는 방법을 설명합니다.

## PipelineAI 예제

[이 예제는 PipelineAI가 LangChain과 통합된 방법을 보여줍니다](https://docs.pipeline.ai/docs/langchain). 이 예제는 PipelineAI에서 만들었습니다.

## 설정

`pipeline-ai` 라이브러리를 사용하려면 `PipelineAI` API, 즉 `Pipeline Cloud`가 필요합니다. `pip install pipeline-ai`를 사용하여 `pipeline-ai`를 설치하세요.

```python
# Install the package
%pip install --upgrade --quiet  pipeline-ai
```

## 예제

### 가져오기

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import PipelineAI
from langchain_core.prompts import PromptTemplate
```

### 환경 API 키 설정

PipelineAI에서 API 키를 받아야 합니다. [클라우드 빠른 시작 가이드](https://docs.pipeline.ai/docs/cloud-quickstart)를 확인하세요. 다양한 모델을 테스트할 수 있도록 30일 무료 평가판과 10시간의 서버리스 GPU 컴퓨팅이 제공됩니다.

```python
os.environ["PIPELINE_API_KEY"] = "YOUR_API_KEY_HERE"
```

## PipelineAI 인스턴스 생성

PipelineAI를 인스턴스화할 때는 사용할 파이프라인의 ID 또는 태그를 지정해야 합니다. 예: `pipeline_key = "public/gpt-j:base"`. 그 다음 추가적인 파이프라인 특정 키워드 인수를 전달할 수 있습니다:

```python
llm = PipelineAI(pipeline_key="YOUR_PIPELINE_KEY", pipeline_kwargs={...})
```

### 프롬프트 템플릿 생성

질문과 답변을 위한 프롬프트 템플릿을 만들겠습니다.

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

### LLMChain 초기화

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

### LLMChain 실행

질문을 제공하고 LLMChain을 실행합니다.

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
