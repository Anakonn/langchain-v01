---
sidebar_position: 1
translated: true
---

# 쿼리 분해

사용자가 질문을 할 때, 관련 결과가 단일 쿼리로 반환될 것이라는 보장은 없습니다. 때로는 질문을 명확한 하위 질문으로 나누고, 각 하위 질문에 대한 결과를 검색한 후 누적된 컨텍스트를 사용하여 답변해야 합니다.

예를 들어, 사용자가 "Web Voyager가 reflection agents와 어떻게 다른가요?"라고 물을 때, Web Voyager를 설명하는 문서와 reflection agents를 설명하는 문서는 있지만 두 가지를 비교하는 문서가 없는 경우, "Web Voyager란 무엇인가?"와 "reflection agents란 무엇인가?"에 대한 검색 결과를 결합하여 사용자 질문에 직접적으로 기반한 검색 결과보다 더 나은 결과를 얻을 수 있습니다.

이 입력을 여러 개의 명확한 하위 쿼리로 나누는 과정을 **쿼리 분해**라고 합니다. 때로는 하위 쿼리 생성이라고도 합니다. 이 가이드에서는 LangChain YouTube 동영상에 대한 Q&A 봇 예제를 사용하여 분해를 수행하는 방법을 설명합니다.

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

사용자 질문을 하위 질문 목록으로 변환하기 위해 OpenAI의 함수 호출 API를 사용할 것입니다. 이 API는 각 턴마다 여러 개의 함수를 반환할 수 있습니다.

```python
import datetime
from typing import Literal, Optional, Tuple

from langchain_core.pydantic_v1 import BaseModel, Field


class SubQuery(BaseModel):
    """소프트웨어 라이브러리에 대한 튜토리얼 동영상 데이터베이스에서 검색합니다."""

    sub_query: str = Field(
        ...,
        description="데이터베이스에 대한 매우 구체적인 쿼리입니다.",
    )
```

```python
from langchain.output_parsers import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """사용자 질문을 데이터베이스 쿼리로 변환하는 전문가입니다. \
당신은 LLM 기반 응용 프로그램을 구축하는 소프트웨어 라이브러리에 대한 튜토리얼 비디오 데이터베이스에 액세스할 수 있습니다. \

쿼리 분해를 수행하십시오. 사용자 질문을 주어진 질문에 답하기 위해 \
답해야 할 명확한 하위 질문으로 나누십시오.

알 수 없는 약어 또는 단어가 있는 경우, 이를 바꾸려고 하지 마십시오."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
llm_with_tools = llm.bind_tools([SubQuery])
parser = PydanticToolsParser(tools=[SubQuery])
query_analyzer = prompt | llm_with_tools | parser
```

한번 시도해 보겠습니다:

```python
query_analyzer.invoke({"question": "how to do rag"})
```

```output
[SubQuery(sub_query='How to do rag')]
```

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
```

```output
[SubQuery(sub_query='How to use multi-modal models in a chain?'),
 SubQuery(sub_query='How to turn a chain into a REST API?')]
```

```python
query_analyzer.invoke(
    {
        "question": "what's the difference between web voyager and reflection agents? do they use langgraph?"
    }
)
```

```output
[SubQuery(sub_query='What is Web Voyager and how does it differ from Reflection Agents?'),
 SubQuery(sub_query='Do Web Voyager and Reflection Agents use Langgraph?')]
```

## 예제 추가 및 프롬프트 조정

이것은 꽤 잘 작동하지만, 마지막 질문을 더 분해하여 Web Voyager와 Reflection Agents에 대한 쿼리를 분리하고자 할 수 있습니다. 인덱스와 잘 맞는 쿼리 유형을 처음부터 확신할 수 없는 경우, 하위 쿼리와 상위 쿼리를 모두 반환하도록 의도적으로 중복을 포함할 수도 있습니다.

쿼리 생성 결과를 조정하기 위해, 입력 질문과 표준 출력 쿼리의 예를 프롬프트에 추가할 수 있습니다. 시스템 메시지를 개선할 수도 있습니다.

```python
examples = []
```

```python
question = "What's chat langchain, is it a langchain template?"
queries = [
    SubQuery(sub_query="What is chat langchain"),
    SubQuery(sub_query="What is a langchain template"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "How would I use LangGraph to build an automaton"
queries = [
    SubQuery(sub_query="How to build automaton with LangGraph"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "How to build multi-agent system and stream intermediate steps from it"
queries = [
    SubQuery(sub_query="How to build multi-agent system"),
    SubQuery(sub_query="How to stream intermediate steps"),
    SubQuery(sub_query="How to stream intermediate steps from multi-agent system"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "What's the difference between LangChain agents and LangGraph?"
queries = [
    SubQuery(sub_query="What's the difference between LangChain agents and LangGraph?"),
    SubQuery(sub_query="What are LangChain agents"),
    SubQuery(sub_query="What is LangGraph"),
]
examples.append({"input": question, "tool_calls": queries})
```

이제 각 프롬프트에 예제를 포함하도록 프롬프트 템플릿과 체인을 업데이트해야 합니다. OpenAI 함수 호출을 사용하고 있으므로 예제 입력과 출력을 모델에 보내기 위해 약간의 추가 구조화를 해야 합니다. 이를 위해 `tool_example_to_messages` 도우미 함수를 작성하겠습니다:

```python
import uuid
from typing import Dict, List

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
        "This is an example of a correct usage of this tool. Make sure to continue using the tool this way."
    ] * len(openai_tool_calls)
    for output, tool_call in zip(tool_outputs, openai_tool_calls):
        messages.append(ToolMessage(content=output, tool_call_id=tool_call["id"]))
    return messages


example_msgs = [msg for ex in examples for msg in tool_example_to_messages(ex)]
```

```python
from langchain_core.prompts import MessagesPlaceholder

system = """사용자 질문을 데이터베이스 쿼리로 변환하는 전문가입니다. \
당신은 LLM 기반 응용 프로그램을 구축하는 소프트웨어 라이브러리에 대한 튜토리얼 비디오 데이터베이스에 액세스할 수 있습니다. \

쿼리 분해를 수행하십시오. 주어진 질문에 답하기 위해 가장 구체적인 하위 질문으로 나누십시오. \
각 하위 질문은 단일 개념/사실/아이디어에 관한 것이어야 합니다.

알 수 없는 약어 또는 단어가 있는 경우, 이를 바꾸려고 하지 마십시오."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        MessagesPlaceholder("examples", optional=True),
        ("human", "{question}"),
    ]
)
query_analyzer_with_examples = (
    prompt.partial(examples=example_msgs) | llm_with_tools | parser
)
```

```python
query_analyzer_with_examples.invoke(
    {
        "question": "what's the difference between web voyager and reflection agents? do they use langgraph?"
    }
)
```

```output
[SubQuery(sub_query="What's the difference between web voyager and reflection agents"),
 SubQuery(sub_query='Do web voyager and reflection agents use LangGraph'),
 SubQuery(sub_query='What is web voyager'),
 SubQuery(sub_query='What are reflection agents')]
```