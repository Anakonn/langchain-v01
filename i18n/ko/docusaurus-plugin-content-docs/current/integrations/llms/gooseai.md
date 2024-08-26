---
translated: true
---

# GooseAI

`GooseAI`는 API를 통해 제공되는 완전히 관리되는 NLP-as-a-Service입니다. GooseAI는 [이러한 모델](https://goose.ai/docs/models)에 대한 액세스를 제공합니다.

이 노트북은 Langchain을 사용하여 [GooseAI](https://goose.ai/)를 사용하는 방법을 설명합니다.

## openai 설치

GooseAI API를 사용하려면 `openai` 패키지가 필요합니다. `pip install openai`를 사용하여 `openai`를 설치하십시오.

```python
%pip install --upgrade --quiet  langchain-openai
```

## 가져오기

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import GooseAI
from langchain_core.prompts import PromptTemplate
```

## 환경 API 키 설정

GooseAI에서 API 키를 받으세요. 다양한 모델을 테스트할 수 있도록 $10의 무료 크레딧이 제공됩니다.

```python
from getpass import getpass

GOOSEAI_API_KEY = getpass()
```

```python
os.environ["GOOSEAI_API_KEY"] = GOOSEAI_API_KEY
```

## GooseAI 인스턴스 생성

모델 이름, 최대 생성 토큰, 온도 등과 같은 다양한 매개변수를 지정할 수 있습니다.

```python
llm = GooseAI()
```

## 프롬프트 템플릿 생성

질문과 답변을 위한 프롬프트 템플릿을 만들 것입니다.

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

질문을 제공하고 LLMChain을 실행하십시오.

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
