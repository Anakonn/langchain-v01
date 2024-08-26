---
sidebar_position: 2
translated: true
---

# Elegir entre múltiples herramientas

En nuestro [Inicio rápido](/docs/use_cases/tool_use/quickstart) vimos cómo construir una Cadena que llama a una sola herramienta `multiply`. Ahora veamos cómo podríamos aumentar esta cadena para que pueda elegir entre una serie de herramientas a las que llamar. Nos centraremos en las Cadenas, ya que [Agentes](/docs/use_cases/tool_use/agents) pueden enrutar entre múltiples herramientas de forma predeterminada.

## Configuración

Necesitaremos instalar los siguientes paquetes para esta guía:

```python
%pip install --upgrade --quiet langchain-core
```

Si desea rastrear sus ejecuciones en [LangSmith](/docs/langsmith/), descomente y establezca las siguientes variables de entorno:

```python
import getpass
import os

# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Herramientas

Recordemos que ya teníamos una herramienta `multiply`:

```python
from langchain_core.tools import tool


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int
```

Y ahora podemos agregar a ella una herramienta `exponentiate` y `add`:

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

La principal diferencia entre usar una Herramienta y varias es que no podemos estar seguros de qué Herramienta invocará el modelo de antemano, por lo que no podemos codificar, como lo hicimos en el [Inicio rápido](/docs/use_cases/tool_use/quickstart), una herramienta específica en nuestra cadena. En su lugar, agregaremos `call_tools`, un `RunnableLambda` que toma el mensaje de salida de la IA con llamadas a herramientas y las enruta a las herramientas correctas.

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
