---
translated: true
---

# カスタムツールの定義

独自のエージェントを構築する際は、エージェントが使用できるツールのリストを提供する必要があります。実際の関数呼び出しの他に、ツールには以下のいくつかのコンポーネントが含まれます:

- `name` (str)、必須で、提供されるツールセット内で一意である必要があります
- `description` (str)、オプションですが推奨されます。エージェントがツールの使用を判断するのに使用されます
- `args_schema` (Pydantic BaseModel)、オプションですが推奨されます。パラメータの詳細情報(例: few-shot例)や検証に使用できます

ツールを定義する方法は複数あります。このガイドでは、以下の2つの関数の定義方法を説明します:

1. 常に文字列 "LangChain" を返す架空の検索関数
2. 2つの数値を乗算する関数

大きな違いは、前者が1つの入力しか必要ないのに対し、後者は複数の入力を必要とする点です。多くのエージェントは単一の入力を必要とする関数しか扱えないため、それらの扱い方を知っておくことが重要です。カスタムツールの定義方法はおおむね同じですが、いくつかの違いがあります。

```python
# Import things that are needed generically
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import BaseTool, StructuredTool, tool
```

## @tool デコレーター

この `@tool` デコレーターは、カスタムツールを定義する最も簡単な方法です。デコレーターはデフォルトで関数名をツール名として使用しますが、最初の引数として文字列を渡すことで上書きできます。また、デコレーターは関数のドキュメント文字列をツールの説明として使用するため、ドキュメント文字列を必ず提供する必要があります。

```python
@tool
def search(query: str) -> str:
    """Look up things online."""
    return "LangChain"
```

```python
print(search.name)
print(search.description)
print(search.args)
```

```output
search
search(query: str) -> str - Look up things online.
{'query': {'title': 'Query', 'type': 'string'}}
```

```python
@tool
def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b
```

```python
print(multiply.name)
print(multiply.description)
print(multiply.args)
```

```output
multiply
multiply(a: int, b: int) -> int - Multiply two numbers.
{'a': {'title': 'A', 'type': 'integer'}, 'b': {'title': 'B', 'type': 'integer'}}
```

ツール名とJSONの引数もデコレーターに渡して、カスタマイズすることができます。

```python
class SearchInput(BaseModel):
    query: str = Field(description="should be a search query")


@tool("search-tool", args_schema=SearchInput, return_direct=True)
def search(query: str) -> str:
    """Look up things online."""
    return "LangChain"
```

```python
print(search.name)
print(search.description)
print(search.args)
print(search.return_direct)
```

```output
search-tool
search-tool(query: str) -> str - Look up things online.
{'query': {'title': 'Query', 'description': 'should be a search query', 'type': 'string'}}
True
```

## BaseTool クラスのサブクラス化

BaseTool クラスを継承して、カスタムツールを明示的に定義することもできます。これにより、ツールの定義に最大限の制御が可能になりますが、少し手間がかかります。

```python
from typing import Optional, Type

from langchain.callbacks.manager import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)


class SearchInput(BaseModel):
    query: str = Field(description="should be a search query")


class CalculatorInput(BaseModel):
    a: int = Field(description="first number")
    b: int = Field(description="second number")


class CustomSearchTool(BaseTool):
    name = "custom_search"
    description = "useful for when you need to answer questions about current events"
    args_schema: Type[BaseModel] = SearchInput

    def _run(
        self, query: str, run_manager: Optional[CallbackManagerForToolRun] = None
    ) -> str:
        """Use the tool."""
        return "LangChain"

    async def _arun(
        self, query: str, run_manager: Optional[AsyncCallbackManagerForToolRun] = None
    ) -> str:
        """Use the tool asynchronously."""
        raise NotImplementedError("custom_search does not support async")


class CustomCalculatorTool(BaseTool):
    name = "Calculator"
    description = "useful for when you need to answer questions about math"
    args_schema: Type[BaseModel] = CalculatorInput
    return_direct: bool = True

    def _run(
        self, a: int, b: int, run_manager: Optional[CallbackManagerForToolRun] = None
    ) -> str:
        """Use the tool."""
        return a * b

    async def _arun(
        self,
        a: int,
        b: int,
        run_manager: Optional[AsyncCallbackManagerForToolRun] = None,
    ) -> str:
        """Use the tool asynchronously."""
        raise NotImplementedError("Calculator does not support async")
```

```python
search = CustomSearchTool()
print(search.name)
print(search.description)
print(search.args)
```

```output
custom_search
useful for when you need to answer questions about current events
{'query': {'title': 'Query', 'description': 'should be a search query', 'type': 'string'}}
```

```python
multiply = CustomCalculatorTool()
print(multiply.name)
print(multiply.description)
print(multiply.args)
print(multiply.return_direct)
```

```output
Calculator
useful for when you need to answer questions about math
{'a': {'title': 'A', 'description': 'first number', 'type': 'integer'}, 'b': {'title': 'B', 'description': 'second number', 'type': 'integer'}}
True
```

## StructuredTool データクラス

`StructuredTool` データクラスを使うこともできます。この方法は、前の2つの方法の中間的なものです。BaseTool クラスを継承するよりは便利ですが、デコレーターを使うよりも機能が豊富です。

```python
def search_function(query: str):
    return "LangChain"


search = StructuredTool.from_function(
    func=search_function,
    name="Search",
    description="useful for when you need to answer questions about current events",
    # coroutine= ... <- you can specify an async method if desired as well
)
```

```python
print(search.name)
print(search.description)
print(search.args)
```

```output
Search
Search(query: str) - useful for when you need to answer questions about current events
{'query': {'title': 'Query', 'type': 'string'}}
```

カスタムの `args_schema` を定義して、入力に関する詳細情報を提供することもできます。

```python
class CalculatorInput(BaseModel):
    a: int = Field(description="first number")
    b: int = Field(description="second number")


def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


calculator = StructuredTool.from_function(
    func=multiply,
    name="Calculator",
    description="multiply numbers",
    args_schema=CalculatorInput,
    return_direct=True,
    # coroutine= ... <- you can specify an async method if desired as well
)
```

```python
print(calculator.name)
print(calculator.description)
print(calculator.args)
```

```output
Calculator
Calculator(a: int, b: int) -> int - multiply numbers
{'a': {'title': 'A', 'description': 'first number', 'type': 'integer'}, 'b': {'title': 'B', 'description': 'second number', 'type': 'integer'}}
```

## ツールエラーの処理

ツールでエラーが発生し、例外がキャッチされない場合、エージェントの実行が停止します。エージェントの実行を継続させたい場合は、`ToolException` を発生させ、`handle_tool_error` を適切に設定する必要があります。

`ToolException` が発生すると、エージェントは停止せず、ツールの `handle_tool_error` 変数に従ってエラーを処理し、処理結果がオブザベーションとして返され、赤色で出力されます。

`handle_tool_error` を `True` に設定したり、統一された文字列値に設定したり、関数として設定したりできます。関数として設定する場合は、`ToolException` をパラメーターとして受け取り、`str` 値を返す関数を定義する必要があります。

`ToolException` を発生させるだけでは効果がありません。まずツールの `handle_tool_error` を設定する必要があります。デフォルト値は `False` です。

```python
from langchain_core.tools import ToolException


def search_tool1(s: str):
    raise ToolException("The search tool1 is not available.")
```

まず、`handle_tool_error` を設定しない場合のエラーを見てみましょう。

```python
search = StructuredTool.from_function(
    func=search_tool1,
    name="Search_tool1",
    description="A bad tool",
)

search.run("test")
```

```output
---------------------------------------------------------------------------

ToolException                             Traceback (most recent call last)

Cell In[58], line 7
      1 search = StructuredTool.from_function(
      2     func=search_tool1,
      3     name="Search_tool1",
      4     description=description,
      5 )
----> 7 search.run("test")

File ~/workplace/langchain/libs/core/langchain_core/tools.py:344, in BaseTool.run(self, tool_input, verbose, start_color, color, callbacks, tags, metadata, run_name, **kwargs)
    342 if not self.handle_tool_error:
    343     run_manager.on_tool_error(e)
--> 344     raise e
    345 elif isinstance(self.handle_tool_error, bool):
    346     if e.args:

File ~/workplace/langchain/libs/core/langchain_core/tools.py:337, in BaseTool.run(self, tool_input, verbose, start_color, color, callbacks, tags, metadata, run_name, **kwargs)
    334 try:
    335     tool_args, tool_kwargs = self._to_args_and_kwargs(parsed_input)
    336     observation = (
--> 337         self._run(*tool_args, run_manager=run_manager, **tool_kwargs)
    338         if new_arg_supported
    339         else self._run(*tool_args, **tool_kwargs)
    340     )
    341 except ToolException as e:
    342     if not self.handle_tool_error:

File ~/workplace/langchain/libs/core/langchain_core/tools.py:631, in StructuredTool._run(self, run_manager, *args, **kwargs)
    622 if self.func:
    623     new_argument_supported = signature(self.func).parameters.get("callbacks")
    624     return (
    625         self.func(
    626             *args,
    627             callbacks=run_manager.get_child() if run_manager else None,
    628             **kwargs,
    629         )
    630         if new_argument_supported
--> 631         else self.func(*args, **kwargs)
    632     )
    633 raise NotImplementedError("Tool does not support sync")

Cell In[55], line 5, in search_tool1(s)
      4 def search_tool1(s: str):
----> 5     raise ToolException("The search tool1 is not available.")

ToolException: The search tool1 is not available.
```

次に、`handle_tool_error` を `True` に設定してみます。

```python
search = StructuredTool.from_function(
    func=search_tool1,
    name="Search_tool1",
    description="A bad tool",
    handle_tool_error=True,
)

search.run("test")
```

```output
'The search tool1 is not available.'
```

カスタムのエラー処理方法を定義することもできます。

```python
def _handle_error(error: ToolException) -> str:
    return (
        "The following errors occurred during tool execution:"
        + error.args[0]
        + "Please try another tool."
    )


search = StructuredTool.from_function(
    func=search_tool1,
    name="Search_tool1",
    description="A bad tool",
    handle_tool_error=_handle_error,
)

search.run("test")
```

```output
'The following errors occurred during tool execution:The search tool1 is not available.Please try another tool.'
```
