---
sidebar_position: 2
translated: true
---

# 확장

정보 검색 시스템은 문구와 특정 키워드에 민감할 수 있습니다. 이를 완화하기 위해 고전적인 검색 기술 중 하나는 쿼리의 여러 개의 패러프레이즈된 버전을 생성하고 쿼리의 모든 버전에 대한 결과를 반환하는 것입니다. 이를 **쿼리 확장**이라고 합니다. LLM은 이러한 쿼리의 대체 버전을 생성하는 데 훌륭한 도구입니다.

LangChain YouTube 동영상에 대한 Q&A 봇을 위한 쿼리 확장을 어떻게 할 수 있는지 살펴보겠습니다. 이 봇은 [Quickstart](/docs/use_cases/query_analysis/quickstart)에서 시작했습니다.

## 설정

#### 종속성 설치

```python
# %pip install -qU langchain langchain-openai

```

#### 환경 변수 설정

이 예제에서는 OpenAI를 사용합니다:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# 선택 사항, LangSmith로 실행 추적을 위해 주석 해제. 여기서 가입하세요: https://smith.langchain.com.

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

```

## 쿼리 생성

여러 패러프레이즈를 얻기 위해 OpenAI의 함수 호출 API를 사용할 것입니다.

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class ParaphrasedQuery(BaseModel):
    """질문에 대한 패러프레이징을 수행하여 쿼리 확장을 수행했습니다."""

    paraphrased_query: str = Field(
        ...,
        description="원래 질문의 고유한 패러프레이징입니다.",
    )
```

```python
from langchain.output_parsers import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """사용자 질문을 데이터베이스 쿼리로 변환하는 전문가입니다. \
당신은 LLM 기반 응용 프로그램을 구축하는 소프트웨어 라이브러리에 대한 튜토리얼 비디오 데이터베이스에 액세스할 수 있습니다. \

쿼리 확장을 수행하십시오. 사용자 질문의 여러 일반적인 표현 방법 또는 질문의 주요 단어에 대한 일반적인 동의어가 있는 경우 \
다양한 표현으로 쿼리의 여러 버전을 반환하십시오.

알 수 없는 약어 또는 단어가 있는 경우, 이를 바꾸려고 하지 마십시오.

질문의 최소 3가지 버전을 반환하십시오."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
llm_with_tools = llm.bind_tools([ParaphrasedQuery])
query_analyzer = prompt | llm_with_tools | PydanticToolsParser(tools=[ParaphrasedQuery])
```

이전에 검색한 질문에 대해 분석기가 생성한 쿼리를 살펴보겠습니다:

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
```

```output
[ParaphrasedQuery(paraphrased_query='How to utilize multi-modal models sequentially and convert the sequence into a REST API'),
 ParaphrasedQuery(paraphrased_query='Steps for using multi-modal models in a series and transforming the series into a RESTful API'),
 ParaphrasedQuery(paraphrased_query='Guide on employing multi-modal models in a chain and converting the chain into a RESTful API')]
```

```python
query_analyzer.invoke({"question": "stream events from llm agent"})
```

```output
[ParaphrasedQuery(paraphrased_query='How to stream events from LLM agent?'),
 ParaphrasedQuery(paraphrased_query='How can I receive events from LLM agent in real-time?'),
 ParaphrasedQuery(paraphrased_query='What is the process for capturing events from LLM agent?')]
```