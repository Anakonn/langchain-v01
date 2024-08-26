---
sidebar_position: 0
translated: true
---

# クイックスタート

このガイドでは、Chainsとツールを呼び出すAgentsを作成する基本的な方法について説明します。ツールには、APIやファンクション、データベースなど、さまざまなものが含まれます。ツールを使うことで、モデルの機能を単なるテキスト/メッセージの出力を超えて拡張することができます。モデルにツールを使う鍵は、モデルを正しくプロンプトし、その応答を適切に解析して、正しいツールを選択し、それらに適切な入力を提供することです。

## セットアップ

このガイドを進めるには、以下のパッケージをインストールする必要があります:

```python
%pip install --upgrade --quiet langchain
```

[LangSmith](/docs/langsmith/)でトレースを行いたい場合は、以下の環境変数をコメントアウトして設定してください:

```python
import getpass
import os

# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## ツールの作成

まず、呼び出すツールを作成する必要があります。この例では、関数からカスタムツールを作成します。カスタムツールの作成については、[このガイド](/docs/modules/tools/)を参照してください。

```python
from langchain_core.tools import tool


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int
```

```python
print(multiply.name)
print(multiply.description)
print(multiply.args)
```

```output
multiply
multiply(first_int: int, second_int: int) -> int - Multiply two integers together.
{'first_int': {'title': 'First Int', 'type': 'integer'}, 'second_int': {'title': 'Second Int', 'type': 'integer'}}
```

```python
multiply.invoke({"first_int": 4, "second_int": 5})
```

```output
20
```

## Chains

ツールを固定回数しか使用しない場合は、それを行うためのチェーンを作成することができます。ユーザーが指定した数字を掛け算するシンプルなチェーンを作成しましょう。

![chain](../../../../../../static/img/tool_chain.svg)

### ツール/関数の呼び出し

LLMでツールを使用する最も確実な方法の1つは、ツール呼び出しAPIを使うことです(時には関数呼び出しとも呼ばれます)。これは、ツール呼び出しを明示的にサポートしているモデルでのみ機能します。どのモデルがツール呼び出しをサポートしているかは[こちら](/docs/integrations/chat/)で確認でき、ツール呼び出しの使い方は[このガイド](/docs/modules/model_io/chat/function_calling)で詳しく説明されています。

まずはモデルとツールを定義します。今回は `multiply` という単一のツールを使用します。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>

```python
# | echo: false
# | output: false

from langchain_openai.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

`bind_tools`を使って、各モデルの呼び出しの一部としてツールの定義を渡すことで、モデルがツールを呼び出せるようにします。

```python
llm_with_tools = llm.bind_tools([multiply])
```

モデルがツールを呼び出すと、出力の `AIMessage.tool_calls` 属性にそれが表示されます。

```python
msg = llm_with_tools.invoke("whats 5 times forty two")
msg.tool_calls
```

```output
[{'name': 'multiply',
  'args': {'first_int': 5, 'second_int': 42},
  'id': 'call_cCP9oA3tRz7HDrjFn1FdmDaG'}]
```

[LangSmith トレースはこちら](https://smith.langchain.com/public/81ff0cbd-e05b-4720-bf61-2c9807edb708/r)。

### ツールの呼び出し

よし、ツールの呼び出しを生成できるようになりました。でも、実際にツールを呼び出すにはどうすればいいでしょうか? そのためには、生成されたツールの引数をツールに渡す必要があります。簡単な例として、最初のツールの呼び出しの引数を抽出してみましょう。

```python
from operator import itemgetter

chain = llm_with_tools | (lambda x: x.tool_calls[0]["args"]) | multiply
chain.invoke("What's four times 23")
```

```output
92
```

[LangSmith トレースはこちら](https://smith.langchain.com/public/16bbabb9-fc9b-41e5-a33d-487c42df4f85/r)。

## Agents

ユーザーの入力に応じてツールの使用回数が変わる場合は、Chainsでは適切ではありません。そのような場合は、モデル自身がツールの使用回数と順序を決められるようにする必要があります。[Agents](/docs/modules/agents/)はまさにそのようなことができます。

LangChainには、さまざまな用途に最適化された組み込みのAgentがあります。[Agentの種類について詳しくはこちら](/docs/modules/agents/agent_types/)。

ここでは[ツール呼び出しAgent](/docs/modules/agents/agent_types/tool_calling/)を使用します。これは一般的に最も信頼性が高く、ほとんどのユースケースで推奨されるものです。

![agent](../../../../../../static/img/tool_agent.svg)

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_tool_calling_agent
```

```python
# Get the prompt to use - can be replaced with any prompt that includes variables "agent_scratchpad" and "input"!
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

Agentは複数のツールを使用するのも簡単です。複数のツールを使ったChainsの構築方法については、[複数のツールを使う](/docs/use_cases/tool_use/multiple_tools)のページを参照してください。

```python
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

```python
# Construct the tool calling agent
agent = create_tool_calling_agent(llm, tools, prompt)
```

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

Agentを使えば、任意の回数ツールを使う質問にも答えられます。

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


[0m[38;5;200m[1;3m243[0m[32;1m[1;3m
Invoking: `add` with `{'first_int': 12, 'second_int': 3}`


[0m[33;1m[1;3m15[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 243, 'second_int': 15}`


[0m[36;1m[1;3m3645[0m[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 405, 'exponent': 2}`


[0m[38;5;200m[1;3m164025[0m[32;1m[1;3mThe result of taking 3 to the fifth power is 243.

The sum of twelve and three is 15.

Multiplying 243 by 15 gives 3645.

Finally, squaring 3645 gives 164025.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Take 3 to the fifth power and multiply that by the sum of twelve and three, then square the whole result',
 'output': 'The result of taking 3 to the fifth power is 243. \n\nThe sum of twelve and three is 15. \n\nMultiplying 243 by 15 gives 3645. \n\nFinally, squaring 3645 gives 164025.'}
```

[LangSmith トレースはこちら](https://smith.langchain.com/public/eeeb27a4-a2f8-4f06-a3af-9c983f76146c/r)。

## 次のステップ

ここでは、ツールをChainsとAgentsで使う基本的な方法を説明しました。次に以下のセクションを探索することをお勧めします:

- [Agents](/docs/modules/agents/): Agentsに関するすべて。
- [複数のツールの選択](/docs/use_cases/tool_use/multiple_tools): 複数のツールを選択するChainの構築方法。
- [ツール使用のプロンプト](/docs/use_cases/tool_use/prompting): 関数呼び出しAPIを使わずにモデルにツールの使用をプロンプトする方法。
- [並列ツール使用](/docs/use_cases/tool_use/parallel): 複数のツールを同時に呼び出すChainの構築方法。
