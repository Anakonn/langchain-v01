---
sidebar_position: 1
translated: true
---

## ツールの繰り返し使用とエージェント

特定のツール使用シーケンスが分かっている場合、チェーンは素晴らしいです。しかし、ツールの使用回数がユーザーの入力によって異なる場合もあります。そのような場合、モデル自身がツールの使用回数と順序を決めることができるようにしたいです。[エージェント](/docs/modules/agents/)を使えばそれが可能です。

LangChainには、さまざまなユースケースに最適化された組み込みのエージェントがあります。[エージェントの種類](/docs/modules/agents/agent_types/)について詳しく読んでください。

ここでは、最も信頼性が高く、ほとんどのユースケースで推奨される[ツール呼び出しエージェント](/docs/modules/agents/agent_types/tool_calling/)を使用します。この「ツール呼び出し」とは、モデルにツールの定義を明示的に渡し、明示的なツール呼び出しを得ることができる特定のモデルAPIを指します。ツール呼び出しモデルの詳細については、[このガイド](/docs/modules/model_io/chat/function_calling/)を参照してください。

![agent](../../../../../../static/img/tool_agent.svg)

## セットアップ

以下のパッケージをインストールする必要があります:

```python
%pip install --upgrade --quiet langchain langchainhub
```

LangSmithを使用する場合は、以下の環境変数を設定してください:

```python
import getpass
import os


# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## ツールの作成

まず、呼び出すツールを作成する必要があります。この例では、関数からカスタムツールを作成します。カスタムツールの作成の詳細については、[このガイド](/docs/modules/tools/)を参照してください。

```python
from langchain_core.tools import tool


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int


@tool
def add(first_int: int, second_int: int) -> int:
    "Add two integers."
    return first_int + second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent


tools = [multiply, add, exponentiate]
```

## プロンプトの作成

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_tool_calling_agent
```

```python
# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-tools-agent")
prompt.pretty_print()
```

```output
================================[1m System Message [0m================================

You are a helpful assistant

=============================[1m Messages Placeholder [0m=============================

[33;1m[1;3m{chat_history}[0m

================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m

=============================[1m Messages Placeholder [0m=============================

[33;1m[1;3m{agent_scratchpad}[0m
```

## エージェントの作成

ツール呼び出し機能を持つモデルを使用する必要があります。ツール呼び出しをサポートするモデルについては、[こちら](/docs/integrations/chat/)をご覧ください。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>

```python
# | echo: false
# | output: false
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
```

```python
# Construct the tool calling agent
agent = create_tool_calling_agent(llm, tools, prompt)
```

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## エージェントの呼び出し

```python
agent_executor.invoke(
    {
        "input": "Take 3 to the fifth power and multiply that by the sum of twelve and three, then square the whole result"
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 3, 'exponent': 5}`
responded: [{'text': "Okay, let's break this down step-by-step:", 'type': 'text'}, {'id': 'toolu_01CjdiDhDmMtaT1F4R7hSV5D', 'input': {'base': 3, 'exponent': 5}, 'name': 'exponentiate', 'type': 'tool_use'}]

[0m[38;5;200m[1;3m243[0m[32;1m[1;3m
Invoking: `add` with `{'first_int': 12, 'second_int': 3}`
responded: [{'text': '3 to the 5th power is 243.', 'type': 'text'}, {'id': 'toolu_01EKqn4E5w3Zj7bQ8s8xmi4R', 'input': {'first_int': 12, 'second_int': 3}, 'name': 'add', 'type': 'tool_use'}]

[0m[33;1m[1;3m15[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 243, 'second_int': 15}`
responded: [{'text': '12 + 3 = 15', 'type': 'text'}, {'id': 'toolu_017VZJgZBYbwMo2KGD6o6hsQ', 'input': {'first_int': 243, 'second_int': 15}, 'name': 'multiply', 'type': 'tool_use'}]

[0m[36;1m[1;3m3645[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 3645, 'second_int': 3645}`
responded: [{'text': '243 * 15 = 3645', 'type': 'text'}, {'id': 'toolu_01RtFCcQgbVGya3NVDgTYKTa', 'input': {'first_int': 3645, 'second_int': 3645}, 'name': 'multiply', 'type': 'tool_use'}]

[0m[36;1m[1;3m13286025[0m[32;1m[1;3mSo 3645 squared is 13,286,025.

Therefore, the final result of taking 3 to the 5th power (243), multiplying by 12 + 3 (15), and then squaring the whole result is 13,286,025.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Take 3 to the fifth power and multiply that by the sum of twelve and three, then square the whole result',
 'output': 'So 3645 squared is 13,286,025.\n\nTherefore, the final result of taking 3 to the 5th power (243), multiplying by 12 + 3 (15), and then squaring the whole result is 13,286,025.'}
```

[LangSmithのトレースはこちらです](https://smith.langchain.com/public/92694ff3-71b7-44ed-bc45-04bdf04d4689/r)。
