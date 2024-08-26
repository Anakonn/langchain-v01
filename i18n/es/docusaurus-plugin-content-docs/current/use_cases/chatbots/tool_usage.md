---
sidebar_position: 3
translated: true
---

# Uso de herramientas

Esta sección cubrirá cómo crear agentes conversacionales: chatbots que pueden interactuar con otros sistemas y APIs utilizando herramientas.

Antes de leer esta guía, le recomendamos que lea tanto [el inicio rápido de chatbot](/docs/use_cases/chatbots/quickstart) en esta sección como que esté familiarizado con [la documentación sobre agentes](/docs/modules/agents/).

## Configuración

Para esta guía, utilizaremos un [agente de herramientas de OpenAI](/docs/modules/agents/agent_types/openai_tools) con una sola herramienta para buscar en la web. El valor predeterminado será alimentado por [Tavily](/docs/integrations/tools/tavily_search), pero puede cambiarlo por cualquier herramienta similar. El resto de esta sección asumirá que está utilizando Tavily.

Deberá [registrarse en una cuenta](https://tavily.com/) en el sitio web de Tavily e instalar los siguientes paquetes:

```python
%pip install --upgrade --quiet langchain-openai tavily-python

# Set env var OPENAI_API_KEY or load from a .env file:
import dotenv

dotenv.load_dotenv()
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```output
True
```

También necesitará establecer su clave de OpenAI como `OPENAI_API_KEY` y su clave de API de Tavily como `TAVILY_API_KEY`.

## Creación de un agente

Nuestro objetivo final es crear un agente que pueda responder conversacionalmente a las preguntas de los usuarios mientras busca información según sea necesario.

Primero, inicialicemos Tavily y un modelo de chat de OpenAI capaz de llamar a herramientas:

```python
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI

tools = [TavilySearchResults(max_results=1)]

# Choose the LLM that will drive the agent
# Only certain models support this
chat = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0)
```

Para que nuestro agente sea conversacional, también debemos elegir un mensaje con un marcador de posición para nuestro historial de chat. Aquí hay un ejemplo:

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# Adapted from https://smith.langchain.com/hub/hwchase17/openai-tools-agent
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. You may not need to use tools for every query - the user may just want to chat!",
        ),
        MessagesPlaceholder(variable_name="messages"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

¡Genial! Ahora armemos nuestro agente:

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent

agent = create_openai_tools_agent(chat, tools, prompt)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## Ejecutar el agente

Ahora que hemos configurado nuestro agente, ¡intentemos interactuar con él! Puede manejar consultas triviales que no requieren ninguna búsqueda:

```python
from langchain_core.messages import HumanMessage

agent_executor.invoke({"messages": [HumanMessage(content="I'm Nemo!")]})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHello Nemo! It's great to meet you. How can I assist you today?[0m

[1m> Finished chain.[0m
```

```output
{'messages': [HumanMessage(content="I'm Nemo!")],
 'output': "Hello Nemo! It's great to meet you. How can I assist you today?"}
```

O puede usar la herramienta de búsqueda proporcionada para obtener información actualizada si es necesario:

```python
agent_executor.invoke(
    {
        "messages": [
            HumanMessage(
                content="What is the current conservation status of the Great Barrier Reef?"
            )
        ],
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'current conservation status of the Great Barrier Reef'}`


[0m[36;1m[1;3m[{'url': 'https://www.barrierreef.org/news/blog/this-is-the-critical-decade-for-coral-reef-survival', 'content': "global coral reef conservation.  © 2024 Great Barrier Reef Foundation. Website by bigfish.tv  #Related News · 29 January 2024 290m more baby corals to help restore and protect the Great Barrier Reef  Great Barrier Reef Foundation Managing Director Anna Marsden says it’s not too late if we act now.The Status of Coral Reefs of the World: 2020 report is the largest analysis of global coral reef health ever undertaken. It found that 14 per cent of the world's coral has been lost since 2009. The report also noted, however, that some of these corals recovered during the 10 years to 2019."}][0m[32;1m[1;3mThe current conservation status of the Great Barrier Reef is a critical concern. According to the Great Barrier Reef Foundation, the Status of Coral Reefs of the World: 2020 report found that 14% of the world's coral has been lost since 2009. However, the report also noted that some of these corals recovered during the 10 years to 2019. For more information, you can visit the following link: [Great Barrier Reef Foundation - Conservation Status](https://www.barrierreef.org/news/blog/this-is-the-critical-decade-for-coral-reef-survival)[0m

[1m> Finished chain.[0m
```

```output
{'messages': [HumanMessage(content='What is the current conservation status of the Great Barrier Reef?')],
 'output': "The current conservation status of the Great Barrier Reef is a critical concern. According to the Great Barrier Reef Foundation, the Status of Coral Reefs of the World: 2020 report found that 14% of the world's coral has been lost since 2009. However, the report also noted that some of these corals recovered during the 10 years to 2019. For more information, you can visit the following link: [Great Barrier Reef Foundation - Conservation Status](https://www.barrierreef.org/news/blog/this-is-the-critical-decade-for-coral-reef-survival)"}
```

## Respuestas conversacionales

Debido a que nuestro mensaje contiene un marcador de posición para los mensajes del historial de chat, nuestro agente también puede tener en cuenta las interacciones anteriores y responder de manera conversacional como un chatbot estándar:

```python
from langchain_core.messages import AIMessage, HumanMessage

agent_executor.invoke(
    {
        "messages": [
            HumanMessage(content="I'm Nemo!"),
            AIMessage(content="Hello Nemo! How can I assist you today?"),
            HumanMessage(content="What is my name?"),
        ],
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mYour name is Nemo![0m

[1m> Finished chain.[0m
```

```output
{'messages': [HumanMessage(content="I'm Nemo!"),
  AIMessage(content='Hello Nemo! How can I assist you today?'),
  HumanMessage(content='What is my name?')],
 'output': 'Your name is Nemo!'}
```

Si lo prefiere, también puede envolver el ejecutor del agente en una clase `RunnableWithMessageHistory` para administrar internamente los mensajes del historial. Primero, debemos modificar ligeramente el mensaje para que tome una variable de entrada separada para que el wrapper pueda analizar qué valor de entrada almacenar como historial:

```python
# Adapted from https://smith.langchain.com/hub/hwchase17/openai-tools-agent
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. You may not need to use tools for every query - the user may just want to chat!",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)

agent = create_openai_tools_agent(chat, tools, prompt)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

Luego, debido a que nuestro ejecutor de agentes tiene múltiples salidas, también debemos establecer la propiedad `output_messages_key` al inicializar el wrapper:

```python
from langchain.memory import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

demo_ephemeral_chat_history_for_chain = ChatMessageHistory()

conversational_agent_executor = RunnableWithMessageHistory(
    agent_executor,
    lambda session_id: demo_ephemeral_chat_history_for_chain,
    input_messages_key="input",
    output_messages_key="output",
    history_messages_key="chat_history",
)
```

```python
conversational_agent_executor.invoke(
    {
        "input": "I'm Nemo!",
    },
    {"configurable": {"session_id": "unused"}},
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHi Nemo! It's great to meet you. How can I assist you today?[0m

[1m> Finished chain.[0m
```

```output
{'input': "I'm Nemo!",
 'chat_history': [],
 'output': "Hi Nemo! It's great to meet you. How can I assist you today?"}
```

```python
conversational_agent_executor.invoke(
    {
        "input": "What is my name?",
    },
    {"configurable": {"session_id": "unused"}},
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mYour name is Nemo! How can I assist you today, Nemo?[0m

[1m> Finished chain.[0m
```

```output
{'input': 'What is my name?',
 'chat_history': [HumanMessage(content="I'm Nemo!"),
  AIMessage(content="Hi Nemo! It's great to meet you. How can I assist you today?")],
 'output': 'Your name is Nemo! How can I assist you today, Nemo?'}
```

## Lectura adicional

Otros tipos de agentes también pueden admitir respuestas conversacionales. Para obtener más información, consulte la [sección de agentes](/docs/modules/agents).

Para obtener más información sobre el uso de herramientas, también puede consultar [esta sección de casos de uso](/docs/use_cases/tool_use/).
