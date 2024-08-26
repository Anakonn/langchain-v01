---
sidebar_position: 2
translated: true
---

# 예제를 프롬프트에 추가하기

쿼리 분석이 복잡해질수록 LLM은 특정 시나리오에서 어떻게 반응해야 할지 이해하는 데 어려움을 겪을 수 있습니다. 이러한 성능을 향상시키기 위해, 프롬프트에 예제를 추가하여 LLM을 안내할 수 있습니다.

여기서는 [빠른 시작](/docs/use_cases/query_analysis/quickstart)에서 구축한 LangChain YouTube 비디오 쿼리 분석기에 예제를 추가하는 방법을 살펴보겠습니다.

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

## 쿼리 스키마

모델이 출력해야 하는 쿼리 스키마를 정의하겠습니다. 쿼리 분석을 조금 더 흥미롭게 만들기 위해, 최상위 질문에서 파생된 더 좁은 질문을 포함하는 `sub_queries` 필드를 추가하겠습니다.

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field

sub_queries_description = """\
If the original question contains multiple distinct sub-questions, \
or if there are more generic questions that would be helpful to answer in \
order to answer the original question, write a list of all relevant sub-questions. \
Make sure this list is comprehensive and covers all parts of the original question. \
It's ok if there's redundancy in the sub-questions. \
Make sure the sub-questions are as narrowly focused as possible."""

class Search(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    query: str = Field(
        ...,
        description="Primary similarity search query applied to video transcripts.",
    )
    sub_queries: List[str] = Field(
        default_factory=list, description=sub_queries_description
    )
    publish_year: Optional[int] = Field(None, description="Year video was published")
```

## 쿼리 생성

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \
Given a question, return a list of database queries optimized to retrieve the most relevant results.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        MessagesPlaceholder("examples", optional=True),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(Search)
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

예제 없이 쿼리 분석기를 시도해 보겠습니다:

```python
query_analyzer.invoke(
    "what's the difference between web voyager and reflection agents? do both use langgraph?"
)
```

```output
Search(query='web voyager vs reflection agents', sub_queries=['difference between web voyager and reflection agents', 'do web voyager and reflection agents use langgraph'], publish_year=None)
```

## 예제 추가 및 프롬프트 조정

이 결과도 좋지만, Web Voyager와 Reflection Agents에 대한 질문을 더 분리하여 쿼리를 생성하고 싶을 수 있습니다.

쿼리 생성 결과를 조정하기 위해, 입력 질문과 골드 스탠다드 출력 쿼리의 예제를 프롬프트에 추가할 수 있습니다.

```python
examples = []
```

```python
question = "What's chat langchain, is it a langchain template?"
query = Search(
    query="What is chat langchain and is it a langchain template?",
    sub_queries=["What is chat langchain", "What is a langchain template"],
)
examples.append({"input": question, "tool_calls": [query]})
```

```python
question = "How to build multi-agent system and stream intermediate steps from it"
query = Search(
    query="How to build multi-agent system and stream intermediate steps from it",
    sub_queries=[
        "How to build multi-agent system",
        "How to stream intermediate steps from multi-agent system",
        "How to stream intermediate steps",
    ],
)
examples.append({"input": question, "tool_calls": [query]})
```

```python
question = "LangChain agents vs LangGraph?"
query = Search(
    query="What's the difference between LangChain agents and LangGraph? How do you deploy them?",
    sub_queries=[
        "What are LangChain agents",
        "What is LangGraph",
        "How do you deploy LangChain agents",
        "How do you deploy LangGraph",
    ],
)
examples.append({"input": question, "tool_calls": [query]})
```

이제 프롬프트 템플릿과 체인을 업데이트하여 각 프롬프트에 예제가 포함되도록 해야 합니다. OpenAI의 함수 호출을 사용할 때, 예제 입력 및 출력을 모델에 메시지로 보내야 합니다. 이를 위해 `tool_example_to_messages` 도우미 함수를 만들어서 처리하겠습니다:

```python
import uuid
from typing import Dict

from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)

def tool_example_to_messages(example: Dict) -> List[BaseMessage]:
    messages: List[BaseMessage] = [HumanMessage(content=example["input"])]
    openai_tool_calls = []
    for tool_call in example["tool_calls"]:
        openai_tool_calls.append(
            {
                "id": str(uuid.uuid4()),
                "type": "function",
                "function": {
                    "name": tool_call.__class__.__name__,
                    "arguments": tool_call.json(),
                },
            }
        )
    messages.append(
        AIMessage(content="", additional_kwargs={"tool_calls": openai_tool_calls})
    )
    tool_outputs = example.get("tool_outputs") or [
        "You have correctly called this tool."
    ] * len(openai_tool_calls)
    for output, tool_call in zip(tool_outputs, openai_tool_calls):
        messages.append(ToolMessage(content=output, tool_call_id=tool_call["id"]))
    return messages

example_msgs = [msg for ex in examples for msg in tool_example_to_messages(ex)]
```

```python
from langchain_core.prompts import MessagesPlaceholder

query_analyzer_with_examples = (
    {"question": RunnablePassthrough()}
    | prompt.partial(examples=example_msgs)
    | structured_llm
)
```

```python
query_analyzer_with_examples.invoke(
    "what's the difference between web voyager and reflection agents? do both use langgraph?"
)
```

```output
Search(query='Difference between web voyager and reflection agents, do they both use LangGraph?', sub_queries=['What is Web Voyager', 'What are Reflection agents', 'Do Web Voyager and Reflection agents use LangGraph'], publish_year=None)
```

예제를 추가하여 검색 쿼리가 조금 더 잘 분해된 것을 확인할 수 있습니다. 추가적인 프롬프트 엔지니어링 및 예제 조정을 통해 쿼리 생성을 더욱 향상시킬 수 있습니다.

예제가 모델에 메시지로 전달되는 것을 [LangSmith 추적](https://smith.langchain.com/public/aeaaafce-d2b1-4943-9a61-bc954e8fc6f2/r)에서 확인할 수 있습니다.