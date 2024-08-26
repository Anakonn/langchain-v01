---
sidebar_position: 0.1
translated: true
---

# Herramientas de OpenAI

Los modelos más recientes de OpenAI se han ajustado con precisión para detectar cuándo se debe(n) llamar una o más funciones y responder con los datos que se deben pasar a la(s) función(es). En una llamada a la API, puede describir funciones y hacer que el modelo elija inteligentemente generar un objeto JSON que contenga los argumentos para llamar a estas funciones. El objetivo de las API de herramientas de OpenAI es devolver llamadas de función más confiables y útiles de lo que se puede hacer con una API de texto genérica o de chat.

OpenAI denominó la capacidad de invocar una **sola** función como **funciones**, y la capacidad de invocar **una o más** funciones como **herramientas**.

:::tip

En la API de chat de OpenAI, las **funciones** ahora se consideran una opción heredada que está en desuso a favor de las **herramientas**.

Si está creando agentes utilizando modelos de OpenAI, debe usar este agente de herramientas de OpenAI en lugar del agente de funciones de OpenAI.

El uso de **herramientas** permite que el modelo solicite que se llame a más de una función cuando sea apropiado.

En algunas situaciones, esto puede ayudar a reducir significativamente el tiempo que le toma a un agente lograr su objetivo.

Ver

* [Crear chat de OpenAI](https://platform.openai.com/docs/api-reference/chat/create)
* [Llamada de función de OpenAI](https://platform.openai.com/docs/guides/function-calling)

:::

```python
%pip install --upgrade --quiet  langchain-openai tavily-python
```

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI
```

## Inicializar herramientas

Para este agente, vamos a darle la capacidad de buscar en la web con Tavily.

```python
tools = [TavilySearchResults(max_results=1)]
```

## Crear agente

```python
# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-tools-agent")
```

```python
# Choose the LLM that will drive the agent
# Only certain models support this
llm = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0)

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(llm, tools, prompt)
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


[0m[36;1m[1;3m[{'url': 'https://www.ibm.com/topics/langchain', 'content': 'LangChain is essentially a library of abstractions for Python and Javascript, representing common steps and concepts  LangChain is an open source orchestration framework for the development of applications using large language models  other LangChain features, like the eponymous chains.  LangChain provides integrations for over 25 different embedding methods, as well as for over 50 different vector storesLangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. It supports Python and Javascript languages and supports various LLM providers, including OpenAI, Google, and IBM.'}][0m[32;1m[1;3mLangChain is an open source orchestration framework for the development of applications using large language models. It is essentially a library of abstractions for Python and Javascript, representing common steps and concepts. LangChain simplifies the process of programming and integration with external data sources and software workflows. It supports various large language model providers, including OpenAI, Google, and IBM. You can find more information about LangChain on the IBM website: [LangChain - IBM](https://www.ibm.com/topics/langchain)[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is LangChain?',
 'output': 'LangChain is an open source orchestration framework for the development of applications using large language models. It is essentially a library of abstractions for Python and Javascript, representing common steps and concepts. LangChain simplifies the process of programming and integration with external data sources and software workflows. It supports various large language model providers, including OpenAI, Google, and IBM. You can find more information about LangChain on the IBM website: [LangChain - IBM](https://www.ibm.com/topics/langchain)'}
```

## Usar con historial de chat

```python
from langchain_core.messages import AIMessage, HumanMessage

agent_executor.invoke(
    {
        "input": "what's my name? Don't use tools to look this up unless you NEED to",
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
{'input': "what's my name? Don't use tools to look this up unless you NEED to",
 'chat_history': [HumanMessage(content='hi! my name is bob'),
  AIMessage(content='Hello Bob! How can I assist you today?')],
 'output': 'Your name is Bob.'}
```
