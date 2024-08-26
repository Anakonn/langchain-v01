---
translated: true
---

# 꽃잎

`Petals`는 BitTorrent 스타일로 집에서 100B+ 언어 모델을 실행합니다.

이 노트북에서는 [Petals](https://github.com/bigscience-workshop/petals)와 함께 Langchain을 사용하는 방법을 살펴봅니다.

## Petals 설치

Petals API를 사용하려면 `petals` 패키지가 필요합니다. `pip3 install petals`를 사용하여 `petals`를 설치하세요.

Apple Silicon(M1/M2) 사용자는 [https://github.com/bigscience-workshop/petals/issues/147#issuecomment-1365379642](https://github.com/bigscience-workshop/petals/issues/147#issuecomment-1365379642)의 가이드를 따르세요.

```python
!pip3 install petals
```

## 가져오기

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import Petals
from langchain_core.prompts import PromptTemplate
```

## 환경 API 키 설정

Hugging Face에서 [API 키](https://huggingface.co/docs/api-inference/quicktour#get-your-api-token)를 받아야 합니다.

```python
from getpass import getpass

HUGGINGFACE_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["HUGGINGFACE_API_KEY"] = HUGGINGFACE_API_KEY
```

## Petals 인스턴스 생성

모델 이름, 최대 새 토큰, 온도 등 다양한 매개변수를 지정할 수 있습니다.

```python
# this can take several minutes to download big files!

llm = Petals(model_name="bigscience/bloom-petals")
```

```output
Downloading:   1%|▏                        | 40.8M/7.19G [00:24<15:44, 7.57MB/s]
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
