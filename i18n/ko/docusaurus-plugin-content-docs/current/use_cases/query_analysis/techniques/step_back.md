---
sidebar_position: 2
translated: true
---

# Step Back Prompting

때로는 검색 품질과 모델 생성이 질문의 특정 내용에 의해 방해받을 수 있습니다. 이를 처리하는 한 가지 방법은 먼저 더 추상적인 "단계적 후퇴" 질문을 생성하고, 원래 질문과 단계적 후퇴 질문 모두를 기반으로 쿼리하는 것입니다.

예를 들어, "왜 내 LangGraph 에이전트 astream_events가 {LONG_TRACE} 대신 {DESIRED_OUTPUT}를 반환하나요?"라는 질문을 한다면, 사용자 질문보다 "LangGraph 에이전트와 함께 astream_events가 어떻게 작동하나요?"라는 더 일반적인 질문으로 검색할 때 더 관련성 높은 문서를 검색할 가능성이 높습니다.

우리의 LangChain YouTube 비디오에 대한 Q&A 봇 컨텍스트에서 단계적 후퇴 프롬프트를 사용하는 방법을 살펴보겠습니다.

## 설정

#### 종속성 설치

```python
# %pip install -qU langchain-core langchain-openai

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

## 단계적 후퇴 질문 생성

좋은 단계적 후퇴 질문을 생성하는 것은 좋은 프롬프트를 작성하는 것에 달려 있습니다:

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """당신은 특정 질문을 받아서 그 질문에 답하기 위해 필요한 기본 원칙을 더 일반적인 질문으로 추출하는 전문가입니다.

당신은 LangChain, LangGraph, LangServe, LangSmith라는 LLM 기반 애플리케이션을 구축하기 위한 소프트웨어 세트에 대해 질문을 받을 것입니다.

LangChain은 LLM 애플리케이션을 구축하기 위해 쉽게 구성할 수 있는 다양한 통합을 제공하는 Python 프레임워크입니다.
LangGraph는 LangChain 위에 구축된 Python 패키지로서 상태 유지 멀티 액터 LLM 애플리케이션을 쉽게 구축할 수 있게 해줍니다.
LangServe는 LangChain 애플리케이션을 REST API로 배포하기 쉽게 해주는 Python 패키지입니다.
LangSmith는 LLM 애플리케이션을 추적하고 테스트하기 쉽게 해주는 플랫폼입니다.

이 제품들 중 하나 이상에 대한 특정 사용자 질문이 주어지면, 특정 질문에 답하기 위해 필요한 더 일반적인 질문을 작성하세요.

단어나 약어를 인식하지 못하면 다시 쓰지 마세요.

간결한 질문을 작성하세요."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
step_back = prompt | llm | StrOutputParser()
```

```python
question = (
    "Gemini Pro와 벡터스토어 및 DuckDuckGo 검색 같은 도구를 사용하여 LangGraph 에이전트를 구축했습니다. "
    "이벤트 스트림에서 LLM 호출만 얻으려면 어떻게 해야 하나요?"
)
result = step_back.invoke({"question": question})
print(result)
```

```output
LangGraph가 다양한 유형의 상호작용 및 데이터 소스를 포함하는 이벤트 스트림에서 LLM 호출을 추출하는 데 사용하는 특정 메서드 또는 함수는 무엇인가요?
```

## 단계적 후퇴 질문과 원래 질문 반환

리콜을 높이기 위해 우리는 단계적 후퇴 질문과 원래 질문을 모두 기반으로 문서를 검색하고 싶을 것입니다. 다음과 같이 쉽게 둘 다 반환할 수 있습니다:

```python
from langchain_core.runnables import RunnablePassthrough

step_back_and_original = RunnablePassthrough.assign(step_back=step_back)

step_back_and_original.invoke({"question": question})
```

```output
{'question': 'Gemini Pro와 벡터스토어 및 DuckDuckGo 검색 같은 도구를 사용하여 LangGraph 에이전트를 구축했습니다. 이벤트 스트림에서 LLM 호출만 얻으려면 어떻게 해야 하나요?',
 'step_back': 'LangGraph가 Gemini Pro, 벡터스토어 및 DuckDuckGo 검색과 같은 외부 도구를 사용하여 구축된 에이전트가 생성한 이벤트 스트림에서 LLM 호출을 추출하는 특정 메서드 또는 함수는 무엇인가요?'}
```

## 구조화된 출력을 얻기 위한 함수 호출 사용

다른 쿼리 분석 기술과 이 기술을 구성하고 있다면, 우리는 구조화된 쿼리 객체를 얻기 위해 함수 호출을 사용할 가능성이 높습니다. 다음과 같이 단계적 후퇴 프롬프트를 위해 함수 호출을 사용할 수 있습니다:

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.pydantic_v1 import BaseModel, Field


class StepBackQuery(BaseModel):
    step_back_question: str = Field(
        ...,
        description="이 제품들 중 하나 이상에 대한 특정 사용자 질문이 주어지면, 특정 질문에 답하기 위해 필요한 더 일반적인 질문을 작성하세요.",
    )


llm_with_tools = llm.bind_tools([StepBackQuery])
hyde_chain = prompt | llm_with_tools | PydanticToolsParser(tools=[StepBackQuery])
hyde_chain.invoke({"question": question})
```

```output
[StepBackQuery(step_back_question='Python 프레임워크인 LangGraph에서 이벤트 스트림의 특정 유형의 호출을 필터링하고 추출하는 단계는 무엇인가요?')]
```