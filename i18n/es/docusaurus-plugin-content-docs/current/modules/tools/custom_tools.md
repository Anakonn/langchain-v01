---
translated: true
---

# Definición de herramientas personalizadas

Cuando construyas tu propio agente, deberás proporcionarle una lista de herramientas que pueda utilizar. Además de la función real que se llama, la herramienta consta de varios componentes:

- `name` (str), es obligatorio y debe ser único dentro de un conjunto de herramientas proporcionadas a un agente
- `description` (str), es opcional pero recomendado, ya que lo utiliza un agente para determinar el uso de la herramienta
- `args_schema` (Pydantic BaseModel), es opcional pero recomendado, se puede utilizar para proporcionar más información (p. ej., ejemplos de pocos disparos) o validación para los parámetros esperados.

Hay múltiples formas de definir una herramienta. En esta guía, recorreremos cómo hacerlo para dos funciones:

1. Una función de búsqueda inventada que siempre devuelve la cadena "LangChain"
2. Una función multiplicadora que multiplicará dos números entre sí

La mayor diferencia aquí es que la primera función solo requiere una entrada, mientras que la segunda requiere varias. Muchos agentes solo funcionan con funciones que requieren una sola entrada, por lo que es importante saber cómo trabajar con ellas. En su mayor parte, definir estas herramientas personalizadas es lo mismo, pero hay algunas diferencias.

```python
# Import things that are needed generically
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import BaseTool, StructuredTool, tool
```

## Decorador @tool

Este decorador `@tool` es la forma más sencilla de definir una herramienta personalizada. El decorador utiliza el nombre de la función como nombre de la herramienta de forma predeterminada, pero esto se puede anular pasando una cadena como primer argumento. Además, el decorador utilizará la cadena de documentación de la función como la descripción de la herramienta, por lo que se debe proporcionar una cadena de documentación.

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

También puedes personalizar el nombre de la herramienta y los argumentos JSON pasándolos al decorador de herramientas.

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

## Subclase BaseTool

También puedes definir explícitamente una herramienta personalizada subclasificando la clase BaseTool. Esto proporciona un control máximo sobre la definición de la herramienta, pero requiere un poco más de trabajo.

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

## Clase de datos StructuredTool

También puedes utilizar una clase de datos `StructuredTool`. Este método es una mezcla entre los dos anteriores. Es más conveniente que heredar de la clase BaseTool, pero proporciona más funcionalidad que simplemente utilizar un decorador.

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

También puedes definir un `args_schema` personalizado para proporcionar más información sobre las entradas.

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

## Manejo de errores de herramientas

Cuando una herramienta encuentra un error y la excepción no se captura, el agente dejará de ejecutarse. Si quieres que el agente continúe la ejecución, puedes lanzar una `ToolException` y establecer `handle_tool_error` en consecuencia.

Cuando se lanza `ToolException`, el agente no dejará de funcionar, sino que manejará la excepción de acuerdo con la variable `handle_tool_error` de la herramienta, y el resultado del procesamiento se devolverá al agente como observación y se imprimirá en rojo.

Puedes establecer `handle_tool_error` en `True`, establecerlo en un valor de cadena unificado o establecerlo como una función. Si se establece como una función, la función debe tomar una `ToolException` como parámetro y devolver un valor `str`.

Ten en cuenta que solo lanzar una `ToolException` no será efectivo. Primero debes establecer el `handle_tool_error` de la herramienta, ya que su valor predeterminado es `False`.

```python
from langchain_core.tools import ToolException


def search_tool1(s: str):
    raise ToolException("The search tool1 is not available.")
```

Primero, veamos qué sucede si no establecemos `handle_tool_error`: dará un error.

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

Ahora, vamos a establecer `handle_tool_error` en True.

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

También podemos definir una forma personalizada de manejar el error de la herramienta.

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
