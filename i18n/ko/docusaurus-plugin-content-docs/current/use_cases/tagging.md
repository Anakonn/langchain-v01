---
sidebar_class_name: hidden
title: 태깅
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/tagging.ipynb)

## 사용 사례

태깅은 문서에 다음과 같은 클래스로 라벨을 지정하는 것을 의미합니다:

- 감정
- 언어
- 스타일 (격식, 비격식 등)
- 다루는 주제
- 정치적 성향

![이미지 설명](../../../../../static/img/tagging.png)

## 개요

태깅은 몇 가지 구성 요소로 이루어집니다:

- `function`: [추출](/docs/use_cases/extraction)과 마찬가지로, 태깅은 모델이 문서를 태깅하는 방법을 지정하기 위해 [functions](https://openai.com/blog/function-calling-and-other-api-updates)을 사용합니다.
- `schema`: 문서를 태깅하는 방식을 정의합니다.

## 빠른 시작

LangChain에서 OpenAI 도구 호출을 사용하여 태깅을 수행하는 매우 간단한 예제를 살펴보겠습니다. OpenAI 모델에서 지원하는 [`with_structured_output`](/docs/modules/model_io/chat/structured_output) 메서드를 사용할 것입니다:

```python
%pip install --upgrade --quiet langchain langchain-openai

# 환경 변수 OPENAI_API_KEY 설정 또는 .env 파일에서 로드:

# import dotenv

# dotenv.load_dotenv()

```

Pydantic 모델을 몇 가지 속성과 해당 예상 유형으로 지정해 보겠습니다.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

tagging_prompt = ChatPromptTemplate.from_template(
    """
다음 구절에서 원하는 정보를 추출하세요.

'Classification' 함수에서 언급된 속성만 추출하세요.

구절:
{input}
"""
)

class Classification(BaseModel):
    sentiment: str = Field(description="텍스트의 감정")
    aggressiveness: int = Field(
        description="텍스트의 공격성 정도를 1에서 10까지의 척도로 표현"
    )
    language: str = Field(description="텍스트가 작성된 언어")

# LLM

llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0125").with_structured_output(
    Classification
)

tagging_chain = tagging_prompt | llm
```

```python
inp = "Estoy increiblemente contento de haberte conocido! Creo que seremos muy buenos amigos!"
tagging_chain.invoke({"input": inp})
```

```output
Classification(sentiment='positive', aggressiveness=1, language='Spanish')
```

JSON 출력을 원한다면, `.dict()`를 호출하면 됩니다.

```python
inp = "Estoy muy enojado con vos! Te voy a dar tu merecido!"
res = tagging_chain.invoke({"input": inp})
res.dict()
```

```output
{'sentiment': 'negative', 'aggressiveness': 8, 'language': 'Spanish'}
```

예제에서 볼 수 있듯이, 모델이 우리가 원하는 것을 정확히 해석합니다.

결과는 다양할 수 있으며, 예를 들어 감정은 다른 언어로 나올 수 있습니다('positive', 'enojado' 등).

다음 섹션에서는 이러한 결과를 제어하는 방법을 살펴보겠습니다.

## 더 세밀한 제어

세심한 스키마 정의를 통해 모델의 출력을 더 잘 제어할 수 있습니다.

특히, 우리는 다음을 정의할 수 있습니다:

- 각 속성에 대한 가능한 값
- 모델이 속성을 이해하도록 하기 위한 설명
- 반환될 필수 속성

이전 언급한 측면을 제어하기 위해 열거형을 사용하여 Pydantic 모델을 다시 선언해 보겠습니다:

```python
class Classification(BaseModel):
    sentiment: str = Field(..., enum=["happy", "neutral", "sad"])
    aggressiveness: int = Field(
        ...,
        description="발언의 공격성 정도를 설명합니다. 숫자가 클수록 더 공격적입니다",
        enum=[1, 2, 3, 4, 5],
    )
    language: str = Field(
        ..., enum=["spanish", "english", "french", "german", "italian"]
    )
```

```python
tagging_prompt = ChatPromptTemplate.from_template(
    """
다음 구절에서 원하는 정보를 추출하세요.

'Classification' 함수에서 언급된 속성만 추출하세요.

구절:
{input}
"""
)

llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0125").with_structured_output(
    Classification
)

chain = tagging_prompt | llm
```

이제 답변은 우리가 기대하는 방식으로 제한될 것입니다!

```python
inp = "Estoy increiblemente contento de haberte conocido! Creo que seremos muy buenos amigos!"
chain.invoke({"input": inp})
```

```output
Classification(sentiment='happy', aggressiveness=1, language='spanish')
```

```python
inp = "Estoy muy enojado con vos! Te voy a dar tu merecido!"
chain.invoke({"input": inp})
```

```output
Classification(sentiment='sad', aggressiveness=5, language='spanish')
```

```python
inp = "Weather is ok here, I can go outside without much more than a coat"
chain.invoke({"input": inp})
```

```output
Classification(sentiment='neutral', aggressiveness=2, language='english')
```

[LangSmith trace](https://smith.langchain.com/public/38294e04-33d8-4c5a-ae92-c2fe68be8332/r)를 통해 내부를 살펴볼 수 있습니다:

![이미지 설명](../../../../../static/img/tagging_trace.png)

### 더 깊이 들어가기

- LangChain `Document`에서 메타데이터를 추출하기 위해 [metadata tagger](/docs/integrations/document_transformers/openai_metadata_tagger) 문서 변환기를 사용할 수 있습니다.
- 이는 태깅 체인과 동일한 기본 기능을 다루지만 LangChain `Document`에 적용됩니다.