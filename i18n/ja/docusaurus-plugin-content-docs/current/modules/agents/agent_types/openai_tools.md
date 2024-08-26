---
sidebar_position: 0.1
translated: true
---

# OpenAI ツール

より新しいOpenAIモデルは、1つ以上の関数を呼び出すべきかどうかを検出するように微調整されており、関数に渡すべき入力を返します。 APIコールでは、関数を記述し、これらの関数を呼び出すための引数を含むJSONオブジェクトを出力するように、モデルに賢明に選択させることができます。 OpenAIツールAPIの目的は、一般的なテキスト補完やチャットAPIを使用するよりも、より確実に有効で有用な関数呼び出しを返すことです。

OpenAIは、**単一**の関数を呼び出す機能を**関数**と呼び、**1つ以上**の関数を呼び出す機能を**ツール**と呼んでいます。

:::tip

OpenAIチャットAPIでは、**関数**は非推奨の古いオプションとなり、**ツール**に置き換えられています。

OpenAIモデルを使ってエージェントを作成する場合は、OpenAI関数エージェントではなく、このOpenAIツールエージェントを使用する必要があります。

**ツール**を使うと、状況に応じて複数の関数を呼び出すことができるため、エージェントがその目的を達成するのに必要な時間を大幅に短縮できます。

参照:

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

## ツールの初期化

このエージェントには、Tavilyでウェブ検索する機能を与えましょう。

```python
tools = [TavilySearchResults(max_results=1)]
```

## エージェントの作成

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

## エージェントの実行

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

## チャット履歴での使用

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
