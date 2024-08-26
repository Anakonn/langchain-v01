---
sidebar_position: 1
translated: true
---

# OpenAI 기능

:::caution

OpenAI API는 `functions`를 `tools`로 사용하지 않도록 권장합니다. `tools` API를 사용하면 모델이 여러 기능을 한 번에 호출하도록 요청할 수 있어 일부 아키텍처에서 응답 시간을 단축할 수 있습니다. OpenAI 모델의 경우 tools 에이전트를 사용하는 것이 좋습니다.

자세한 내용은 다음 링크를 참조하세요:

[OpenAI Tools](/docs/modules/agents/agent_types/openai_tools/)

[OpenAI chat create](https://platform.openai.com/docs/api-reference/chat/create)

[OpenAI function calling](https://platform.openai.com/docs/guides/function-calling)
:::

특정 OpenAI 모델(gpt-3.5-turbo-0613, gpt-4-0613 등)은 기능을 호출해야 할 때를 감지하고 해당 기능을 호출하기 위한 입력을 포함하는 JSON 객체를 출력하도록 fine-tuning되었습니다. API 호출에서 기능을 설명하면 모델이 지능적으로 해당 기능을 호출하는 JSON 객체를 출력할 수 있습니다. OpenAI Function API의 목표는 일반 텍스트 완성 또는 채팅 API보다 더 안정적이고 유용한 기능 호출을 반환하는 것입니다.

많은 오픈 소스 모델이 동일한 형식의 기능 호출을 채택했고 모델을 fine-tuning하여 기능을 호출해야 할 때를 감지할 수 있게 되었습니다.

OpenAI Functions Agent는 이러한 모델과 함께 작동하도록 설계되었습니다.

`openai`, `tavily-python` 패키지를 설치해야 합니다. LangChain 패키지에서 내부적으로 이 패키지를 호출합니다.

:::tip
`functions` 형식은 이 형식을 채택한 오픈 소스 모델 및 공급자에게 여전히 관련이 있으며, 이 에이전트는 이러한 모델에서 작동할 것으로 예상됩니다.
:::

```python
%pip install --upgrade --quiet  langchain-openai tavily-python
```

## 도구 초기화

먼저 사용할 수 있는 도구를 만들겠습니다.

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI
```

```python
tools = [TavilySearchResults(max_results=1)]
```

## 에이전트 생성

```python
# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-functions-agent")
```

```python
prompt.messages
```

```output
[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template='You are a helpful assistant')),
 MessagesPlaceholder(variable_name='chat_history', optional=True),
 HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}')),
 MessagesPlaceholder(variable_name='agent_scratchpad')]
```

```python
# Choose the LLM that will drive the agent
llm = ChatOpenAI(model="gpt-3.5-turbo-1106")

# Construct the OpenAI Functions agent
agent = create_openai_functions_agent(llm, tools, prompt)
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


[0m[36;1m[1;3m[{'url': 'https://www.ibm.com/topics/langchain', 'content': 'LangChain is essentially a library of abstractions for Python and Javascript, representing common steps and concepts  LangChain is an open source orchestration framework for the development of applications using large language models  other LangChain features, like the eponymous chains.  LangChain provides integrations for over 25 different embedding methods, as well as for over 50 different vector storesLangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. It supports Python and Javascript languages and supports various LLM providers, including OpenAI, Google, and IBM.'}][0m[32;1m[1;3mLangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. LangChain provides integrations for over 25 different embedding methods and for over 50 different vector stores. It is essentially a library of abstractions for Python and JavaScript, representing common steps and concepts. LangChain supports Python and JavaScript languages and various LLM providers, including OpenAI, Google, and IBM. You can find more information about LangChain [here](https://www.ibm.com/topics/langchain).[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is LangChain?',
 'output': 'LangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. LangChain provides integrations for over 25 different embedding methods and for over 50 different vector stores. It is essentially a library of abstractions for Python and JavaScript, representing common steps and concepts. LangChain supports Python and JavaScript languages and various LLM providers, including OpenAI, Google, and IBM. You can find more information about LangChain [here](https://www.ibm.com/topics/langchain).'}
```

## 채팅 기록과 함께 사용

```python
from langchain_core.messages import AIMessage, HumanMessage

agent_executor.invoke(
    {
        "input": "what's my name?",
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
{'input': "what's my name?",
 'chat_history': [HumanMessage(content='hi! my name is bob'),
  AIMessage(content='Hello Bob! How can I assist you today?')],
 'output': 'Your name is Bob.'}
```
