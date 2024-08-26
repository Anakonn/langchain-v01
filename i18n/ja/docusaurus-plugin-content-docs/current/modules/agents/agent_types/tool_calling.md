---
sidebar_label: ツールの呼び出し
sidebar_position: 0
translated: true
---

# ツールの呼び出しエージェント

[ツールの呼び出し](/docs/modules/model_io/chat/function_calling)により、モデルはいつ1つ以上のツールを呼び出す必要があるかを検出し、それらのツールに渡すべき入力を返すことができます。APIコールでは、ツールを記述し、それらのツールを呼び出すための引数を含む構造化オブジェクト(例えばJSON)を出力するようにモデルに指示することができます。ツールAPIの目的は、一般的なテキスト補完やチャットAPIを使用するよりも、信頼性の高い有効なツールの呼び出しを返すことです。

この構造化された出力を活用し、[ツールの呼び出しチャットモデル](/docs/integrations/chat/)に複数のツールをバインドして、クエリを解決するまでツールを繰り返し呼び出し、結果を受け取ることができます。

これは、OpenAIのツールエージェント(/docs/modules/agents/agent_types/openai_tools/)の一般化されたバージョンです。OpenAIの特定のツールの呼び出しスタイルに合わせて設計されていましたが、LangChainのToolCallインターフェースを使用することで、[Anthropic](/docs/integrations/chat/anthropic/)、[Google Gemini](/docs/integrations/chat/google_vertex_ai_palm/)、[Mistral](/docs/integrations/chat/mistralai/)などの幅広いプロバイダ実装をサポートできるようになりました。

## セットアップ

ツールの呼び出しをサポートするモデルであれば、このエージェントで使用できます。どのモデルがツールの呼び出しをサポートしているかは、[こちら](/docs/integrations/chat/)で確認できます。

このデモでは[Tavily](https://app.tavily.com)を使用しますが、他の[組み込みツール](/docs/integrations/tools)に置き換えたり、[カスタムツール](/docs/modules/tools/custom_tools/)を追加したりすることもできます。
APIキーの取得と`process.env.TAVILY_API_KEY`への設定が必要です。

import ChatModelTabs from "@theme/ChatModelTabs";

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

## ツールの初期化

まずは、Webを検索するツールを作成します:

```python
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate

tools = [TavilySearchResults(max_results=1)]
```

## エージェントの作成

次に、ツールの呼び出しエージェントを初期化しましょう:

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

## エージェントの実行

では、エージェントを実行するエグゼキューターを初期化し、呼び出してみましょう!

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
[LangSmith trace](https://smith.langchain.com/public/2f956a2e-0820-47c4-a798-c83f024e5ca1/r)
:::

## チャット履歴との連携

このタイプのエージェントは、前回の会話履歴を表すチャットメッセージを任意で受け取ることができます。それを使って会話形式で応答することができます。詳細は[エージェントクイックスタートのこのセクション](/docs/modules/agents/quick_start#adding-in-memory)を参照してください。

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
[LangSmith trace](https://smith.langchain.com/public/e21ececb-2e60-49e5-9f06-a91b0fb11fb8/r)
:::
