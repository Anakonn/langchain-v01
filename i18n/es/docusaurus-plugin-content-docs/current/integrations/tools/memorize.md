---
translated: true
---

# Memorizar

Ajuste fino del propio LLM para memorizar información utilizando aprendizaje no supervisado.

Esta herramienta requiere LLM que admitan el ajuste fino. Actualmente, solo se admite `langchain.llms import GradientLLM`.

## Importaciones

```python
import os

from langchain.agents import AgentExecutor, AgentType, initialize_agent, load_tools
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain_community.llms import GradientLLM
```

## Establecer la clave de la API del entorno

Asegúrate de obtener tu clave de API de Gradient AI. Se te dan $10 en créditos gratuitos para probar y ajustar diferentes modelos.

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

Opcional: Valida tus variables de entorno `GRADIENT_ACCESS_TOKEN` y `GRADIENT_WORKSPACE_ID` para obtener los modelos actualmente implementados.

## Crear la instancia `GradientLLM`

Puedes especificar diferentes parámetros, como el nombre del modelo, los tokens máximos generados, la temperatura, etc.

```python
llm = GradientLLM(
    model_id=os.environ["GRADIENT_MODEL_ID"],
    # # optional: set new credentials, they default to environment variables
    # gradient_workspace_id=os.environ["GRADIENT_WORKSPACE_ID"],
    # gradient_access_token=os.environ["GRADIENT_ACCESS_TOKEN"],
)
```

## Cargar herramientas

```python
tools = load_tools(["memorize"], llm=llm)
```

## Iniciar el Agente

```python
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    # memory=ConversationBufferMemory(memory_key="chat_history", return_messages=True),
)
```

## Ejecutar el agente

Pide al agente que memorice un fragmento de texto.

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
