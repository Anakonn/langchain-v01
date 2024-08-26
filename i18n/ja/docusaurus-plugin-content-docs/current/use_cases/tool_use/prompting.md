---
sidebar_position: 3
translated: true
---

# ツールコールをサポートしないモデルの使用

このガイドでは、特別なモデルAPI（[クイックスタート](/docs/use_cases/tool_use/quickstart)で示したツールコールなど）に依存せず、代わりにモデルに直接プロンプトを与えてツールを呼び出すChainを構築します。

## セットアップ

以下のパッケージをインストールする必要があります:

```python
%pip install --upgrade --quiet langchain langchain-openai
```

そして、これらの環境変数を設定します:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# If you'd like to use LangSmith, uncomment the below:
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## ツールの作成

まず、呼び出すツールを作成する必要があります。この例では、関数からカスタムツールを作成します。カスタムツールの作成に関する詳細については、[このガイド](/docs/modules/tools/)を参照してください。

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

## プロンプトの作成

モデルがアクセスできるツール、それらのツールの引数、およびモデルの望ましい出力形式を指定するプロンプトを書く必要があります。この場合、`{"name": "...", "arguments": {...}}`形式のJSONブロブを出力するよう指示します。

```python
from langchain.tools.render import render_text_description

rendered_tools = render_text_description([multiply])
rendered_tools
```

```output
'multiply: multiply(first_int: int, second_int: int) -> int - Multiply two integers together.'
```

```python
from langchain_core.prompts import ChatPromptTemplate

system_prompt = f"""You are an assistant that has access to the following set of tools. Here are the names and descriptions for each tool:

{rendered_tools}

Given the user input, return the name and input of the tool to use. Return your response as a JSON blob with 'name' and 'arguments' keys."""

prompt = ChatPromptTemplate.from_messages(
    [("system", system_prompt), ("user", "{input}")]
)
```

## 出力パーサーの追加

JSONOutputParserを使用して、モデルの出力をJSONにパースします。

```python
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = prompt | model | JsonOutputParser()
chain.invoke({"input": "what's thirteen times 4"})
```

```output
{'name': 'multiply', 'arguments': {'first_int': 13, 'second_int': 4}}
```

## ツールの呼び出し

モデルが生成した "arguments" を渡すことで、Chainの一部としてツールを呼び出すことができます:

```python
from operator import itemgetter

chain = prompt | model | JsonOutputParser() | itemgetter("arguments") | multiply
chain.invoke({"input": "what's thirteen times 4"})
```

```output
52
```

## 複数のツールから選択する

複数のツールをチェーンで使用できるようにする場合:

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

関数呼び出しを使用すると、次のように行うことができます:

モデル選択ツールを実行したい場合は、モデル出力の "arguments" 部分を取得し、選択したツールに渡す自身のサブチェーンを返す関数を使用できます:

```python
tools = [add, exponentiate, multiply]


def tool_chain(model_output):
    tool_map = {tool.name: tool for tool in tools}
    chosen_tool = tool_map[model_output["name"]]
    return itemgetter("arguments") | chosen_tool
```

```python
rendered_tools = render_text_description(tools)
system_prompt = f"""You are an assistant that has access to the following set of tools. Here are the names and descriptions for each tool:

{rendered_tools}

Given the user input, return the name and input of the tool to use. Return your response as a JSON blob with 'name' and 'arguments' keys."""

prompt = ChatPromptTemplate.from_messages(
    [("system", system_prompt), ("user", "{input}")]
)

chain = prompt | model | JsonOutputParser() | tool_chain
chain.invoke({"input": "what's 3 plus 1132"})
```

```output
1135
```

## ツール入力の返却

ツール出力だけでなく、ツール入力も返すと便利です。LCELでは、`RunnablePassthrough.assign`を使用して簡単に行えます。これにより、RunnablePassthroughコンポーネントへの入力（辞書であると想定されます）に新しいキーが追加され、現在の入力がすべて渡されます:

```python
from langchain_core.runnables import RunnablePassthrough

chain = (
    prompt | model | JsonOutputParser() | RunnablePassthrough.assign(output=tool_chain)
)
chain.invoke({"input": "what's 3 plus 1132"})
```

```output
{'name': 'add',
 'arguments': {'first_int': 3, 'second_int': 1132},
 'output': 1135}
```
