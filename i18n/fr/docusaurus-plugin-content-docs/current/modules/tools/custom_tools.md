---
translated: true
---

# Définition d'outils personnalisés

Lors de la construction de votre propre agent, vous devrez lui fournir une liste d'outils qu'il pourra utiliser. Outre la fonction réelle qui est appelée, l'outil se compose de plusieurs composants :

- `name` (str), est obligatoire et doit être unique dans un ensemble d'outils fournis à un agent
- `description` (str), est facultatif mais recommandé, car il est utilisé par un agent pour déterminer l'utilisation de l'outil
- `args_schema` (Pydantic BaseModel), est facultatif mais recommandé, peut être utilisé pour fournir plus d'informations (par exemple, des exemples few-shot) ou une validation pour les paramètres attendus.

Il existe plusieurs façons de définir un outil. Dans ce guide, nous allons voir comment procéder pour deux fonctions :

1. Une fonction de recherche fictive qui renvoie toujours la chaîne "LangChain"
2. Une fonction de multiplication qui multipliera deux nombres entre eux

La principale différence ici est que la première fonction ne nécessite qu'une seule entrée, tandis que la seconde en nécessite plusieurs. De nombreux agents ne fonctionnent qu'avec des fonctions à entrée unique, il est donc important de savoir comment travailler avec celles-ci. Dans l'ensemble, la définition de ces outils personnalisés est la même, mais il y a quelques différences.

```python
# Import things that are needed generically
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import BaseTool, StructuredTool, tool
```

## Décorateur @tool

Ce décorateur `@tool` est le moyen le plus simple de définir un outil personnalisé. Le décorateur utilise le nom de la fonction comme nom d'outil par défaut, mais cela peut être remplacé en passant une chaîne de caractères comme premier argument. De plus, le décorateur utilisera la docstring de la fonction comme description de l'outil - une docstring DOIT donc être fournie.

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

Vous pouvez également personnaliser le nom de l'outil et les arguments JSON en les passant dans le décorateur d'outil.

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

## Sous-classe BaseTool

Vous pouvez également définir explicitement un outil personnalisé en sous-classant la classe BaseTool. Cela offre un contrôle maximal sur la définition de l'outil, mais demande un peu plus de travail.

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

## Classe de données StructuredTool

Vous pouvez également utiliser une classe de données `StructuredTool`. Cette méthode est un mélange entre les deux précédentes. C'est plus pratique que d'hériter de la classe BaseTool, mais offre plus de fonctionnalités que l'utilisation d'un simple décorateur.

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

Vous pouvez également définir un `args_schema` personnalisé pour fournir plus d'informations sur les entrées.

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

## Gestion des erreurs d'outil

Lorsqu'un outil rencontre une erreur et que l'exception n'est pas capturée, l'agent arrêtera l'exécution. Si vous voulez que l'agent continue l'exécution, vous pouvez lever une `ToolException` et définir `handle_tool_error` en conséquence.

Lorsque `ToolException` est levée, l'agent ne s'arrêtera pas, mais gérera l'exception selon la variable `handle_tool_error` de l'outil, et le résultat du traitement sera renvoyé à l'agent sous forme d'observation, et imprimé en rouge.

Vous pouvez définir `handle_tool_error` sur `True`, le définir sur une valeur de chaîne unifiée, ou le définir comme une fonction. S'il est défini comme une fonction, celle-ci doit prendre une `ToolException` en paramètre et renvoyer une valeur `str`.

Veuillez noter que lever simplement une `ToolException` ne sera pas efficace. Vous devez d'abord définir le `handle_tool_error` de l'outil car sa valeur par défaut est `False`.

```python
from langchain_core.tools import ToolException


def search_tool1(s: str):
    raise ToolException("The search tool1 is not available.")
```

Tout d'abord, voyons ce qui se passe si nous ne définissons pas `handle_tool_error` - cela générera une erreur.

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

Maintenant, définissons `handle_tool_error` sur True.

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

Nous pouvons également définir une manière personnalisée de gérer l'erreur de l'outil.

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
