---
translated: true
---

# CerebriumAI

`Cerebrium`은 AWS Sagemaker의 대안입니다. 또한 [여러 LLM 모델](https://docs.cerebrium.ai/cerebrium/prebuilt-models/deployment)에 대한 API 액세스를 제공합니다.

이 노트북은 [CerebriumAI](https://docs.cerebrium.ai/introduction)와 Langchain을 사용하는 방법을 설명합니다.

## Cerebrium 설치

`cerebrium` 패키지를 사용하려면 `pip3 install cerebrium`을 통해 설치해야 합니다.

```python
# Install the package
!pip3 install cerebrium
```

## 가져오기

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import CerebriumAI
from langchain_core.prompts import PromptTemplate
```

## 환경 API 키 설정

CerebriumAI에서 API 키를 가져오세요. [여기](https://dashboard.cerebrium.ai/login)를 참조하세요. 1시간 동안 무료로 서버리스 GPU 컴퓨팅을 사용할 수 있습니다.

```python
os.environ["CEREBRIUMAI_API_KEY"] = "YOUR_KEY_HERE"
```

## CerebriumAI 인스턴스 생성

모델 엔드포인트 URL, 최대 길이, 온도 등 다양한 매개변수를 지정할 수 있습니다. 엔드포인트 URL을 제공해야 합니다.

```python
llm = CerebriumAI(endpoint_url="YOUR ENDPOINT URL HERE")
```

## 프롬프트 템플릿 생성

질문과 답변을 위한 프롬프트 템플릿을 만들겠습니다.

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## LLMChain 초기화

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## LLMChain 실행

질문을 제공하고 LLMChain을 실행하세요.

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
