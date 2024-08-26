---
sidebar_position: 1
translated: true
---

# Funciones de OpenAI

:::caution

OpenAI API ha dejado en desuso las `funciones` a favor de los `herramientas`. La diferencia entre los dos es que la API de `herramientas` permite que el modelo solicite que se invoquen varias funciones a la vez, lo que puede reducir los tiempos de respuesta en algunas arquitecturas. Se recomienda utilizar el agente de herramientas para los modelos de OpenAI.

Consulta los siguientes enlaces para obtener más información:

[Herramientas de OpenAI](/docs/modules/agents/agent_types/openai_tools/)

[Crear chat de OpenAI](https://platform.openai.com/docs/api-reference/chat/create)

[Llamada a funciones de OpenAI](https://platform.openai.com/docs/guides/function-calling)
:::

Ciertos modelos de OpenAI (como gpt-3.5-turbo-0613 y gpt-4-0613) se han ajustado para detectar cuándo se debe llamar a una función y responder con los datos que se deben pasar a la función. En una llamada a la API, puedes describir funciones y hacer que el modelo elija inteligentemente generar un objeto JSON que contenga los argumentos para llamar a esas funciones. El objetivo de las API de funciones de OpenAI es devolver llamadas a funciones válidas y útiles de manera más confiable que una API de texto genérico o de chat.

Varios modelos de código abierto han adoptado el mismo formato para las llamadas a funciones y también han ajustado el modelo para detectar cuándo se debe llamar a una función.

El agente de funciones de OpenAI está diseñado para trabajar con estos modelos.

Instala los paquetes `openai` y `tavily-python`, que son necesarios ya que los paquetes de LangChain los llaman internamente.

:::tip
El formato de `funciones` sigue siendo relevante para los modelos y proveedores de código abierto que lo han adoptado, y se espera que este agente funcione para dichos modelos.
:::

```python
%pip install --upgrade --quiet  langchain-openai tavily-python
```

## Inicializar herramientas

Primero crearemos algunas herramientas que podamos utilizar

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI
```

```python
tools = [TavilySearchResults(max_results=1)]
```

## Crear agente

```python
# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-functions-agent")
```

```python
prompt.messages
```

```output
[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template='You are a helpful assistant')),
 MessagesPlaceholder(variable_name='chat_history', optional=True),
 HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}')),
 MessagesPlaceholder(variable_name='agent_scratchpad')]
```

```python
# Choose the LLM that will drive the agent
llm = ChatOpenAI(model="gpt-3.5-turbo-1106")

# Construct the OpenAI Functions agent
agent = create_openai_functions_agent(llm, tools, prompt)
```

## Ejecutar agente

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.invoke({"input": "what is LangChain?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'LangChain'}`


[0m[36;1m[1;3m[{'url': 'https://www.ibm.com/topics/langchain', 'content': 'LangChain is essentially a library of abstractions for Python and Javascript, representing common steps and concepts  LangChain is an open source orchestration framework for the development of applications using large language models  other LangChain features, like the eponymous chains.  LangChain provides integrations for over 25 different embedding methods, as well as for over 50 different vector storesLangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. It supports Python and Javascript languages and supports various LLM providers, including OpenAI, Google, and IBM.'}][0m[32;1m[1;3mLangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. LangChain provides integrations for over 25 different embedding methods and for over 50 different vector stores. It is essentially a library of abstractions for Python and JavaScript, representing common steps and concepts. LangChain supports Python and JavaScript languages and various LLM providers, including OpenAI, Google, and IBM. You can find more information about LangChain [here](https://www.ibm.com/topics/langchain).[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is LangChain?',
 'output': 'LangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. LangChain provides integrations for over 25 different embedding methods and for over 50 different vector stores. It is essentially a library of abstractions for Python and JavaScript, representing common steps and concepts. LangChain supports Python and JavaScript languages and various LLM providers, including OpenAI, Google, and IBM. You can find more information about LangChain [here](https://www.ibm.com/topics/langchain).'}
```

## Usar con el historial de chat

```python
from langchain_core.messages import AIMessage, HumanMessage

agent_executor.invoke(
    {
        "input": "what's my name?",
        "chat_history": [
            HumanMessage(content="hi! my name is bob"),
            AIMessage(content="Hello Bob! How can I assist you today?"),
        ],
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mYour name is Bob.[0m

[1m> Finished chain.[0m
```

```output
{'input': "what's my name?",
 'chat_history': [HumanMessage(content='hi! my name is bob'),
  AIMessage(content='Hello Bob! How can I assist you today?')],
 'output': 'Your name is Bob.'}
```
