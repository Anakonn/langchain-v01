---
sidebar_position: 0.1
translated: true
---

# OpenAI 도구

최신 OpenAI 모델은 하나 이상의 함수를 호출해야 하는 경우를 감지하고 함수에 전달해야 하는 입력을 응답하도록 fine-tuning되었습니다. API 호출에서 함수를 설명하고 이러한 함수를 호출하는 JSON 객체를 출력하도록 모델을 지능적으로 선택할 수 있습니다. OpenAI 도구 API의 목표는 일반 텍스트 완성 또는 채팅 API를 사용하는 것보다 더 안정적이고 유용한 함수 호출을 반환하는 것입니다.

OpenAI는 **단일** 함수를 호출하는 기능을 **functions**라고 하고, **하나 이상**의 함수를 호출하는 기능을 **tools**라고 했습니다.

:::tip

OpenAI Chat API에서 **functions**는 이제 **tools**를 선호하는 레거시 옵션으로 간주됩니다.

OpenAI 모델을 사용하여 에이전트를 만드는 경우 OpenAI functions 에이전트가 아닌 이 OpenAI Tools 에이전트를 사용해야 합니다.

**tools**를 사용하면 모델이 필요한 경우 하나 이상의 함수를 호출하도록 요청할 수 있습니다.

이 경우 에이전트가 목표를 달성하는 데 걸리는 시간을 크게 줄일 수 있습니다.

참고:

* [OpenAI chat create](https://platform.openai.com/docs/api-reference/chat/create)
* [OpenAI function calling](https://platform.openai.com/docs/guides/function-calling)

:::

```python
%pip install --upgrade --quiet  langchain-openai tavily-python
```

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI
```

## 도구 초기화

이 에이전트에 Tavily로 웹을 검색할 수 있는 기능을 부여하겠습니다.

```python
tools = [TavilySearchResults(max_results=1)]
```

## 에이전트 생성

```python
# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-tools-agent")
```

```python
# Choose the LLM that will drive the agent
# Only certain models support this
llm = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0)

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(llm, tools, prompt)
```

## 에이전트 실행

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.invoke({"input": "what is LangChain?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'LangChain'}`


[0m[36;1m[1;3m[{'url': 'https://www.ibm.com/topics/langchain', 'content': 'LangChain is essentially a library of abstractions for Python and Javascript, representing common steps and concepts  LangChain is an open source orchestration framework for the development of applications using large language models  other LangChain features, like the eponymous chains.  LangChain provides integrations for over 25 different embedding methods, as well as for over 50 different vector storesLangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. It supports Python and Javascript languages and supports various LLM providers, including OpenAI, Google, and IBM.'}][0m[32;1m[1;3mLangChain is an open source orchestration framework for the development of applications using large language models. It is essentially a library of abstractions for Python and Javascript, representing common steps and concepts. LangChain simplifies the process of programming and integration with external data sources and software workflows. It supports various large language model providers, including OpenAI, Google, and IBM. You can find more information about LangChain on the IBM website: [LangChain - IBM](https://www.ibm.com/topics/langchain)[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is LangChain?',
 'output': 'LangChain is an open source orchestration framework for the development of applications using large language models. It is essentially a library of abstractions for Python and Javascript, representing common steps and concepts. LangChain simplifies the process of programming and integration with external data sources and software workflows. It supports various large language model providers, including OpenAI, Google, and IBM. You can find more information about LangChain on the IBM website: [LangChain - IBM](https://www.ibm.com/topics/langchain)'}
```

## 채팅 기록과 함께 사용

```python
from langchain_core.messages import AIMessage, HumanMessage

agent_executor.invoke(
    {
        "input": "what's my name? Don't use tools to look this up unless you NEED to",
        "chat_history": [
            HumanMessage(content="hi! my name is bob"),
            AIMessage(content="Hello Bob! How can I assist you today?"),
        ],
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mYour name is Bob.[0m

[1m> Finished chain.[0m
```

```output
{'input': "what's my name? Don't use tools to look this up unless you NEED to",
 'chat_history': [HumanMessage(content='hi! my name is bob'),
  AIMessage(content='Hello Bob! How can I assist you today?')],
 'output': 'Your name is Bob.'}
```
