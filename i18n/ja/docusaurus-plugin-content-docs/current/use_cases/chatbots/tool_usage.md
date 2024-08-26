---
sidebar_position: 3
translated: true
---

# ツールの使用

このセクションでは、会話型エージェント:他のシステムやAPIと対話できるチャットボットの作成方法について説明します。

このガイドを読む前に、このセクションの[チャットボットクイックスタート](/docs/use_cases/chatbots/quickstart)と[エージェントのドキュメンテーション](/docs/modules/agents/)を読むことをお勧めします。

## セットアップ

このガイドでは、[OpenAI tools agent](/docs/modules/agents/agent_types/openai_tools)とウェブ検索用の単一ツールを使用します。デフォルトは[Tavily](/docs/integrations/tools/tavily_search)で提供されますが、同様のツールに切り替えることもできます。以降のセクションでは、Tavilyを使用していることを前提とします。

Tavilyのウェブサイトで[アカウントを登録](https://tavily.com/)し、以下のパッケージをインストールする必要があります:

```python
%pip install --upgrade --quiet langchain-openai tavily-python

# Set env var OPENAI_API_KEY or load from a .env file:
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

また、`OPENAI_API_KEY`にOpenAIのキーと`TAVILY_API_KEY`にTavilyのAPIキーを設定する必要があります。

## エージェントの作成

最終的な目標は、ユーザーの質問に会話形式で応答しつつ、必要に応じて情報を検索できるエージェントを作成することです。

まず、Tavilyとツール呼び出し機能を持つOpenAIのチャットモデルを初期化しましょう:

```python
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI

tools = [TavilySearchResults(max_results=1)]

# Choose the LLM that will drive the agent
# Only certain models support this
chat = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0)
```

会話形式のエージェントにするには、チャット履歴用のプレースホルダーを持つプロンプトを選択する必要があります。以下は例です:

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# Adapted from https://smith.langchain.com/hub/hwchase17/openai-tools-agent
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

よし、エージェントを組み立てましょう:

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent

agent = create_openai_tools_agent(chat, tools, prompt)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## エージェントの実行

エージェントの設定ができたので、実際に使ってみましょう!検索不要な単純な質問にも対応できます:

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

また、必要に応じて渡された検索ツールを使って最新の情報を取得することもできます:

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

## 会話形式の応答

プロンプトにチャット履歴用のプレースホルダーが含まれているため、エージェントは過去の対話を考慮に入れて、標準的なチャットボットのように会話形式で応答することができます:

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

必要に応じて、エージェントの実行部分を`RunnableWithMessageHistory`クラスでラップすることで、履歴メッセージを内部で管理することもできます。その場合は、プロンプトを少し変更して入力変数を別に取る必要があります:

```python
# Adapted from https://smith.langchain.com/hub/hwchase17/openai-tools-agent
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

また、エージェントの実行部分が複数の出力を持つため、ラッパーの初期化時に`output_messages_key`プロパティを設定する必要があります:

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

## 参考文献

他のタイプのエージェントでも会話形式の応答をサポートしています。詳しくは[エージェントのセクション](/docs/modules/agents)をご覧ください。

ツールの使用については、[このユースケースのセクション](/docs/use_cases/tool_use/)も参照してください。
