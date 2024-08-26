---
translated: true
---

# 並行ツール使用

[複数のツールを使用する](/docs/use_cases/tool_use/multiple_tools)ガイドでは、複数のツールを選択する機能呼び出しチェーンを構築する方法を見ました。2023年秋にリリースされたOpenAIモデルなどの一部のモデルは、並行機能呼び出しもサポートしており、単一のモデル呼び出しで複数の関数(または同じ関数を複数回)を呼び出すことができます。前の複数ツールガイドのチェーンは実際にはすでにこれをサポートしています。

## セットアップ

このガイドには以下のパッケージをインストールする必要があります:

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
```

# チェーン

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" hideGoogle="true"/>

```python
# | echo: false
# | output: false

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
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
chain.invoke(
    "What's 23 times 7, and what's five times 18 and add a million plus a billion and cube thirty-seven"
)
```

```output
[{'name': 'multiply',
  'args': {'first_int': 23, 'second_int': 7},
  'id': 'call_22tgOrsVLyLMsl2RLbUhtycw',
  'output': 161},
 {'name': 'multiply',
  'args': {'first_int': 5, 'second_int': 18},
  'id': 'call_EbKHEG3TjqBhEwb7aoxUtgzf',
  'output': 90},
 {'name': 'add',
  'args': {'first_int': 1000000, 'second_int': 1000000000},
  'id': 'call_LUhu2IT3vINxlTc5fCVY6Nhi',
  'output': 1001000000},
 {'name': 'exponentiate',
  'args': {'base': 37, 'exponent': 3},
  'id': 'call_bnCZIXelOKkmcyd4uGXId9Ct',
  'output': 50653}]
```
