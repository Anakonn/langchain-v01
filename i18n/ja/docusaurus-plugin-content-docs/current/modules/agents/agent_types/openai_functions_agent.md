---
sidebar_position: 1
translated: true
---

# OpenAI 関数

:::caution

OpenAI APIは `functions` を非推奨にし、代わりに `tools` を使うことを推奨しています。 `tools` APIの違いは、モデルが一度に複数の関数を呼び出すことができ、一部のアーキテクチャでは応答時間を短縮できることです。OpenAIモデルの場合は、tools エージェントを使うことをお勧めします。

詳細については以下のリンクをご覧ください:

[OpenAI Tools](/docs/modules/agents/agent_types/openai_tools/)

[OpenAI chat create](https://platform.openai.com/docs/api-reference/chat/create)

[OpenAI function calling](https://platform.openai.com/docs/guides/function-calling)
:::

特定のOpenAIモデル (gpt-3.5-turbo-0613やgpt-4-0613など) は、関数を呼び出すタイミングを検出し、その関数に渡すべき入力をJSONオブジェクトで返すように微調整されています。APIコールでは、関数を記述し、モデルに適切な関数呼び出しを出力させることができます。OpenAI Function APIの目的は、一般的なテキスト補完やチャットAPIよりも、信頼性の高い有効な関数呼び出しを返すことです。

多くのオープンソースモデルも同じ形式の関数呼び出しを採用し、関数を呼び出すタイミングを検出するよう微調整されています。

OpenAI Functions Agentはこれらのモデルと連携するように設計されています。

`openai`と`tavily-python`パッケージをインストールする必要があります。LangChainパッケージ内部でこれらを呼び出しているためです。

:::tip
`functions`形式は、オープンソースモデルやプロバイダーが採用している場合に関連性があり続けるため、このエージェントはそれらのモデルでも機能することが期待されます。
:::

```python
%pip install --upgrade --quiet  langchain-openai tavily-python
```

## ツールの初期化

まずは使用するツールを作成します。

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI
```

```python
tools = [TavilySearchResults(max_results=1)]
```

## エージェントの作成

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


[0m[36;1m[1;3m[{'url': 'https://www.ibm.com/topics/langchain', 'content': 'LangChain is essentially a library of abstractions for Python and Javascript, representing common steps and concepts  LangChain is an open source orchestration framework for the development of applications using large language models  other LangChain features, like the eponymous chains.  LangChain provides integrations for over 25 different embedding methods, as well as for over 50 different vector storesLangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. It supports Python and Javascript languages and supports various LLM providers, including OpenAI, Google, and IBM.'}][0m[32;1m[1;3mLangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. LangChain provides integrations for over 25 different embedding methods and for over 50 different vector stores. It is essentially a library of abstractions for Python and JavaScript, representing common steps and concepts. LangChain supports Python and JavaScript languages and various LLM providers, including OpenAI, Google, and IBM. You can find more information about LangChain [here](https://www.ibm.com/topics/langchain).[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is LangChain?',
 'output': 'LangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. LangChain provides integrations for over 25 different embedding methods and for over 50 different vector stores. It is essentially a library of abstractions for Python and JavaScript, representing common steps and concepts. LangChain supports Python and JavaScript languages and various LLM providers, including OpenAI, Google, and IBM. You can find more information about LangChain [here](https://www.ibm.com/topics/langchain).'}
```

## チャット履歴と併せて使用する

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
