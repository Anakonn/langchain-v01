---
translated: true
---

# 🦜🕸️LangGraph

[![Downloads](https://static.pepy.tech/badge/langgraph/month)](https://pepy.tech/project/langgraph)
[![Open Issues](https://img.shields.io/github/issues-raw/langchain-ai/langgraph)](https://github.com/langchain-ai/langgraph/issues)
[![](https://dcbadge.vercel.app/api/server/6adMQxSpJS?compact=true&style=flat)](https://discord.com/channels/1038097195422978059/1170024642245832774)
[![Docs](https://img.shields.io/badge/docs-latest-blue)](https://langchain-ai.github.io/langgraph/)

⚡ 그래프 형태의 언어 에이전트 구축 ⚡

## 개요

[LangGraph](https://langchain-ai.github.io/langgraph/)는 LLM을 사용하여 상태 유지 및 다중 행위자 애플리케이션을 구축하기 위한 라이브러리입니다.
[Pregel](https://research.google/pubs/pub37252/) 및 [Apache Beam](https://beam.apache.org/)에서 영감을 받아 LangGraph는 일반적인 파이썬 함수(또는 [JS](https://github.com/langchain-ai/langgraphjs))를 사용하여 주기적 계산 단계 전반에 걸쳐 여러 체인(또는 행위자)을 조정하고 체크포인트를 설정할 수 있게 합니다. 공개 인터페이스는 [NetworkX](https://networkx.org/documentation/latest/)에서 영감을 받았습니다.

주된 사용 용도는 LLM 애플리케이션에 **주기** 및 **지속성**을 추가하는 것입니다. 빠른 방향성 비순환 그래프(DAG)가 필요할 경우 [LangChain Expression Language](https://python.langchain.com/docs/expression_language/)를 사용하여 이미 이를 달성할 수 있습니다.

주기는 LLM을 반복적으로 호출하여 다음 작업을 결정하는 에이전트 행동에 중요합니다.

## 설치

```shell
pip install -U langgraph
```

## 빠른 시작

LangGraph의 중심 개념 중 하나는 상태입니다. 각 그래프 실행은 그래프의 노드를 실행하는 동안 전달되는 상태를 생성하며, 각 노드는 실행 후 반환값으로 내부 상태를 업데이트합니다. 그래프가 내부 상태를 업데이트하는 방식은 선택한 그래프 유형 또는 사용자 정의 함수에 의해 정의됩니다.

LangGraph의 상태는 매우 일반적일 수 있지만, 간단하게 시작하기 위해 그래프의 상태가 LangChain 채팅 모델과 함께 사용할 때 편리한 채팅 메시지 목록으로 제한된 예제를 보여드리겠습니다. 이는 내장된 `MessageGraph` 클래스를 사용합니다. 이렇게 하면 채팅 모델 출력을 직접 반환할 수 있습니다.

먼저 LangChain OpenAI 통합 패키지를 설치하세요:

```python
pip install langchain_openai
```

또한 환경 변수를 설정해야 합니다:

```shell
export OPENAI_API_KEY=sk-...
```

이제 준비가 되었습니다! 아래 그래프는 `"oracle"`이라는 단일 노드를 포함하고 있으며, 이 노드는 채팅 모델을 실행하고 결과를 반환합니다:

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "🦜🕸️LangGraph"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "🦜🕸️LangGraph"}]-->
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langgraph.graph import END, MessageGraph

model = ChatOpenAI(temperature=0)

graph = MessageGraph()

graph.add_node("oracle", model)
graph.add_edge("oracle", END)

graph.set_entry_point("oracle")

runnable = graph.compile()
```

실행해봅시다!

```python
runnable.invoke(HumanMessage("1 + 1은 얼마인가요?"))
```

```
[HumanMessage(content='1 + 1은 얼마인가요?'), AIMessage(content='1 + 1은 2입니다.')]
```

그럼 여기서 무엇을 했는지 단계별로 설명하겠습니다:

1. 먼저 모델과 `MessageGraph`를 초기화합니다.
2. 다음으로, 그래프에 `"oracle"`이라는 단일 노드를 추가합니다. 이 노드는 주어진 입력으로 모델을 호출합니다.
3. 이 `"oracle"` 노드에서 특별한 문자열 `END` (`"__end__"`)로의 엣지를 추가합니다. 이는 현재 노드 이후 실행이 종료됨을 의미합니다.
4. `"oracle"`을 그래프의 진입점으로 설정합니다.
5. 그래프를 컴파일하여 저수준의 [pregel 작업](https://research.google/pubs/pregel-a-system-for-large-scale-graph-processing/)으로 변환하여 실행 가능하게 합니다.

그런 다음 그래프를 실행할 때:

1. LangGraph는 입력 메시지를 내부 상태에 추가한 후 상태를 진입점 노드인 `"oracle"`에 전달합니다.
2. `"oracle"` 노드는 채팅 모델을 호출하여 실행됩니다.
3. 채팅 모델은 `AIMessage`를 반환합니다. LangGraph는 이를 상태에 추가합니다.
4. 실행은 특별한 `END` 값으로 진행되고 최종 상태를 출력합니다.

결과적으로 두 개의 채팅 메시지 목록을 출력으로 받습니다.

### LCEL과의 상호작용

LangChain에 익숙한 분들을 위해 - `add_node`는 실제로 함수나 [runnable](https://python.langchain.com/docs/expression_language/interface/)을 입력으로 받습니다. 위 예제에서는 모델을 "있는 그대로" 사용했지만, 함수를 전달할 수도 있습니다:

```python
def call_oracle(messages: list):
    return model.invoke(messages)

graph.add_node("oracle", call_oracle)
```

다만 [runnable](https://python.langchain.com/docs/expression_language/interface/)의 입력이 **전체 현재 상태**임을 유의해야 합니다. 따라서 다음은 실패합니다:

```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "🦜🕸️LangGraph"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "🦜🕸️LangGraph"}]-->
# 이것은 MessageGraph와 함께 작동하지 않습니다!

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "당신은 항상 해적 방언으로 말하는 도움이 되는 비서입니다 {name}"),
    MessagesPlaceholder(variable_name="messages"),
])

chain = prompt | model

# 상태는 메시지 목록이지만, 우리의 체인은 dict 입력을 기대합니다:

#

# { "name": some_string, "messages": [] }

#

# 따라서 그래프가 여기서 실행될 때 예외를 던질 것입니다.

graph.add_node("oracle", chain)
```

## 조건부 엣지

이제 조금 덜 사소한 것으로 넘어가 봅시다. LLM은 수학에 어려움을 겪으므로 [도구 호출](https://python.langchain.com/docs/modules/model_io/chat/function_calling/)을 사용하여 `"multiply"` 노드를 조건부로 호출하도록 합시다.

가장 최근 메시지가 도구 호출인 경우 이를 계산하는 추가 `"multiply"` 노드를 포함하도록 그래프를 재작성하겠습니다.
또한 계산기의 스키마를 도구로 OpenAI 모델에 [바인딩](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.bind_tools)하여 모델이 필요한 경우 이 도구를 선택적으로 사용할 수 있도록 하겠습니다:

```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.tool.html", "title": "🦜🕸️LangGraph"}]-->
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode

@tool
def multiply(first_number: int, second_number: int):
    """두 숫자를 곱합니다."""
    return first_number * second_number

model = ChatOpenAI(temperature=0)
model_with_tools = model.bind_tools([multiply])

builder = MessageGraph()

builder.add_node("oracle", model_with_tools)

tool_node = ToolNode([multiply])
builder.add_node("multiply", tool_node)

builder.add_edge("multiply", END)

builder.set_entry_point("oracle")
```

이제 생각해 봅시다 - 무엇을 원하나요?

- `"oracle"` 노드가 도구 호출을 기대하는 메시지를 반환하면 `"multiply"` 노드를 실행하고 싶습니다.
- 그렇지 않으면 실행을 종료할 수 있습니다.

이는 **조건부 엣지**를 사용하여 달성할 수 있습니다. 조건부 엣지는 현재 상태에서 함수를 호출하고 함수의 출력을 노드로 실행을 라우팅합니다.

다음은 그 예입니다:

```python
from typing import Literal

def router(state: List[BaseMessage]) -> Literal["multiply", "__end__"]:
    tool_calls = state[-1].additional_kwargs.get("tool_calls", [])
    if len(tool_calls):
        return "multiply"
    else:
        return "__end__"

builder.add_conditional_edges("oracle", router)
```

모델 출력에 도구 호출이 포함되어 있으면 `"multiply"` 노드로 이동합니다. 그렇지 않으면 실행을 종료합니다.

훌륭합니다! 이제 그래프를 컴파일하고 테스트해 봅시다. 수학 관련 질문은 계산기 도구로 라우팅됩니다:

```python
runnable = builder.compile()

runnable.invoke(HumanMessage("123 * 456은 얼마인가요?"))
```

```

[HumanMessage(content='123 * 456은 얼마인가요?'),
 AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_OPbdlm8Ih1mNOObGf3tMcNgb', 'function': {'arguments': '{"first_number":123,"second_number":456}', 'name': 'multiply'}, 'type': 'function'}]}),
 ToolMessage(content='56088', tool_call_id='call_OPbdlm8Ih1mNOObGf3tMcNgb')]
```

반면 대화형 응답은 직접 출력됩니다:

```python
runnable.invoke(HumanMessage("당신의 이름은 무엇인가요?"))
```

```
[HumanMessage(content='당신의 이름은 무엇인가요?'),
 AIMessage(content='제 이름은 Assistant입니다. 오늘 어떻게 도와드릴까요?')]
```

## 주기

이제 더 일반적인 주기 예제를 살펴보겠습니다. 우리는 LangChain의 `AgentExecutor` 클래스를 재구성할 것입니다. 에이전트 자체는 채팅 모델과 도구 호출을 사용할 것입니다.
이 에이전트는 모든 상태를 메시지 목록으로 나타낼 것입니다.

일부 LangChain 커뮤니티 패키지와 예제 도구로 사용할 [Tavily](https://app.tavily.com/sign-in)를 설치해야 합니다.

```shell
pip install -U langgraph langchain_openai tavily-python
```

또한 OpenAI와 Tavily API 접근을 위한 추가 환경 변수를 설정해야 합니다.

```shell
export OPENAI_API_KEY=sk-...
export TAVILY_API_KEY=tvly-...
```

선택 사항으로, 최상의 가시성을 위해 [LangSmith](https://docs.smith.langchain.com/)를 설정할 수 있습니다.

```shell
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY=ls__...
```

### 도구 설정

위와 마찬가지로, 사용할 도구를 먼저 정의합니다.
이 간단한 예제에서는 웹 검색 도구를 사용할 것입니다.
그러나, 자신만의 도구를 만드는 것은 매우 쉽습니다. [여기](https://python.langchain.com/docs/modules/agents/tools/custom_tools)에서 문서를 참조하세요.

```python
<!--IMPORTS:[{"imported": "TavilySearchResults", "source": "langchain_community.tools.tavily_search", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_community.tools.tavily_search.tool.TavilySearchResults.html", "title": "🦜🕸️LangGraph"}]-->
from langchain_community.tools.tavily_search import TavilySearchResults

tools = [TavilySearchResults(max_results=1)]
```

이제 이 도구들을 간단한 LangGraph [ToolNode](https://langchain-ai.github.io/langgraph/reference/prebuilt/#toolnode)에 감쌀 수 있습니다.
이 클래스는 [tool_calls](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage.tool_calls)를 포함한 메시지 목록을 받아 LLM이 실행하도록 요청한 도구를 호출하고, 새로운 [ToolMessage](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolMessage.html#langchain_core.messages.tool.ToolMessage)로 출력합니다.

```python
from langgraph.prebuilt import ToolNode

tool_node = ToolNode(tools)
```

### 모델 설정

이제 사용할 채팅 모델을 로드해야 합니다.

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "🦜🕸️LangGraph"}]-->
from langchain_openai import ChatOpenAI

# 토큰을 스트리밍할 수 있도록 streaming=True로 설정합니다.

# 스트리밍에 대한 자세한 내용은 스트리밍 섹션을 참조하세요.

model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, streaming=True)
```

이 작업을 마친 후에는 모델이 호출할 수 있는 도구가 있다는 것을 모델이 알고 있어야 합니다.
이를 위해 [bind_tools()](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.bind_tools) 메서드를 사용하여 LangChain 도구를 OpenAI 도구 호출 형식으로 변환할 수 있습니다.

```python
model = model.bind_tools(tools)
```

### 에이전트 상태 정의

이번에는 더 일반적인 `StateGraph`를 사용하겠습니다.
이 그래프는 각 노드에 전달되는 상태 객체로 매개변수화됩니다.
각 노드는 상태를 업데이트하는 작업을 반환합니다.
이 작업은 상태의 특정 속성을 설정(예: 기존 값 덮어쓰기)하거나 기존 속성에 추가할 수 있습니다.
설정할지 추가할지는 생성한 상태 객체에 주석을 달아 나타냅니다.

이 예제에서는 상태로 메시지 목록만 추적할 것입니다.
각 노드는 이 목록에 메시지를 추가하기만 하면 됩니다.
따라서 `TypedDict`를 사용하여 하나의 키(`messages`)를 가지고 있으며, 업데이트 시 항상 `messages` 키에 **추가**되도록 주석을 달겠습니다.
(참고: 상태는 [pydantic BaseModel](https://docs.pydantic.dev/latest/api/base_model/)을 포함한 [타입](https://docs.python.org/3/library/stdtypes.html#type-objects)이 될 수 있습니다).

```python
from typing import TypedDict, Annotated

def add_messages(left: list, right: list):
    """덮어쓰지 않고 추가합니다."""
    return left + right

class AgentState(TypedDict):
    # 주석 내의 `add_messages` 함수는
    # 업데이트가 상태에 어떻게 병합되는지를 정의합니다.
    messages: Annotated[list, add_messages]
```

초기 예제에서 사용된 `MessageGraph`를 이 그래프의 사전 구성된 버전으로 생각할 수 있습니다. 여기서 상태는 직접적으로 메시지 배열이며,
업데이트 단계는 항상 노드의 반환값을 내부 상태에 추가합니다.

### 노드 정의

이제 그래프에 몇 가지 다른 노드를 정의해야 합니다.
`langgraph`에서 노드는 일반 파이썬 함수이거나 [runnable](https://python.langchain.com/docs/expression_language/)일 수 있습니다.

이 용도로 필요한 주요 노드는 다음과 같습니다:

1. 에이전트: 어떤 작업을 수행할지 결정합니다.
2. 도구 호출 함수: 에이전트가 작업을 수행하기로 결정하면 이 노드가 그 작업을 실행합니다. 이는 이미 위에서 정의했습니다.

또한 몇 가지 엣지를 정의해야 합니다.
이 중 일부는 조건부일 수 있습니다.
조건부인 이유는 그래프의 `State` 내용에 따라 목적지가 결정되기 때문입니다.

어떤 경로가 선택될지는 해당 노드가 실행될 때까지 알 수 없습니다(LLM이 결정합니다). 우리의 사용 사례에서는 각 유형의 엣지가 하나씩 필요합니다:

1. 조건부 엣지: 에이전트를 호출한 후에는:

   a. 에이전트가 작업을 수행하라고 하면 도구를 실행하거나,

   b. 에이전트가 도구 실행을 요청하지 않으면 종료(사용자에게 응답)합니다.

2. 일반 엣지: 도구가 호출된 후에는 그래프가 항상 에이전트로 돌아와 다음 작업을 결정합니다.

노드와 조건부 엣지를 정의하는 함수를 정의해 봅시다.

```python
from typing import Literal

# 계속할지 여부를 결정하는 함수를 정의합니다.

def should_continue(state: AgentState) -> Literal["action", "__end__"]:
    messages = state['messages']
    last_message = messages[-1]
    # LLM이 도구 호출을 하면 "action" 노드로 라우팅합니다.
    if last_message.tool_calls:
        return "action"
    # 그렇지 않으면 중지(사용자에게 응답)합니다.
    return "__end__"


# 모델을 호출하는 함수를 정의합니다.

def call_model(state: AgentState):
    messages = state['messages']
    response = model.invoke(messages)
    # 우리는 목록을 반환합니다. 이는 기존 목록에 추가됩니다.
    return {"messages": [response]}
```

### 그래프 정의

이제 모든 것을 합쳐 그래프를 정의해 보겠습니다!

```python
from langgraph.graph import StateGraph, END
# 새로운 그래프를 정의합니다.

workflow = StateGraph(AgentState)

# 주기를 구성할 두 노드를 정의합니다.

workflow.add_node("agent", call_model)
workflow.add_node("action", tool_node)

# 진입점을 `agent`로 설정합니다.

# 이는 이 노드가 처음으로 호출되는 노드임을 의미합니다.

workflow.set_entry_point("agent")

# 이제 조건부 엣지를 추가합니다.

workflow.add_conditional_edges(
    # 먼저 시작 노드를 정의합니다. 여기서는 `agent`를 사용합니다.
    # 이는 `agent` 노드가 호출된 후에 수행할 엣지입니다.
    "agent",
    # 다음으로, 어떤 노드가 다음에 호출될지 결정할 함수를 전달합니다.
    should_continue,
)

# 이제 `tools`에서 `agent`로의 일반 엣지를 추가합니다.

# 이는 `tools`가 호출된 후에 `agent` 노드가 다음에 호출됨을 의미합니다.

workflow.add_edge('action', 'agent')

# 마지막으로 컴파일합니다!

# 이를 LangChain Runnable로 컴파일합니다.

# 이는 다른 runnable처럼 사용할 수 있음을 의미합니다.

app = workflow.compile()
```

### 사용하기

이제 사용할 수 있습니다!
이는 다른 LangChain runnable과 동일한 [인터페이스](https://python.langchain.com/docs/expression_language/)를 제공합니다.
이 [runnable](https://python.langchain.com/docs/expression_language/interface/)은 메시지 목록을 받습니다.

```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "🦜🕸️LangGraph"}]-->
from langchain_core.messages import HumanMessage

inputs = {"messages": [HumanMessage(content="sf의 날씨는 어떻습니까?")]}
app.invoke(inputs)
```

이 작업은 약간의 시간이 걸릴 수 있습니다 - 백그라운드에서 몇 가지 호출을 수행 중입니다.
중간 결과를 실시간으로 보려면 스트리밍을 사용할 수 있습니다 - 아래에서 더 많은 정보를 확인하세요.

## 스트리밍

LangGraph는 여러 가지 스트리밍 유형을 지원합니다.

### 노드 출력 스트리밍

LangGraph를 사용하면 각 노드에서 생성되는 출력물을 쉽게 스트리밍할 수 있습니다.

```python
inputs = {"messages": [HumanMessage(content="sf의 날씨는 어떻습니까?")]}
for output in app.stream(inputs, stream_mode="updates"):
    # stream()은 노드 이름으로 키가 지정된 출력이 있는 딕셔너리를 생성합니다.
    for key, value in output.items():
        print(f"노드 '{key}'의 출력:")
        print("---")
        print(value)
    print("\n---\n")
```

```
노드 'agent'의 출력:
---
{'messages': [AIMessage(content='', additional_kwargs={'function_call': {'arguments': '{\n  "query": "weather in San Francisco"\n}', 'name': 'tavily_search_results_json'}})]}

---

노드 'action'의 출력:
---
{'messages': [FunctionMessage(content="[{'url': 'https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States', 'content': 'January 2024 Weather History in San Francisco California, United States  Daily Precipitation in January 2024 in San Francisco Observed Weather in January 2024 in San Francisco  San Francisco Temperature History January 2024 Hourly Temperature in January 2024 in San Francisco  Hours of Daylight and Twilight in January 2024 in San FranciscoThis report shows the past weather for San Francisco, providing a weather history for January 2024. It features all historical weather data series we have available, including the San Francisco temperature history for January 2024. You can drill down from year to month and even day level reports by clicking on the graphs.'}]", name='tavily_search_results_json')]}

---

노드 'agent'의 출력:
---
{'messages': [AIMessage(content="현재 샌프란시스코의 날씨를 찾을 수 없었습니다. 그러나, 샌프란시스코의 2024년 1월 날씨 데이터를 확인하려면 [WeatherSpark](https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States)을 방문하세요.")]}

---

노드 '__end__'의 출력:
---
{'messages': [HumanMessage(content='sf의 날씨는 어떻습니까?'), AIMessage(content='', additional_kwargs={'function_call': {'arguments': '{\n  "query": "weather in San Francisco"\n}', 'name': 'tavily_search_results_json'}}), FunctionMessage(content="[{'url': 'https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States', 'content': 'January 2024 Weather History in San Francisco California, United States  Daily Precipitation in January 2024 in San Francisco Observed Weather in January 2024 in San Francisco  San Francisco Temperature History January 2024 Hourly Temperature in January 2024 in San Francisco  Hours of Daylight and Twilight in January 2024 in San FranciscoThis report shows the past weather for San Francisco, providing a weather history for January 2024. It features all historical weather data series we have available, including the San Francisco temperature history for January 2024. You can drill down from year to month and even day level reports by clicking on the graphs.'}]", name='tavily_search_results_json'), AIMessage(content="현재 샌프란시스코의 날씨를 찾을 수 없었습니다. 그러나, 샌프란시스코의 2024년 1월 날씨 데이터를 확인하려면 [WeatherSpark](https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States)을 방문하세요.")]}

---
```

### LLM 토큰 스트리밍

각 노드에서 생성되는 LLM 토큰에도 접근할 수 있습니다.
이 경우 "agent" 노드만 LLM 토큰을 생성합니다.
이 기능이 제대로 작동하려면 스트리밍을 지원하는 LLM을 사용해야 하며, LLM을 생성할 때 이를 설정해야 합니다(예: `ChatOpenAI(model="gpt-3.5-turbo-1106", streaming=True)`).

```python
inputs = {"messages": [HumanMessage(content="sf의 날씨는 어떻습니까?")]}
async for output in app.astream_log(inputs, include_types=["llm"]):
    # astream_log()는 요청된 로그(여기서는 LLM)를 JSONPatch 형식으로 생성합니다.
    for op in output.ops:
        if op["path"] == "/streamed_output/-":
            # 이것은 .stream()의 출력입니다.
            ...
        elif op["path"].startswith("/logs/") and op["path"].endswith(
            "/streamed_output/-"
        ):
            # LLM만 포함하도록 선택했기 때문에, 이것은 LLM 토큰입니다.
            print(op["value"])
```

```
content='' additional_kwargs={'function_call': {'arguments': '', 'name': 'tavily_search_results_json'}}
content='' additional_kwargs={'function_call': {'arguments': '{\n', 'name': ''}}}
content='' additional_kwargs={'function_call': {'arguments': ' ', 'name': ''}}
content='' additional_kwargs={'function_call': {'arguments': ' "', 'name': ''}}
content='' additional_kwargs={'function_call': {'arguments': 'query', 'name': ''}}
...
```

## 언제 사용해야 하는가

[LangChain Expression Language](https://python.langchain.com/docs/expression_language/) 대신 언제 이를 사용해야 할까요?

주기가 필요할 때.

Langchain Expression Language를 사용하면 체인(DAG)을 쉽게 정의할 수 있지만 주기를 추가하는 좋은 메커니즘이 없습니다.
`langgraph`는 그 문법을 추가합니다.

## 문서

이 문서를 통해 무엇을 구축할 수 있는지 맛보기로 확인해보세요! 더 자세한 내용을 알아보려면 나머지 문서를 참조하세요.

### 튜토리얼

[LangGraph 튜토리얼](https://langchain-ai.github.io/langgraph/tutorials/)의 안내된 예제를 통해 LangGraph로 구축하는 방법을 배워보세요.

더 고급 가이드를 시도하기 전에 [LangGraph 소개](https://langchain-ai.github.io/langgraph/tutorials/introduction/)로 시작하는 것이 좋습니다.

### 사용 방법 가이드

[LangGraph 사용 방법 가이드](https://langchain-ai.github.io/langgraph/how-tos/)는 스트리밍, 메모리 및 지속성 추가, 일반적인 설계 패턴(분기, 서브그래프 등) 등 LangGraph 내에서 특정 작업을 수행하는 방법을 보여줍니다. 특정 코드 스니펫을 복사하고 실행하려면 여기를 참조하세요.

### 레퍼런스

LangGraph의 API에는 몇 가지 중요한 클래스와 메서드가 있으며, 이는 모두 [레퍼런스 문서](https://langchain-ai.github.io/langgraph/reference/graphs/)에 포함되어 있습니다. 이 문서를 참조하여 특정 함수 인수와 그래프 + 체크포인트 API를 사용하는 간단한 예제 또는 더 고급 구성 요소에 대한 내용을 확인하세요.

