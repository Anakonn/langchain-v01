---
sidebar_position: 3
translated: true
---

# 도구 사용

이 섹션에서는 도구를 사용하여 다른 시스템 및 API와 상호작용할 수 있는 대화형 에이전트를 만드는 방법을 다룹니다.

이 가이드를 읽기 전에 [챗봇 빠른 시작](/docs/use_cases/chatbots/quickstart) 섹션을 읽고 [에이전트에 대한 문서](/docs/modules/agents/)에 익숙해지기를 권장합니다.

## 설정

이 가이드에서는 웹 검색 도구를 사용하는 [OpenAI 도구 에이전트](/docs/modules/agents/agent_types/openai_tools)를 사용할 것입니다. 기본 도구는 [Tavily](/docs/integrations/tools/tavily_search)로 구동되지만 유사한 도구로 교체할 수 있습니다. 이 섹션에서는 Tavily를 사용하는 것으로 가정합니다.

Tavily 웹사이트에서 [계정에 가입](https://tavily.com/)하고 다음 패키지를 설치해야 합니다:

```python
%pip install --upgrade --quiet langchain-openai tavily-python

# 환경 변수를 설정하거나 .env 파일에서 불러오기:

import dotenv

dotenv.load_dotenv()
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```output
True
```

`OPENAI_API_KEY`로 설정된 OpenAI 키와 `TAVILY_API_KEY`로 설정된 Tavily API 키도 필요합니다.

## 에이전트 생성

최종 목표는 사용자 질문에 대화형으로 응답하면서 필요한 정보를 검색할 수 있는 에이전트를 만드는 것입니다.

먼저 Tavily와 도구 호출이 가능한 OpenAI 챗 모델을 초기화해 봅시다:

```python
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI

tools = [TavilySearchResults(max_results=1)]

# 에이전트를 구동할 LLM 선택

# 일부 모델만 이 기능을 지원합니다

chat = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0)
```

에이전트를 대화형으로 만들기 위해, 대화 기록을 위한 자리 표시자가 있는 프롬프트를 선택해야 합니다. 다음은 그 예입니다:

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# https://smith.langchain.com/hub/hwchase17/openai-tools-agent에서 수정됨

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. You may not need to use tools for every query - the user may just want to chat!",
        ),
        MessagesPlaceholder(variable_name="messages"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

좋습니다! 이제 에이전트를 조립해 봅시다:

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent

agent = create_openai_tools_agent(chat, tools, prompt)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## 에이전트 실행

이제 에이전트를 설정했으므로 상호작용해 봅시다! 정보 검색이 필요 없는 간단한 질문도 처리할 수 있습니다:

```python
from langchain_core.messages import HumanMessage

agent_executor.invoke({"messages": [HumanMessage(content="I'm Nemo!")]})
```

```output

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHello Nemo! It's great to meet you. How can I assist you today?[0m

[1m> Finished chain.[0m
```

```output
{'messages': [HumanMessage(content="I'm Nemo!")],
 'output': "Hello Nemo! It's great to meet you. How can I assist you today?"}
```

또는, 필요한 경우 제공된 검색 도구를 사용하여 최신 정보를 얻을 수 있습니다:

```python
agent_executor.invoke(
    {
        "messages": [
            HumanMessage(
                content="What is the current conservation status of the Great Barrier Reef?"
            )
        ],
    }
)
```

```output

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'current conservation status of the Great Barrier Reef'}`

[0m[36;1m[1;3m[{'url': 'https://www.barrierreef.org/news/blog/this-is-the-critical-decade-for-coral-reef-survival', 'content': "global coral reef conservation.  © 2024 Great Barrier Reef Foundation. Website by bigfish.tv  #Related News · 29 January 2024 290m more baby corals to help restore and protect the Great Barrier Reef  Great Barrier Reef Foundation Managing Director Anna Marsden says it’s not too late if we act now.The Status of Coral Reefs of the World: 2020 report is the largest analysis of global coral reef health ever undertaken. It found that 14 per cent of the world's coral has been lost since 2009. The report also noted, however, that some of these corals recovered during the 10 years to 2019."}][0m[32;1m[1;3mThe current conservation status of the Great Barrier Reef is a critical concern. According to the Great Barrier Reef Foundation, the Status of Coral Reefs of the World: 2020 report found that 14% of the world's coral has been lost since 2009. However, the report also noted that some of these corals recovered during the 10 years to 2019. For more information, you can visit the following link: [Great Barrier Reef Foundation - Conservation Status](https://www.barrierreef.org/news/blog/this-is-the-critical-decade-for-coral-reef-survival)[0m

[1m> Finished chain.[0m
```

```output
{'messages': [HumanMessage(content='What is the current conservation status of the Great Barrier Reef?')],
 'output': "The current conservation status of the Great Barrier Reef is a critical concern. According to the Great Barrier Reef Foundation, the Status of Coral Reefs of the World: 2020 report found that 14% of the world's coral has been lost since 2009. However, the report also noted that some of these corals recovered during the 10 years to 2019. For more information, you can visit the following link: [Great Barrier Reef Foundation - Conservation Status](https://www.barrierreef.org/news/blog/this-is-the-critical-decade-for-coral-reef-survival)"}
```

## 대화형 응답

프롬프트에 대화 기록 메시지를 위한 자리 표시자가 포함되어 있으므로 에이전트는 이전 상호작용을 고려하여 일반 챗봇처럼 대화형으로 응답할 수 있습니다:

```python
from langchain_core.messages import AIMessage, HumanMessage

agent_executor.invoke(
    {
        "messages": [
            HumanMessage(content="I'm Nemo!"),
            AIMessage(content="Hello Nemo! How can I assist you today?"),
            HumanMessage(content="What is my name?"),
        ],
    }
)
```

```output

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mYour name is Nemo![0m

[1m> Finished chain.[0m
```

```output
{'messages': [HumanMessage(content="I'm Nemo!"),
  AIMessage(content='Hello Nemo! How can I assist you today?'),
  HumanMessage(content='What is my name?')],
 'output': 'Your name is Nemo!'}
```

원하는 경우 `RunnableWithMessageHistory` 클래스로 에이전트 실행기를 래핑하여 내부적으로 히스토리 메시지를 관리할 수도 있습니다. 먼저 프롬프트를 약간 수정하여 래퍼가 히스토리로 저장할 입력 값을 구문 분석할 수 있도록 해야 합니다:

```python
# https://smith.langchain.com/hub/hwchase17/openai-tools-agent에서 수정됨

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. You may not need to use tools for every query - the user may just want to chat!",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)

agent = create_openai_tools_agent(chat, tools, prompt)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

그런 다음, 에이전트 실행기에 여러 출력이 있으므로 래퍼를 초기화할 때 `output_messages_key` 속성도 설정해야 합니다:

```python
from langchain.memory import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

demo_ephemeral_chat_history_for_chain = ChatMessageHistory()

conversational_agent_executor = RunnableWithMessageHistory(
    agent_executor,
    lambda session_id: demo_ephemeral_chat_history_for_chain,
    input_messages_key="input",
    output_messages_key="output",
    history_messages_key="chat_history",
)
```

```python
conversational_agent_executor.invoke(
    {
        "input": "I'm Nemo!",
    },
    {"configurable": {"session_id": "unused"}},
)
```

```output

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHi Nemo! It's great to meet you. How can I assist you today?[0m

[1m> Finished chain.[0m
```

```output
{'input': "I'm Nemo!",
 'chat_history': [],
 'output': "Hi Nemo! It's great to meet you. How can I assist you today?"}
```

```python
conversational_agent_executor.invoke(
    {
        "input": "What is my name?",
    },
    {"configurable": {"session_id": "unused"}},
)
```

```output

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mYour name is Nemo! How can I assist you today, Nemo?[0m

[1m> Finished chain.[0m
```

```output
{'input': 'What is my name?',
 'chat_history': [HumanMessage(content="I'm Nemo!"),
  AIMessage(content="Hi Nemo! It's great to meet you. How can I assist you today?")],
 'output': 'Your name is Nemo! How can I assist you today, Nemo?'}
```

## 추가 읽기

다른 유형의 에이전트도 대화형 응답을 지원할 수 있습니다 - 자세한 내용은 [에이전트 섹션](/docs/modules/agents)을 확인하세요.

도구 사용에 대한 자세한 내용은 [이 사용 사례 섹션](/docs/use_cases/tool_use/)을 확인할 수도 있습니다.