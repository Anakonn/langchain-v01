---
translated: true
---

# Fiddler

> [Fiddler](https://www.fiddler.ai/)는 데이터 과학, MLOps, 리스크, 컴플라이언스, 분석 및 기타 LOB 팀이 엔터프라이즈 규모에서 ML 배포를 모니터링, 설명, 분석 및 개선할 수 있도록 하는 통합 플랫폼을 제공하는 기업입니다.

## 1. 설치 및 설정

```python
#!pip install langchain langchain-community langchain-openai fiddler-client
```

## 2. Fiddler 연결 정보

_Fiddler에 모델 정보를 추가하기 전에_

1. Fiddler에 연결하기 위해 사용하는 URL
2. 조직 ID
3. 인증 토큰

이 정보는 Fiddler 환경의 _설정_ 페이지에서 찾을 수 있습니다.

```python
URL = ""  # Fiddler 인스턴스 URL, 전체 URL(https:// 포함)을 입력하세요. 예: https://demo.fiddler.ai
ORG_NAME = ""
AUTH_TOKEN = ""  # Fiddler 인스턴스 인증 토큰

# 모델 등록에 사용되는 Fiddler 프로젝트 및 모델 이름

PROJECT_NAME = ""
MODEL_NAME = ""  # Fiddler에서의 모델 이름
```

## 3. Fiddler 콜백 핸들러 인스턴스 생성

```python
from langchain_community.callbacks.fiddler_callback import FiddlerCallbackHandler

fiddler_handler = FiddlerCallbackHandler(
    url=URL,
    org=ORG_NAME,
    project=PROJECT_NAME,
    model=MODEL_NAME,
    api_key=AUTH_TOKEN,
)
```

## 예제 1: 기본 체인

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import OpenAI

# 참고: OPENAI_API_KEY 환경 변수가 설정되어 있는지 확인하세요.

llm = OpenAI(temperature=0, streaming=True, callbacks=[fiddler_handler])
output_parser = StrOutputParser()

chain = llm | output_parser

# 체인 호출. 호출은 Fiddler에 로그로 기록되고 메트릭이 자동으로 생성됩니다.

chain.invoke("How far is moon from earth?")
```

```python
# 몇 가지 추가 호출

chain.invoke("What is the temperature on Mars?")
chain.invoke("How much is 2 + 200000?")
chain.invoke("Which movie won the oscars this year?")
chain.invoke("Can you write me a poem about insomnia?")
chain.invoke("How are you doing today?")
chain.invoke("What is the meaning of life?")
```

## 예제 2: 프롬프트 템플릿을 사용하는 체인

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)

examples = [
    {"input": "2+2", "output": "4"},
    {"input": "2+3", "output": "5"},
]

example_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{input}"),
        ("ai", "{output}"),
    ]
)

few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)

final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)

# 참고: OPENAI_API_KEY 환경 변수가 설정되어 있는지 확인하세요.

llm = OpenAI(temperature=0, streaming=True, callbacks=[fiddler_handler])

chain = final_prompt | llm

# 체인 호출. 호출은 Fiddler에 로그로 기록되고 메트릭이 자동으로 생성됩니다.

chain.invoke({"input": "What's the square of a triangle?"})
```