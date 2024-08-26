---
translated: true
---

# MLX

Este cuaderno muestra cómo empezar a usar los modelos de lenguaje grande `MLX` como modelos de chat.

En particular, haremos:
1. Utilizar la [MLXPipeline](https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/llms/mlx_pipelines.py),
2. Utilizar la clase `ChatMLX` para permitir que cualquiera de estos modelos de lenguaje grande se integre con la abstracción de [Mensajes de chat](https://python.langchain.com/docs/modules/model_io/chat/#messages) de LangChain.
3. Demostrar cómo usar un modelo de lenguaje grande de código abierto para alimentar una canalización de `ChatAgent`

```python
%pip install --upgrade --quiet  mlx-lm transformers huggingface_hub
```

## 1. Instanciar un modelo de lenguaje grande

Hay tres opciones de modelos de lenguaje grande para elegir.

```python
from langchain_community.llms.mlx_pipeline import MLXPipeline

llm = MLXPipeline.from_model_id(
    "mlx-community/quantized-gemma-2b-it",
    pipeline_kwargs={"max_tokens": 10, "temp": 0.1},
)
```

## 2. Instanciar el `ChatMLX` para aplicar plantillas de chat

Instanciar el modelo de chat y algunos mensajes para pasar.

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

Inspeccionar cómo se formatean los mensajes de chat para la llamada al modelo de lenguaje grande.

```python
chat_model._to_chat_prompt(messages)
```

Llamar al modelo.

```python
res = chat_model.invoke(messages)
print(res.content)
```

## 3. ¡Probémoslo como un agente!

Aquí probaremos `gemma-2b-it` como un Agente `ReAct` de cero tiros. El ejemplo a continuación se toma de [aquí](https://python.langchain.com/docs/modules/agents/agent_types/react#using-chat-models).

> Nota: Para ejecutar esta sección, necesitarás tener un [token de SerpAPI](https://serpapi.com/) guardado como una variable de entorno: `SERPAPI_API_KEY`

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

Configurar el agente con un estilo de mensaje `react-json` y acceso a un motor de búsqueda y una calculadora.

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
