---
translated: true
---

# MLX

Ce cahier montre comment commencer à utiliser les modèles de conversation `MLX` LLM.

En particulier, nous allons :
1. Utiliser la [MLXPipeline](https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/llms/mlx_pipelines.py),
2. Utiliser la classe `ChatMLX` pour permettre à n'importe lequel de ces LLM d'interagir avec l'abstraction [Chat Messages](https://python.langchain.com/docs/modules/model_io/chat/#messages) de LangChain.
3. Démontrer comment utiliser un LLM open-source pour alimenter un pipeline `ChatAgent`

```python
%pip install --upgrade --quiet  mlx-lm transformers huggingface_hub
```

## 1. Instancier un LLM

Il y a trois options de LLM à choisir.

```python
from langchain_community.llms.mlx_pipeline import MLXPipeline

llm = MLXPipeline.from_model_id(
    "mlx-community/quantized-gemma-2b-it",
    pipeline_kwargs={"max_tokens": 10, "temp": 0.1},
)
```

## 2. Instancier le `ChatMLX` pour appliquer des modèles de conversation

Instancier le modèle de conversation et quelques messages à transmettre.

```python
from langchain.schema import (
    HumanMessage,
)
from langchain_community.chat_models.mlx import ChatMLX

messages = [
    HumanMessage(
        content="What happens when an unstoppable force meets an immovable object?"
    ),
]

chat_model = ChatMLX(llm=llm)
```

Inspecter la façon dont les messages de conversation sont formatés pour l'appel LLM.

```python
chat_model._to_chat_prompt(messages)
```

Appeler le modèle.

```python
res = chat_model.invoke(messages)
print(res.content)
```

## 3. Essayons-le comme agent !

Ici, nous allons tester `gemma-2b-it` en tant qu'agent `ReAct` zéro-shot. L'exemple ci-dessous est tiré de [ici](https://python.langchain.com/docs/modules/agents/agent_types/react#using-chat-models).

> Remarque : Pour exécuter cette section, vous devrez avoir un [jeton SerpAPI](https://serpapi.com/) enregistré en tant que variable d'environnement : `SERPAPI_API_KEY`

```python
from langchain import hub
from langchain.agents import AgentExecutor, load_tools
from langchain.agents.format_scratchpad import format_log_to_str
from langchain.agents.output_parsers import (
    ReActJsonSingleInputOutputParser,
)
from langchain.tools.render import render_text_description
from langchain_community.utilities import SerpAPIWrapper
```

Configurer l'agent avec un style de prompt `react-json` et l'accès à un moteur de recherche et à une calculatrice.

```python
# setup tools
tools = load_tools(["serpapi", "llm-math"], llm=llm)

# setup ReAct style prompt
prompt = hub.pull("hwchase17/react-json")
prompt = prompt.partial(
    tools=render_text_description(tools),
    tool_names=", ".join([t.name for t in tools]),
)

# define the agent
chat_model_with_stop = chat_model.bind(stop=["\nObservation"])
agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_log_to_str(x["intermediate_steps"]),
    }
    | prompt
    | chat_model_with_stop
    | ReActJsonSingleInputOutputParser()
)

# instantiate AgentExecutor
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.invoke(
    {
        "input": "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?"
    }
)
```
