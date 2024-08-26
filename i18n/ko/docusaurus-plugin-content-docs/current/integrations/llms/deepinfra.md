---
translated: true
---

# 딥인프라

[딥인프라](https://deepinfra.com/?utm_source=langchain)는 다양한 [LLM](https://deepinfra.com/models?utm_source=langchain)과 [임베딩 모델](https://deepinfra.com/models?type=embeddings&utm_source=langchain)에 대한 액세스를 제공하는 서버리스 추론 서비스입니다. 이 노트북은 LangChain을 사용하여 딥인프라의 언어 모델을 사용하는 방법을 설명합니다.

## 환경 API 키 설정

딥인프라에서 API 키를 받으세요. [로그인](https://deepinfra.com/login?from=%2Fdash)하고 새 토큰을 받아야 합니다.

1시간 동안 무료로 서버리스 GPU 컴퓨팅을 사용할 수 있습니다. (`deepctl auth token`으로 토큰을 출력할 수 있습니다.)

```python
# get a new token: https://deepinfra.com/login?from=%2Fdash

from getpass import getpass

DEEPINFRA_API_TOKEN = getpass()
```

```output
 ········
```

```python
import os

os.environ["DEEPINFRA_API_TOKEN"] = DEEPINFRA_API_TOKEN
```

## 딥인프라 인스턴스 생성

오픈소스 [deepctl 도구](https://github.com/deepinfra/deepctl#deepctl)를 사용하여 모델 배포를 관리할 수 있습니다. 사용 가능한 매개변수 목록은 [여기](https://deepinfra.com/databricks/dolly-v2-12b#API)에서 확인할 수 있습니다.

```python
from langchain_community.llms import DeepInfra

llm = DeepInfra(model_id="meta-llama/Llama-2-70b-chat-hf")
llm.model_kwargs = {
    "temperature": 0.7,
    "repetition_penalty": 1.2,
    "max_new_tokens": 250,
    "top_p": 0.9,
}
```

```python
# run inferences directly via wrapper
llm("Who let the dogs out?")
```

```output
'This is a question that has puzzled many people'
```

```python
# run streaming inference
for chunk in llm.stream("Who let the dogs out?"):
    print(chunk)
```

```output
 Will
 Smith
.
```

## 프롬프트 템플릿 생성

질문과 답변을 위한 프롬프트 템플릿을 생성합니다.

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

## LLMChain 초기화

```python
from langchain.chains import LLMChain

llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## LLMChain 실행

질문을 제공하고 LLMChain을 실행합니다.

```python
question = "Can penguins reach the North pole?"

llm_chain.run(question)
```

```output
"Penguins are found in Antarctica and the surrounding islands, which are located at the southernmost tip of the planet. The North Pole is located at the northernmost tip of the planet, and it would be a long journey for penguins to get there. In fact, penguins don't have the ability to fly or migrate over such long distances. So, no, penguins cannot reach the North Pole. "
```
