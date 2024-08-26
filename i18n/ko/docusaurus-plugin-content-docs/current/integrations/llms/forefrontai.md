---
translated: true
---

# 최첨단 AI

`Forefront` 플랫폼을 통해 [오픈 소스 대규모 언어 모델](https://docs.forefront.ai/forefront/master/models)을 미세 조정하고 사용할 수 있습니다.

이 노트북에서는 [ForefrontAI](https://www.forefront.ai/)와 Langchain을 사용하는 방법을 살펴봅니다.

## 가져오기

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import ForefrontAI
from langchain_core.prompts import PromptTemplate
```

## 환경 API 키 설정

ForefrontAI에서 API 키를 받으세요. 다양한 모델을 테스트할 수 있는 5일 무료 평가판이 제공됩니다.

```python
# get a new token: https://docs.forefront.ai/forefront/api-reference/authentication

from getpass import getpass

FOREFRONTAI_API_KEY = getpass()
```

```python
os.environ["FOREFRONTAI_API_KEY"] = FOREFRONTAI_API_KEY
```

## ForefrontAI 인스턴스 생성

모델 엔드포인트 URL, 길이, 온도 등 다양한 매개변수를 지정할 수 있습니다. 엔드포인트 URL을 제공해야 합니다.

```python
llm = ForefrontAI(endpoint_url="YOUR ENDPOINT URL HERE")
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
