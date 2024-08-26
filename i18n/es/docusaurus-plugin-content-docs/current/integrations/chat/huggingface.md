---
translated: true
---

# Hugging Face

Este cuaderno muestra cómo empezar a usar los LLM de `Hugging Face` como modelos de chat.

En particular, haremos:
1. Utilizar las integraciones [HuggingFaceTextGenInference](https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/llms/huggingface_text_gen_inference.py), [HuggingFaceEndpoint](https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/llms/huggingface_endpoint.py) o [HuggingFaceHub](https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/llms/huggingface_hub.py) para instanciar un `LLM`.
2. Utilizar la clase `ChatHuggingFace` para permitir que cualquiera de estos LLM se integre con la abstracción de [Mensajes de chat](/docs/modules/model_io/chat/#messages) de LangChain.
3. Demostrar cómo usar un LLM de código abierto para alimentar una canalización `ChatAgent`

> Nota: Para empezar, necesitarás tener un [token de acceso a Hugging Face](https://huggingface.co/docs/hub/security-tokens) guardado como una variable de entorno: `HUGGINGFACEHUB_API_TOKEN`.

```python
%pip install --upgrade --quiet  text-generation transformers google-search-results numexpr langchainhub sentencepiece jinja2
```

```output
[0mNote: you may need to restart the kernel to use updated packages.
```

## 1. Instanciar un LLM

Hay tres opciones de LLM para elegir.

### `HuggingFaceTextGenInference`

```python
import os

from langchain_community.llms import HuggingFaceTextGenInference

ENDPOINT_URL = "<YOUR_ENDPOINT_URL_HERE>"
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

llm = HuggingFaceTextGenInference(
    inference_server_url=ENDPOINT_URL,
    max_new_tokens=512,
    top_k=50,
    temperature=0.1,
    repetition_penalty=1.03,
    server_kwargs={
        "headers": {
            "Authorization": f"Bearer {HF_TOKEN}",
            "Content-Type": "application/json",
        }
    },
)
```

### `HuggingFaceEndpoint`

```python
from langchain_community.llms import HuggingFaceEndpoint

ENDPOINT_URL = "<YOUR_ENDPOINT_URL_HERE>"
llm = HuggingFaceEndpoint(
    endpoint_url=ENDPOINT_URL,
    task="text-generation",
    model_kwargs={
        "max_new_tokens": 512,
        "top_k": 50,
        "temperature": 0.1,
        "repetition_penalty": 1.03,
    },
)
```

### `HuggingFaceHub`

```python
from langchain_community.llms import HuggingFaceHub

llm = HuggingFaceHub(
    repo_id="HuggingFaceH4/zephyr-7b-beta",
    task="text-generation",
    model_kwargs={
        "max_new_tokens": 512,
        "top_k": 30,
        "temperature": 0.1,
        "repetition_penalty": 1.03,
    },
)
```

```output
/Users/jacoblee/langchain/langchain/libs/langchain/.venv/lib/python3.10/site-packages/huggingface_hub/utils/_deprecation.py:127: FutureWarning: '__init__' (from 'huggingface_hub.inference_api') is deprecated and will be removed from version '1.0'. `InferenceApi` client is deprecated in favor of the more feature-complete `InferenceClient`. Check out this guide to learn how to convert your script to use it: https://huggingface.co/docs/huggingface_hub/guides/inference#legacy-inferenceapi-client.
  warnings.warn(warning_message, FutureWarning)
```

## 2. Instanciar `ChatHuggingFace` para aplicar plantillas de chat

Instanciar el modelo de chat y algunos mensajes para pasar.

```python
from langchain.schema import (
    HumanMessage,
    SystemMessage,
)
from langchain_community.chat_models.huggingface import ChatHuggingFace

messages = [
    SystemMessage(content="You're a helpful assistant"),
    HumanMessage(
        content="What happens when an unstoppable force meets an immovable object?"
    ),
]

chat_model = ChatHuggingFace(llm=llm)
```

```output
WARNING! repo_id is not default parameter.
                    repo_id was transferred to model_kwargs.
                    Please confirm that repo_id is what you intended.
WARNING! task is not default parameter.
                    task was transferred to model_kwargs.
                    Please confirm that task is what you intended.
WARNING! huggingfacehub_api_token is not default parameter.
                    huggingfacehub_api_token was transferred to model_kwargs.
                    Please confirm that huggingfacehub_api_token is what you intended.
None of PyTorch, TensorFlow >= 2.0, or Flax have been found. Models won't be available and only tokenizers, configuration and file/data utilities can be used.
```

Inspeccionar qué modelo y plantilla de chat correspondiente se está utilizando.

```python
chat_model.model_id
```

```output
'HuggingFaceH4/zephyr-7b-beta'
```

Inspeccionar cómo se formatean los mensajes de chat para la llamada al LLM.

```python
chat_model._to_chat_prompt(messages)
```

```output
"<|system|>\nYou're a helpful assistant</s>\n<|user|>\nWhat happens when an unstoppable force meets an immovable object?</s>\n<|assistant|>\n"
```

Llamar al modelo.

```python
res = chat_model.invoke(messages)
print(res.content)
```

```output
According to a popular philosophical paradox, when an unstoppable force meets an immovable object, it is impossible to determine which one will prevail because both are defined as being completely unyielding and unmovable. The paradox suggests that the very concepts of "unstoppable force" and "immovable object" are inherently contradictory, and therefore, it is illogical to imagine a scenario where they would meet and interact. However, in practical terms, it is highly unlikely for such a scenario to occur in the real world, as the concepts of "unstoppable force" and "immovable object" are often used metaphorically to describe hypothetical situations or abstract concepts, rather than physical objects or forces.
```

## 3. ¡Échale un vistazo como un agente!

Aquí probaremos `Zephyr-7B-beta` como un Agente `ReAct` de cero disparos. El ejemplo a continuación se toma de [aquí](/docs/modules/agents/agent_types/react#using-chat-models).

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

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mQuestion: Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?

Thought: I need to use the Search tool to find out who Leo DiCaprio's current girlfriend is. Then, I can use the Calculator tool to raise her current age to the power of 0.43.

Action:
```

{
  "action": "Search",
  "action_input": "leo dicaprio girlfriend"
}

```output
[0m[36;1m[1;3mLeonardo DiCaprio may have found The One in Vittoria Ceretti. “They are in love,” a source exclusively reveals in the latest issue of Us Weekly. “Leo was clearly very proud to be showing Vittoria off and letting everyone see how happy they are together.”[0m[32;1m[1;3mNow that we know Leo DiCaprio's current girlfriend is Vittoria Ceretti, let's find out her current age.

Action:
```

{
  "action": "Search",
  "action_input": "vittoria ceretti age"
}

```output
[0m[36;1m[1;3m25 years[0m[32;1m[1;3mNow that we know Vittoria Ceretti's current age is 25, let's use the Calculator tool to raise it to the power of 0.43.

Action:
```

{
  "action": "Calculator",
  "action_input": "25^0.43"
}

```output
[0m[33;1m[1;3mAnswer: 3.991298452658078[0m[32;1m[1;3mFinal Answer: Vittoria Ceretti, Leo DiCaprio's current girlfriend, when raised to the power of 0.43 is approximately 4.0 rounded to two decimal places. Her current age is 25 years old.[0m

[1m> Finished chain.[0m
```

```output
{'input': "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?",
 'output': "Vittoria Ceretti, Leo DiCaprio's current girlfriend, when raised to the power of 0.43 is approximately 4.0 rounded to two decimal places. Her current age is 25 years old."}
```

¡Bien hecho! Nuestro modelo Zephyr de 7b parámetros de código abierto pudo:

1. Planificar una serie de acciones: `Necesito usar la herramienta de búsqueda para averiguar quién es la novia actual de Leo DiCaprio. Luego, puedo usar la herramienta de calculadora para elevar su edad actual a la potencia de 0.43.`
2. Luego ejecutar una búsqueda usando la herramienta SerpAPI para encontrar quién es la novia actual de Leo DiCaprio
3. Ejecutar otra búsqueda para encontrar su edad
4. Y finalmente usar una herramienta de calculadora para calcular su edad elevada a la potencia de 0.43

Es emocionante ver hasta dónde pueden llegar los LLM de código abierto como agentes de propósito general. ¡Pruébalo tú mismo!
