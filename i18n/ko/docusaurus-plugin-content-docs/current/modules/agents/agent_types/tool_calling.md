---
sidebar_label: 도구 호출
sidebar_position: 0
translated: true
---

# 도구 호출 에이전트

[도구 호출](/docs/modules/model_io/chat/function_calling)을 통해 모델은 하나 이상의 도구를 호출해야 하는 시점을 감지하고 해당 도구에 전달해야 할 입력을 응답할 수 있습니다. API 호출에서 도구를 설명하고 모델이 이러한 도구를 호출하기 위한 인수가 포함된 구조화된 객체(예: JSON)를 출력하도록 할 수 있습니다. 도구 API의 목표는 일반적인 텍스트 완성 또는 채팅 API를 사용하는 것보다 더 안정적이고 유용한 도구 호출을 반환하는 것입니다.

이 구조화된 출력과 [도구 호출 채팅 모델](/docs/integrations/chat/)에 여러 도구를 바인딩하고 모델이 어떤 도구를 호출할지 선택할 수 있다는 사실을 활용하여 도구를 반복적으로 호출하고 결과를 받아 쿼리를 해결할 수 있는 에이전트를 만들 수 있습니다.

이는 OpenAI의 특정 도구 호출 스타일을 위해 설계된 [OpenAI 도구 에이전트](/docs/modules/agents/agent_types/openai_tools/)의 더 일반화된 버전입니다. LangChain의 ToolCall 인터페이스를 사용하여 [Anthropic](/docs/integrations/chat/anthropic/), [Google Gemini](/docs/integrations/chat/google_vertex_ai_palm/), [Mistral](/docs/integrations/chat/mistralai/) 등 다양한 공급업체 구현을 지원합니다.

## 설정

도구 호출을 지원하는 모든 모델을 이 에이전트에서 사용할 수 있습니다. 어떤 모델이 도구 호출을 지원하는지 확인할 수 있습니다 [여기](/docs/integrations/chat/)

이 데모에서는 [Tavily](https://app.tavily.com)를 사용하지만, 다른 [기본 제공 도구](/docs/integrations/tools)로 교체하거나 [사용자 정의 도구](/docs/modules/tools/custom_tools/)를 추가할 수도 있습니다. API 키를 받아 `process.env.TAVILY_API_KEY`로 설정해야 합니다.

<ChatModelTabs
  customVarName="llm"
  hideCohere
/>

```python
# | output: false
# | echo: false

from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
```

## 도구 초기화

먼저 웹을 검색할 수 있는 도구를 만들겠습니다:

```python
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate

tools = [TavilySearchResults(max_results=1)]
```

## 에이전트 생성

다음으로 도구 호출 에이전트를 초기화해 보겠습니다:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Make sure to use the tavily_search_results_json tool for information.",
        ),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)

# Construct the Tools agent
agent = create_tool_calling_agent(llm, tools, prompt)
```

## 에이전트 실행

이제 에이전트를 실행할 실행기를 초기화하고 호출해 보겠습니다!

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
agent_executor.invoke({"input": "what is LangChain?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m

/Users/bagatur/langchain/libs/partners/anthropic/langchain_anthropic/chat_models.py:347: UserWarning: stream: Tool use is not yet supported in streaming mode.
  warnings.warn("stream: Tool use is not yet supported in streaming mode.")

[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'LangChain'}`
responded: [{'id': 'toolu_01QxrrT9srzkYCNyEZMDhGeg', 'input': {'query': 'LangChain'}, 'name': 'tavily_search_results_json', 'type': 'tool_use'}]

[0m[36;1m[1;3m[{'url': 'https://github.com/langchain-ai/langchain', 'content': 'About\n⚡ Building applications with LLMs through composability ⚡\nResources\nLicense\nCode of conduct\nSecurity policy\nStars\nWatchers\nForks\nReleases\n291\nPackages\n0\nUsed by 39k\nContributors\n1,848\nLanguages\nFooter\nFooter navigation Latest commit\nGit stats\nFiles\nREADME.md\n🦜️🔗 LangChain\n⚡ Building applications with LLMs through composability ⚡\nLooking for the JS/TS library? ⚡ Building applications with LLMs through composability ⚡\nLicense\nlangchain-ai/langchain\nName already in use\nUse Git or checkout with SVN using the web URL.\n 📖 Documentation\nPlease see here for full documentation, which includes:\n💁 Contributing\nAs an open-source project in a rapidly developing field, we are extremely open to contributions, whether it be in the form of a new feature, improved infrastructure, or better documentation.\n What can you build with LangChain?\n❓ Retrieval augmented generation\n💬 Analyzing structured data\n🤖 Chatbots\nAnd much more!'}][0m

/Users/bagatur/langchain/libs/partners/anthropic/langchain_anthropic/chat_models.py:347: UserWarning: stream: Tool use is not yet supported in streaming mode.
  warnings.warn("stream: Tool use is not yet supported in streaming mode.")

[32;1m[1;3mLangChain is an open-source Python library that helps developers build applications with large language models (LLMs) through composability. Some key features of LangChain include:

- Retrieval augmented generation - Allowing LLMs to retrieve and utilize external data sources when generating outputs.

- Analyzing structured data - Tools for working with structured data like databases, APIs, PDFs, etc. and allowing LLMs to reason over this data.

- Building chatbots and agents - Frameworks for building conversational AI applications.

- Composability - LangChain allows you to chain together different LLM capabilities and data sources in a modular and reusable way.

The library aims to make it easier to build real-world applications that leverage the power of large language models in a scalable and robust way. It provides abstractions and primitives for working with LLMs from different providers like OpenAI, Anthropic, Cohere, etc. LangChain is open-source and has an active community contributing new features and improvements.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is LangChain?',
 'output': 'LangChain is an open-source Python library that helps developers build applications with large language models (LLMs) through composability. Some key features of LangChain include:\n\n- Retrieval augmented generation - Allowing LLMs to retrieve and utilize external data sources when generating outputs.\n\n- Analyzing structured data - Tools for working with structured data like databases, APIs, PDFs, etc. and allowing LLMs to reason over this data.\n\n- Building chatbots and agents - Frameworks for building conversational AI applications.\n\n- Composability - LangChain allows you to chain together different LLM capabilities and data sources in a modular and reusable way.\n\nThe library aims to make it easier to build real-world applications that leverage the power of large language models in a scalable and robust way. It provides abstractions and primitives for working with LLMs from different providers like OpenAI, Anthropic, Cohere, etc. LangChain is open-source and has an active community contributing new features and improvements.'}
```

:::tip
[LangSmith 추적](https://smith.langchain.com/public/2f956a2e-0820-47c4-a798-c83f024e5ca1/r)
:::

## 채팅 기록과 함께 사용하기

이 유형의 에이전트는 이전 대화 내용을 나타내는 채팅 메시지를 선택적으로 받을 수 있습니다. 이전 기록을 사용하여 대화형으로 응답할 수 있습니다. 자세한 내용은 [에이전트 빠른 시작 가이드의 이 섹션](/docs/modules/agents/quick_start#adding-in-memory)을 참조하세요.

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

/Users/bagatur/langchain/libs/partners/anthropic/langchain_anthropic/chat_models.py:347: UserWarning: stream: Tool use is not yet supported in streaming mode.
  warnings.warn("stream: Tool use is not yet supported in streaming mode.")

[32;1m[1;3mBased on what you told me, your name is Bob. I don't need to use any tools to look that up since you directly provided your name.[0m

[1m> Finished chain.[0m
```

```output
{'input': "what's my name? Don't use tools to look this up unless you NEED to",
 'chat_history': [HumanMessage(content='hi! my name is bob'),
  AIMessage(content='Hello Bob! How can I assist you today?')],
 'output': "Based on what you told me, your name is Bob. I don't need to use any tools to look that up since you directly provided your name."}
```

:::tip
[LangSmith 추적](https://smith.langchain.com/public/e21ececb-2e60-49e5-9f06-a91b0fb11fb8/r)
:::
