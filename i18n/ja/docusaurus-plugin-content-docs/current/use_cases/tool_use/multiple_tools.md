---
sidebar_position: 2
translated: true
---

# 複数のツールの選択

[クイックスタート](/docs/use_cases/tool_use/quickstart)では、単一の `multiply` ツールを呼び出すチェーンを構築する方法を説明しました。 
ここでは、このチェーンを拡張して、複数のツールから選択できるようにする方法を見ていきます。 
[エージェント](/docs/use_cases/tool_use/agents)はデフォルトで複数のツールをルーティングできるため、ここではチェーンに焦点を当てます。

## セットアップ

このガイドのために、以下のパッケージをインストールする必要があります:

```python
%pip install --upgrade --quiet langchain-core
```

[LangSmith](/docs/langsmith/)でランを追跡したい場合は、以下の環境変数をコメントアウトして設定してください:

```python
import getpass
import os

# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## ツール

すでに `multiply` ツールがあることを思い出してください:

```python
from langchain_core.tools import tool


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int
```

そして、`exponentiate` と `add` ツールを追加することができます:

```python
@tool
def add(first_int: int, second_int: int) -> int:
    "Add two integers."
    return first_int + second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent
```

1つのツールを使う場合と複数のツールを使う場合の主な違いは、事前に特定のツールを呼び出すことができないということです。 
そのため、[クイックスタート](/docs/use_cases/tool_use/quickstart)で行ったように、チェーンに特定のツールをハードコーディングすることはできません。 
代わりに、出力 AI メッセージ内のツールコールをルーティングする `call_tools` という `RunnableLambda` を追加します。

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>

```python
# | echo: false
# | output: false

from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
```

```python
from operator import itemgetter
from typing import Dict, List, Union

from langchain_core.messages import AIMessage
from langchain_core.runnables import (
    Runnable,
    RunnableLambda,
    RunnableMap,
    RunnablePassthrough,
)

tools = [multiply, exponentiate, add]
llm_with_tools = llm.bind_tools(tools)
tool_map = {tool.name: tool for tool in tools}


def call_tools(msg: AIMessage) -> Runnable:
    """Simple sequential tool calling helper."""
    tool_map = {tool.name: tool for tool in tools}
    tool_calls = msg.tool_calls.copy()
    for tool_call in tool_calls:
        tool_call["output"] = tool_map[tool_call["name"]].invoke(tool_call["args"])
    return tool_calls


chain = llm_with_tools | call_tools
```

```python
chain.invoke("What's 23 times 7")
```

```output
[{'name': 'multiply',
  'args': {'first_int': 23, 'second_int': 7},
  'id': 'toolu_01Wf8kUs36kxRKLDL8vs7G8q',
  'output': 161}]
```

```python
chain.invoke("add a million plus a billion")
```

```output
[{'name': 'add',
  'args': {'first_int': 1000000, 'second_int': 1000000000},
  'id': 'toolu_012aK4xZBQg2sXARsFZnqxHh',
  'output': 1001000000}]
```

```python
chain.invoke("cube thirty-seven")
```

```output
[{'name': 'exponentiate',
  'args': {'base': 37, 'exponent': 3},
  'id': 'toolu_01VDU6X3ugDb9cpnnmCZFPbC',
  'output': 50653}]
```
