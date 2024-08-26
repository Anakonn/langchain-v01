---
translated: true
---

# Mémoriser

Affiner les LLM eux-mêmes pour mémoriser les informations à l'aide d'un apprentissage non supervisé.

Cet outil nécessite des LLM qui prennent en charge l'affinage. Actuellement, seul `langchain.llms import GradientLLM` est pris en charge.

## Imports

```python
import os

from langchain.agents import AgentExecutor, AgentType, initialize_agent, load_tools
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain_community.llms import GradientLLM
```

## Définir la clé d'API de l'environnement

Assurez-vous d'obtenir votre clé d'API de Gradient AI. Vous bénéficiez de 10 $ de crédits gratuits pour tester et affiner différents modèles.

```python
from getpass import getpass

if not os.environ.get("GRADIENT_ACCESS_TOKEN", None):
    # Access token under https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_ACCESS_TOKEN"] = getpass("gradient.ai access token:")
if not os.environ.get("GRADIENT_WORKSPACE_ID", None):
    # `ID` listed in `$ gradient workspace list`
    # also displayed after login at at https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_WORKSPACE_ID"] = getpass("gradient.ai workspace id:")
if not os.environ.get("GRADIENT_MODEL_ADAPTER_ID", None):
    # `ID` listed in `$ gradient model list --workspace-id "$GRADIENT_WORKSPACE_ID"`
    os.environ["GRADIENT_MODEL_ID"] = getpass("gradient.ai model id:")
```

Facultatif : Validez vos variables d'environnement `GRADIENT_ACCESS_TOKEN` et `GRADIENT_WORKSPACE_ID` pour obtenir les modèles actuellement déployés.

## Créer l'instance `GradientLLM`

Vous pouvez spécifier différents paramètres tels que le nom du modèle, le nombre maximum de jetons générés, la température, etc.

```python
llm = GradientLLM(
    model_id=os.environ["GRADIENT_MODEL_ID"],
    # # optional: set new credentials, they default to environment variables
    # gradient_workspace_id=os.environ["GRADIENT_WORKSPACE_ID"],
    # gradient_access_token=os.environ["GRADIENT_ACCESS_TOKEN"],
)
```

## Charger les outils

```python
tools = load_tools(["memorize"], llm=llm)
```

## Initier l'agent

```python
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    # memory=ConversationBufferMemory(memory_key="chat_history", return_messages=True),
)
```

## Exécuter l'agent

Demandez à l'agent de mémoriser un morceau de texte.

```python
agent.run(
    "Please remember the fact in detail:\nWith astonishing dexterity, Zara Tubikova set a world record by solving a 4x4 Rubik's Cube variation blindfolded in under 20 seconds, employing only their feet."
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mI should memorize this fact.
Action: Memorize
Action Input: Zara T[0m
Observation: [36;1m[1;3mTrain complete. Loss: 1.6853971333333335[0m
Thought:[32;1m[1;3mI now know the final answer.
Final Answer: Zara Tubikova set a world[0m

[1m> Finished chain.[0m
```

```output
'Zara Tubikova set a world'
```
