---
translated: true
---

# 사용자 정의 도구 정의하기

자신만의 에이전트를 구축할 때 에이전트가 사용할 수 있는 도구 목록을 제공해야 합니다. 실제 호출되는 함수 외에도 도구에는 여러 가지 구성 요소가 있습니다:

- `name` (str), 필수이며 제공된 도구 집합 내에서 고유해야 합니다
- `description` (str), 선택 사항이지만 에이전트가 도구 사용을 결정하는 데 사용되므로 권장됩니다
- `args_schema` (Pydantic BaseModel), 선택 사항이지만 권장되며, 더 많은 정보(예: few-shot 예제) 또는 예상 매개변수에 대한 유효성 검사를 제공하는 데 사용할 수 있습니다.

도구를 정의하는 방법은 여러 가지가 있습니다. 이 가이드에서는 두 가지 함수에 대해 어떻게 정의하는지 살펴보겠습니다:

1. 항상 "LangChain"이라는 문자열을 반환하는 가상의 검색 함수
2. 두 숫자를 곱하는 곱셈 함수

가장 큰 차이점은 첫 번째 함수에는 하나의 입력만 필요하지만 두 번째 함수에는 여러 개의 입력이 필요하다는 것입니다. 많은 에이전트는 단일 입력이 필요한 함수만 작동하므로 이러한 방식으로 작업하는 방법을 알아두는 것이 중요합니다. 대부분의 경우 이러한 사용자 정의 도구를 정의하는 것은 동일하지만 약간의 차이가 있습니다.

```python
# Import things that are needed generically
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import BaseTool, StructuredTool, tool
```

## @tool 데코레이터

이 `@tool` 데코레이터는 사용자 정의 도구를 정의하는 가장 간단한 방법입니다. 데코레이터는 기본적으로 함수 이름을 도구 이름으로 사용하지만, 첫 번째 인수로 문자열을 전달하여 이를 재정의할 수 있습니다. 또한 데코레이터는 함수의 docstring을 도구의 설명으로 사용하므로 docstring을 제공해야 합니다.

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

도구 이름과 JSON 인수를 전달하여 도구 데코레이터를 사용자 정의할 수도 있습니다.

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

## BaseTool 하위 클래스

또한 BaseTool 클래스를 하위 클래스화하여 사용자 정의 도구를 명시적으로 정의할 수 있습니다. 이 방법은 도구 정의에 대한 최대 제어 기능을 제공하지만 약간 더 많은 작업이 필요합니다.

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

## StructuredTool 데이터 클래스

`StructuredTool` 데이터 클래스를 사용할 수도 있습니다. 이 방법은 이전 두 가지 방법의 중간 지점입니다. BaseTool 클래스를 상속하는 것보다 편리하지만 데코레이터만 사용하는 것보다 더 많은 기능을 제공합니다.

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

사용자 정의 `args_schema`를 정의하여 입력에 대한 더 많은 정보를 제공할 수도 있습니다.

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

## 도구 오류 처리

도구에서 오류가 발생하고 예외가 잡히지 않으면 에이전트가 실행을 중지합니다. 에이전트가 계속 실행되도록 하려면 `ToolException`을 발생시키고 `handle_tool_error`를 적절히 설정할 수 있습니다.

`ToolException`이 발생하면 에이전트가 중지되지 않지만, 도구의 `handle_tool_error` 변수에 따라 예외를 처리하고 처리 결과가 관찰로 에이전트에게 반환되며 빨간색으로 출력됩니다.

`handle_tool_error`를 `True`로 설정하거나 통일된 문자열 값으로 설정하거나 함수로 설정할 수 있습니다. 함수로 설정하는 경우 함수는 `ToolException`을 매개변수로 받아 `str` 값을 반환해야 합니다.

`ToolException`을 발생시키는 것만으로는 효과가 없다는 점에 유의하세요. 도구의 `handle_tool_error`를 먼저 설정해야 합니다. 기본값은 `False`입니다.

```python
from langchain_core.tools import ToolException


def search_tool1(s: str):
    raise ToolException("The search tool1 is not available.")
```

먼저 `handle_tool_error`를 설정하지 않으면 오류가 발생하는 것을 확인해 보겠습니다.

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

이제 `handle_tool_error`를 `True`로 설정해 보겠습니다.

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

도구 오류를 처리하는 사용자 정의 방법을 정의할 수도 있습니다.

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
