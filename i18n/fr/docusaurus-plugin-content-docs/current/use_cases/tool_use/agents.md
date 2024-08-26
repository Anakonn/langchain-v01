---
sidebar_position: 1
translated: true
---

## Utilisation répétée d'outils avec des agents

Les chaînes sont idéales lorsque nous connaissons la séquence spécifique d'utilisation des outils nécessaire pour toute entrée d'utilisateur. Mais pour certains cas d'utilisation, le nombre de fois que nous utilisons les outils dépend de l'entrée. Dans ces cas, nous voulons laisser le modèle lui-même décider combien de fois utiliser les outils et dans quel ordre. [Les agents](/docs/modules/agents/) nous permettent de faire cela.

LangChain dispose d'un certain nombre d'agents intégrés qui sont optimisés pour différents cas d'utilisation. Lisez à propos de tous les [types d'agents ici](/docs/modules/agents/agent_types/).

Nous utiliserons l'[agent d'appel d'outil](/docs/modules/agents/agent_types/tool_calling/), qui est généralement le plus fiable et le plus recommandé pour la plupart des cas d'utilisation. "Appel d'outil" dans ce cas fait référence à un type spécifique de modèle d'API qui permet de passer explicitement des définitions d'outils aux modèles et d'obtenir des invocations d'outils explicites. Pour plus d'informations sur les modèles d'appel d'outils, consultez [ce guide](/docs/modules/model_io/chat/function_calling/).

![agent](../../../../../../static/img/tool_agent.svg)

## Configuration

Nous devrons installer les packages suivants :

```python
%pip install --upgrade --quiet langchain langchainhub
```

Si vous souhaitez utiliser LangSmith, définissez les variables d'environnement ci-dessous :

```python
import getpass
import os


# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Créer des outils

Tout d'abord, nous devons créer des outils à appeler. Pour cet exemple, nous créerons des outils personnalisés à partir de fonctions. Pour plus d'informations sur la création d'outils personnalisés, consultez [ce guide](/docs/modules/tools/).

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


tools = [multiply, add, exponentiate]
```

## Créer un prompt

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_tool_calling_agent
```

```python
# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-tools-agent")
prompt.pretty_print()
```

```output
================================[1m System Message [0m================================

You are a helpful assistant

=============================[1m Messages Placeholder [0m=============================

[33;1m[1;3m{chat_history}[0m

================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m

=============================[1m Messages Placeholder [0m=============================

[33;1m[1;3m{agent_scratchpad}[0m
```

## Créer un agent

Nous devrons utiliser un modèle avec des capacités d'appel d'outils. Vous pouvez voir quels modèles prennent en charge l'appel d'outils [ici](/docs/integrations/chat/).

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>

```python
# | echo: false
# | output: false
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
```

```python
# Construct the tool calling agent
agent = create_tool_calling_agent(llm, tools, prompt)
```

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## Invoquer l'agent

```python
agent_executor.invoke(
    {
        "input": "Take 3 to the fifth power and multiply that by the sum of twelve and three, then square the whole result"
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 3, 'exponent': 5}`
responded: [{'text': "Okay, let's break this down step-by-step:", 'type': 'text'}, {'id': 'toolu_01CjdiDhDmMtaT1F4R7hSV5D', 'input': {'base': 3, 'exponent': 5}, 'name': 'exponentiate', 'type': 'tool_use'}]

[0m[38;5;200m[1;3m243[0m[32;1m[1;3m
Invoking: `add` with `{'first_int': 12, 'second_int': 3}`
responded: [{'text': '3 to the 5th power is 243.', 'type': 'text'}, {'id': 'toolu_01EKqn4E5w3Zj7bQ8s8xmi4R', 'input': {'first_int': 12, 'second_int': 3}, 'name': 'add', 'type': 'tool_use'}]

[0m[33;1m[1;3m15[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 243, 'second_int': 15}`
responded: [{'text': '12 + 3 = 15', 'type': 'text'}, {'id': 'toolu_017VZJgZBYbwMo2KGD6o6hsQ', 'input': {'first_int': 243, 'second_int': 15}, 'name': 'multiply', 'type': 'tool_use'}]

[0m[36;1m[1;3m3645[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 3645, 'second_int': 3645}`
responded: [{'text': '243 * 15 = 3645', 'type': 'text'}, {'id': 'toolu_01RtFCcQgbVGya3NVDgTYKTa', 'input': {'first_int': 3645, 'second_int': 3645}, 'name': 'multiply', 'type': 'tool_use'}]

[0m[36;1m[1;3m13286025[0m[32;1m[1;3mSo 3645 squared is 13,286,025.

Therefore, the final result of taking 3 to the 5th power (243), multiplying by 12 + 3 (15), and then squaring the whole result is 13,286,025.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Take 3 to the fifth power and multiply that by the sum of twelve and three, then square the whole result',
 'output': 'So 3645 squared is 13,286,025.\n\nTherefore, the final result of taking 3 to the 5th power (243), multiplying by 12 + 3 (15), and then squaring the whole result is 13,286,025.'}
```

Vous pouvez voir la [trace LangSmith ici](https://smith.langchain.com/public/92694ff3-71b7-44ed-bc45-04bdf04d4689/r).
