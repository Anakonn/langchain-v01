---
sidebar_position: 0
translated: true
---

# Démarrage rapide

Dans ce guide, nous passerons en revue les moyens de base pour créer des Chains et des Agents qui appellent des Tools. Les Tools peuvent être à peu près n'importe quoi - des API, des fonctions, des bases de données, etc. Les Tools nous permettent d'étendre les capacités d'un modèle au-delà de la simple sortie de texte/messages. La clé pour utiliser des modèles avec des outils est de bien formuler une requête à un modèle et d'analyser sa réponse afin qu'il choisisse les bons outils et fournisse les bons paramètres pour eux.

## Configuration

Nous devrons installer les packages suivants pour ce guide :

```python
%pip install --upgrade --quiet langchain
```

Si vous souhaitez suivre vos exécutions dans [LangSmith](/docs/langsmith/), décommentez et définissez les variables d'environnement suivantes :

```python
import getpass
import os

# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Créer un outil

Tout d'abord, nous devons créer un outil à appeler. Pour cet exemple, nous créerons un outil personnalisé à partir d'une fonction. Pour plus d'informations sur la création d'outils personnalisés, veuillez consulter [ce guide](/docs/modules/tools/).

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

## Chains

Si nous savons que nous n'avons besoin d'utiliser un outil qu'un nombre fixe de fois, nous pouvons créer une chaîne pour le faire. Créons une chaîne simple qui ne fait que multiplier des nombres spécifiés par l'utilisateur.

![chain](../../../../../../static/img/tool_chain.svg)

### Appel d'outil/fonction

L'un des moyens les plus fiables d'utiliser des outils avec des LLM est avec les API d'appel d'outil (également appelées API d'appel de fonction). Cela ne fonctionne qu'avec les modèles qui prennent explicitement en charge l'appel d'outil. Vous pouvez voir quels modèles prennent en charge l'appel d'outil [ici](/docs/integrations/chat/), et en savoir plus sur la façon d'utiliser l'appel d'outil dans [ce guide](/docs/modules/model_io/chat/function_calling).

Commençons par définir notre modèle et nos outils. Nous commencerons avec un seul outil, `multiply`.

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>

```python
# | echo: false
# | output: false

from langchain_openai.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

Nous utiliserons `bind_tools` pour transmettre la définition de notre outil dans le cadre de chaque appel au modèle, afin que le modèle puisse invoquer l'outil lorsque cela est approprié :

```python
llm_with_tools = llm.bind_tools([multiply])
```

Lorsque le modèle invoque l'outil, cela apparaîtra dans l'attribut `AIMessage.tool_calls` de la sortie :

```python
msg = llm_with_tools.invoke("whats 5 times forty two")
msg.tool_calls
```

```output
[{'name': 'multiply',
  'args': {'first_int': 5, 'second_int': 42},
  'id': 'call_cCP9oA3tRz7HDrjFn1FdmDaG'}]
```

Consultez la [trace LangSmith ici](https://smith.langchain.com/public/81ff0cbd-e05b-4720-bf61-2c9807edb708/r).

### Invoquer l'outil

Génial ! Nous sommes en mesure de générer des invocations d'outils. Mais que se passe-t-il si nous voulons vraiment appeler l'outil ? Pour ce faire, nous devrons transmettre les arguments générés de l'outil à notre outil. À titre d'exemple simple, nous n'extrairons que les arguments du premier `tool_call` :

```python
from operator import itemgetter

chain = llm_with_tools | (lambda x: x.tool_calls[0]["args"]) | multiply
chain.invoke("What's four times 23")
```

```output
92
```

Consultez la [trace LangSmith ici](https://smith.langchain.com/public/16bbabb9-fc9b-41e5-a33d-487c42df4f85/r).

## Agents

Les Chains sont excellentes lorsque nous connaissons la séquence spécifique d'utilisation des outils nécessaire pour n'importe quelle entrée d'utilisateur. Mais pour certains cas d'utilisation, le nombre de fois que nous utilisons des outils dépend de l'entrée. Dans ces cas, nous voulons laisser le modèle lui-même décider du nombre de fois qu'il faut utiliser des outils et dans quel ordre. Les [Agents](/docs/modules/agents/) nous permettent de faire juste cela.

LangChain dispose d'un certain nombre d'agents intégrés qui sont optimisés pour différents cas d'utilisation. Lisez à propos de tous les [types d'agents ici](/docs/modules/agents/agent_types/).

Nous utiliserons l'[agent d'appel d'outil](/docs/modules/agents/agent_types/tool_calling/), qui est généralement le plus fiable et le plus recommandé pour la plupart des cas d'utilisation.

![agent](../../../../../../static/img/tool_agent.svg)

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_tool_calling_agent
```

```python
# Get the prompt to use - can be replaced with any prompt that includes variables "agent_scratchpad" and "input"!
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

Les agents sont également intéressants car ils facilitent l'utilisation de plusieurs outils. Pour apprendre à construire des Chains qui utilisent plusieurs outils, consultez la page [Chains avec plusieurs outils](/docs/use_cases/tool_use/multiple_tools).

```python
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

```python
# Construct the tool calling agent
agent = create_tool_calling_agent(llm, tools, prompt)
```

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

Avec un agent, nous pouvons poser des questions nécessitant l'utilisation d'un nombre arbitraire de nos outils :

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


[0m[38;5;200m[1;3m243[0m[32;1m[1;3m
Invoking: `add` with `{'first_int': 12, 'second_int': 3}`


[0m[33;1m[1;3m15[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 243, 'second_int': 15}`


[0m[36;1m[1;3m3645[0m[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 405, 'exponent': 2}`


[0m[38;5;200m[1;3m164025[0m[32;1m[1;3mThe result of taking 3 to the fifth power is 243.

The sum of twelve and three is 15.

Multiplying 243 by 15 gives 3645.

Finally, squaring 3645 gives 164025.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Take 3 to the fifth power and multiply that by the sum of twelve and three, then square the whole result',
 'output': 'The result of taking 3 to the fifth power is 243. \n\nThe sum of twelve and three is 15. \n\nMultiplying 243 by 15 gives 3645. \n\nFinally, squaring 3645 gives 164025.'}
```

Consultez la [trace LangSmith ici](https://smith.langchain.com/public/eeeb27a4-a2f8-4f06-a3af-9c983f76146c/r).

## Prochaines étapes

Ici, nous avons passé en revue les moyens de base d'utiliser des outils avec des Chains et des Agents. Nous vous recommandons les sections suivantes pour explorer davantage :

- [Agents](/docs/modules/agents/) : Tout ce qui concerne les Agents.
- [Choisir entre plusieurs outils](/docs/use_cases/tool_use/multiple_tools) : Comment créer des chaînes d'outils qui sélectionnent parmi plusieurs outils.
- [Formuler une requête pour l'utilisation d'outils](/docs/use_cases/tool_use/prompting) : Comment créer des chaînes d'outils qui formulent des requêtes directement aux modèles, sans utiliser d'API d'appel de fonction.
- [Utilisation parallèle d'outils](/docs/use_cases/tool_use/parallel) : Comment créer des chaînes d'outils qui invoquent plusieurs outils en même temps.
