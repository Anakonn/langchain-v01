---
sidebar_position: 2
translated: true
---

# 라우팅

때때로 우리는 여러 도메인에 대한 여러 인덱스를 가지고 있으며, 질문에 따라 이러한 인덱스의 하위 집합을 쿼리하고 싶을 수 있습니다. 예를 들어, LangChain Python 문서 전체에 대한 벡터 저장소 인덱스 하나와 LangChain JS 문서 전체에 대한 벡터 저장소 인덱스 하나가 있다고 가정해 보겠습니다. LangChain 사용법에 대한 질문이 주어지면, 질문이 어떤 언어를 참조하는지 추론하여 적절한 문서를 쿼리하고 싶을 것입니다. **쿼리 라우팅**은 쿼리가 수행되어야 하는 인덱스나 인덱스의 하위 집합을 분류하는 과정입니다.

## 설정

#### 종속성 설치

```python
%pip install -qU langchain-core langchain-openai
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

## 함수 호출 모델을 사용한 라우팅

함수 호출 모델을 사용하면 분류에 모델을 사용하는 것이 간단해집니다. 라우팅은 결국 분류 문제입니다:

```python
from typing import Literal

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI


class RouteQuery(BaseModel):
    """사용자 쿼리를 가장 관련성이 높은 데이터 소스로 라우팅합니다."""

    datasource: Literal["python_docs", "js_docs", "golang_docs"] = Field(
        ...,
        description="사용자 질문을 기반으로 가장 관련성이 높은 데이터 소스를 선택하세요.",
    )


llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(RouteQuery)

system = """당신은 사용자 질문을 적절한 데이터 소스로 라우팅하는 전문가입니다.

질문이 참조하는 프로그래밍 언어를 기반으로 관련 데이터 소스로 라우팅하세요."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)

router = prompt | structured_llm
```

```output
/Users/bagatur/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

```python
question = """다음 코드가 작동하지 않는 이유는 무엇인가요:

from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(["human", "speak in {language}"])
prompt.invoke("french")
"""
router.invoke({"question": question})
```

```output
RouteQuery(datasource='python_docs')
```

```python
question = """다음 코드가 작동하지 않는 이유는 무엇인가요:


import { ChatPromptTemplate } from "@langchain/core/prompts";


const chatPrompt = ChatPromptTemplate.fromMessages([
  ["human", "speak in {language}"],
]);

const formattedChatPrompt = await chatPrompt.invoke({
  input_language: "french"
});
"""
router.invoke({"question": question})
```

```output
RouteQuery(datasource='js_docs')
```

## 여러 인덱스로 라우팅

여러 인덱스를 쿼리하려는 경우에도 가능합니다. 우리의 스키마를 업데이트하여 데이터 소스의 목록을 허용할 수 있습니다:

```python
from typing import List


class RouteQuery(BaseModel):
    """사용자 쿼리를 가장 관련성이 높은 데이터 소스로 라우팅합니다."""

    datasources: List[Literal["python_docs", "js_docs", "golang_docs"]] = Field(
        ...,
        description="사용자 질문을 기반으로 가장 관련성이 높은 데이터 소스를 선택하세요.",
    )


llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(RouteQuery)
router = prompt | structured_llm
router.invoke(
    {
        "question": "OpenAI 채팅 모델의 Python과 JS 구현 간 기능이 동일한가요?"
    }
)
```

```output
RouteQuery(datasources=['python_docs', 'js_docs'])
```