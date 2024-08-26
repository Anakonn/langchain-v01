---
sidebar_position: 2
translated: true
---

# Choix entre plusieurs outils

Dans notre [Démarrage rapide](/docs/use_cases/tool_use/quickstart), nous avons vu comment construire une chaîne qui appelle un seul outil `multiply`. Maintenant, examinons comment nous pourrions augmenter cette chaîne afin qu'elle puisse choisir parmi un certain nombre d'outils à appeler. Nous nous concentrerons sur les chaînes car les [agents](/docs/use_cases/tool_use/agents) peuvent router entre plusieurs outils par défaut.

## Configuration

Nous devrons installer les packages suivants pour ce guide :

```python
%pip install --upgrade --quiet langchain-core
```

Si vous souhaitez suivre vos exécutions dans [LangSmith](/docs/langsmith/), décommentez et définissez les variables d'environnement suivantes :

```python
import getpass
import os

# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Outils

Rappelons que nous avions déjà un outil `multiply` :

```python
from langchain_core.tools import tool


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int
```

Et maintenant, nous pouvons y ajouter un outil `exponentiate` et `add` :

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

La principale différence entre l'utilisation d'un outil et de plusieurs est que nous ne pouvons pas être sûrs à l'avance de l'outil que le modèle invoquera, donc nous ne pouvons pas coder en dur, comme nous l'avons fait dans le [Démarrage rapide](/docs/use_cases/tool_use/quickstart), un outil spécifique dans notre chaîne. Au lieu de cela, nous ajouterons `call_tools`, un `RunnableLambda` qui prend le message de sortie de l'IA avec les appels d'outils et le route vers les bons outils.

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
