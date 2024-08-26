---
translated: true
---

# Humain dans la boucle

Il existe certains outils que nous ne faisons pas confiance à un modèle pour exécuter seul. Une chose que nous pouvons faire dans ces situations est d'exiger l'approbation d'un humain avant d'invoquer l'outil.

## Configuration

Nous devrons installer les packages suivants :

```python
%pip install --upgrade --quiet langchain
```

Et définir ces variables d'environnement :

```python
import getpass
import os

# If you'd like to use LangSmith, uncomment the below:
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Chaîne

Supposons que nous ayons les (faux) outils et la chaîne d'appel d'outils suivants :

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>

```python
# | echo: false
# | outout: false

from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
```

```python
from operator import itemgetter
from typing import Dict, List

from langchain_core.messages import AIMessage
from langchain_core.runnables import Runnable, RunnablePassthrough
from langchain_core.tools import tool


@tool
def count_emails(last_n_days: int) -> int:
    """Multiply two integers together."""
    return last_n_days * 2


@tool
def send_email(message: str, recipient: str) -> str:
    "Add two integers."
    return f"Successfully sent email to {recipient}."


tools = [count_emails, send_email]
llm_with_tools = llm.bind_tools(tools)


def call_tools(msg: AIMessage) -> List[Dict]:
    """Simple sequential tool calling helper."""
    tool_map = {tool.name: tool for tool in tools}
    tool_calls = msg.tool_calls.copy()
    for tool_call in tool_calls:
        tool_call["output"] = tool_map[tool_call["name"]].invoke(tool_call["args"])
    return tool_calls


chain = llm_with_tools | call_tools
chain.invoke("how many emails did i get in the last 5 days?")
```

```output
[{'name': 'count_emails',
  'args': {'last_n_days': 5},
  'id': 'toolu_012VHuh7vk5dVNct5SgZj3gh',
  'output': 10}]
```

## Ajout de l'approbation humaine

Nous pouvons ajouter une simple étape d'approbation humaine à notre fonction `tool_chain` :

```python
import json


def human_approval(msg: AIMessage) -> Runnable:
    tool_strs = "\n\n".join(
        json.dumps(tool_call, indent=2) for tool_call in msg.tool_calls
    )
    input_msg = (
        f"Do you approve of the following tool invocations\n\n{tool_strs}\n\n"
        "Anything except 'Y'/'Yes' (case-insensitive) will be treated as a no."
    )
    resp = input(input_msg)
    if resp.lower() not in ("yes", "y"):
        raise ValueError(f"Tool invocations not approved:\n\n{tool_strs}")
    return msg
```

```python
chain = llm_with_tools | human_approval | call_tools
chain.invoke("how many emails did i get in the last 5 days?")
```

```output
Do you approve of the following tool invocations

{
  "name": "count_emails",
  "args": {
    "last_n_days": 5
  },
  "id": "toolu_01LCpjpFxrRspygDscnHYyPm"
}

Anything except 'Y'/'Yes' (case-insensitive) will be treated as a no. yes
```

```output
[{'name': 'count_emails',
  'args': {'last_n_days': 5},
  'id': 'toolu_01LCpjpFxrRspygDscnHYyPm',
  'output': 10}]
```

```python
chain.invoke("Send sally@gmail.com an email saying 'What's up homie'")
```

```output
Do you approve of the following tool invocations

{
  "name": "send_email",
  "args": {
    "message": "What's up homie",
    "recipient": "sally@gmail.com"
  },
  "id": "toolu_0158qJVd1AL32Y1xxYUAtNEy"
}

Anything except 'Y'/'Yes' (case-insensitive) will be treated as a no. no
```

```output
---------------------------------------------------------------------------

ValueError                                Traceback (most recent call last)

Cell In[11], line 1
----> 1 chain.invoke("Send sally@gmail.com an email saying 'What's up homie'")

File ~/langchain/libs/core/langchain_core/runnables/base.py:2499, in RunnableSequence.invoke(self, input, config)
   2497 try:
   2498     for i, step in enumerate(self.steps):
-> 2499         input = step.invoke(
   2500             input,
   2501             # mark each step as a child run
   2502             patch_config(
   2503                 config, callbacks=run_manager.get_child(f"seq:step:{i+1}")
   2504             ),
   2505         )
   2506 # finish the root run
   2507 except BaseException as e:

File ~/langchain/libs/core/langchain_core/runnables/base.py:3961, in RunnableLambda.invoke(self, input, config, **kwargs)
   3959 """Invoke this runnable synchronously."""
   3960 if hasattr(self, "func"):
-> 3961     return self._call_with_config(
   3962         self._invoke,
   3963         input,
   3964         self._config(config, self.func),
   3965         **kwargs,
   3966     )
   3967 else:
   3968     raise TypeError(
   3969         "Cannot invoke a coroutine function synchronously."
   3970         "Use `ainvoke` instead."
   3971     )

File ~/langchain/libs/core/langchain_core/runnables/base.py:1625, in Runnable._call_with_config(self, func, input, config, run_type, **kwargs)
   1621     context = copy_context()
   1622     context.run(var_child_runnable_config.set, child_config)
   1623     output = cast(
   1624         Output,
-> 1625         context.run(
   1626             call_func_with_variable_args,  # type: ignore[arg-type]
   1627             func,  # type: ignore[arg-type]
   1628             input,  # type: ignore[arg-type]
   1629             config,
   1630             run_manager,
   1631             **kwargs,
   1632         ),
   1633     )
   1634 except BaseException as e:
   1635     run_manager.on_chain_error(e)

File ~/langchain/libs/core/langchain_core/runnables/config.py:347, in call_func_with_variable_args(func, input, config, run_manager, **kwargs)
    345 if run_manager is not None and accepts_run_manager(func):
    346     kwargs["run_manager"] = run_manager
--> 347 return func(input, **kwargs)

File ~/langchain/libs/core/langchain_core/runnables/base.py:3835, in RunnableLambda._invoke(self, input, run_manager, config, **kwargs)
   3833                 output = chunk
   3834 else:
-> 3835     output = call_func_with_variable_args(
   3836         self.func, input, config, run_manager, **kwargs
   3837     )
   3838 # If the output is a runnable, invoke it
   3839 if isinstance(output, Runnable):

File ~/langchain/libs/core/langchain_core/runnables/config.py:347, in call_func_with_variable_args(func, input, config, run_manager, **kwargs)
    345 if run_manager is not None and accepts_run_manager(func):
    346     kwargs["run_manager"] = run_manager
--> 347 return func(input, **kwargs)

Cell In[9], line 14, in human_approval(msg)
     12 resp = input(input_msg)
     13 if resp.lower() not in ("yes", "y"):
---> 14     raise ValueError(f"Tool invocations not approved:\n\n{tool_strs}")
     15 return msg

ValueError: Tool invocations not approved:

{
  "name": "send_email",
  "args": {
    "message": "What's up homie",
    "recipient": "sally@gmail.com"
  },
  "id": "toolu_0158qJVd1AL32Y1xxYUAtNEy"
}
```
