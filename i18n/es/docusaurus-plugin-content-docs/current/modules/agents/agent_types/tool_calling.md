---
sidebar_label: Llamada de herramienta
sidebar_position: 0
translated: true
---

# Agente de llamada de herramienta

[Llamada de herramienta](/docs/modules/model_io/chat/function_calling) permite que un modelo detecte cuándo se deben llamar una o más herramientas y responda con las entradas que se deben pasar a esas herramientas. En una llamada a la API, puede describir herramientas y hacer que el modelo elija inteligentemente generar un objeto estructurado como JSON que contenga argumentos para llamar a estas herramientas. El objetivo de las API de herramientas es devolver llamadas de herramientas más confiables y útiles de lo que se puede hacer usando una API de texto genérico o de chat.

Podemos aprovechar esta salida estructurada, combinada con el hecho de que puede vincular varias herramientas a un [modelo de chat de llamada de herramienta](/docs/integrations/chat/) y permitir que el modelo elija cuál llamar, para crear un agente que llame repetidamente a herramientas y reciba resultados hasta que se resuelva una consulta.

Esta es una versión más generalizada del [agente de herramientas de OpenAI](/docs/modules/agents/agent_types/openai_tools/), que fue diseñado para el estilo específico de llamada de herramientas de OpenAI. Utiliza la interfaz ToolCall de LangChain para admitir una gama más amplia de implementaciones de proveedores, como [Anthropic](/docs/integrations/chat/anthropic/), [Google Gemini](/docs/integrations/chat/google_vertex_ai_palm/) y [Mistral](/docs/integrations/chat/mistralai/) además de [OpenAI](/docs/integrations/chat/openai/).

## Configuración

Cualquier modelo que admita la llamada de herramientas se puede usar en este agente. Puede ver qué modelos admiten la llamada de herramientas [aquí](/docs/integrations/chat/)

Esta demostración usa [Tavily](https://app.tavily.com), pero también puede intercambiar cualquier otra [herramienta incorporada](/docs/integrations/tools) o agregar [herramientas personalizadas](/docs/modules/tools/custom_tools/).
Deberá registrarse para obtener una clave API y establecerla como `process.env.TAVILY_API_KEY`.

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
  hideCohere
/>

```python
# | output: false
# | echo: false

from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
```

## Inicializar herramientas

Primero crearemos una herramienta que pueda buscar en la web:

```python
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate

tools = [TavilySearchResults(max_results=1)]
```

## Crear agente

A continuación, inicializaremos nuestro agente de llamada de herramienta:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Make sure to use the tavily_search_results_json tool for information.",
        ),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)

# Construct the Tools agent
agent = create_tool_calling_agent(llm, tools, prompt)
```

## Ejecutar agente

¡Ahora inicializaremos el ejecutor que ejecutará nuestro agente e invocará!

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
agent_executor.invoke({"input": "what is LangChain?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m

/Users/bagatur/langchain/libs/partners/anthropic/langchain_anthropic/chat_models.py:347: UserWarning: stream: Tool use is not yet supported in streaming mode.
  warnings.warn("stream: Tool use is not yet supported in streaming mode.")

[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'LangChain'}`
responded: [{'id': 'toolu_01QxrrT9srzkYCNyEZMDhGeg', 'input': {'query': 'LangChain'}, 'name': 'tavily_search_results_json', 'type': 'tool_use'}]

[0m[36;1m[1;3m[{'url': 'https://github.com/langchain-ai/langchain', 'content': 'About\n⚡ Building applications with LLMs through composability ⚡\nResources\nLicense\nCode of conduct\nSecurity policy\nStars\nWatchers\nForks\nReleases\n291\nPackages\n0\nUsed by 39k\nContributors\n1,848\nLanguages\nFooter\nFooter navigation Latest commit\nGit stats\nFiles\nREADME.md\n🦜️🔗 LangChain\n⚡ Building applications with LLMs through composability ⚡\nLooking for the JS/TS library? ⚡ Building applications with LLMs through composability ⚡\nLicense\nlangchain-ai/langchain\nName already in use\nUse Git or checkout with SVN using the web URL.\n 📖 Documentation\nPlease see here for full documentation, which includes:\n💁 Contributing\nAs an open-source project in a rapidly developing field, we are extremely open to contributions, whether it be in the form of a new feature, improved infrastructure, or better documentation.\n What can you build with LangChain?\n❓ Retrieval augmented generation\n💬 Analyzing structured data\n🤖 Chatbots\nAnd much more!'}][0m

/Users/bagatur/langchain/libs/partners/anthropic/langchain_anthropic/chat_models.py:347: UserWarning: stream: Tool use is not yet supported in streaming mode.
  warnings.warn("stream: Tool use is not yet supported in streaming mode.")

[32;1m[1;3mLangChain is an open-source Python library that helps developers build applications with large language models (LLMs) through composability. Some key features of LangChain include:

- Retrieval augmented generation - Allowing LLMs to retrieve and utilize external data sources when generating outputs.

- Analyzing structured data - Tools for working with structured data like databases, APIs, PDFs, etc. and allowing LLMs to reason over this data.

- Building chatbots and agents - Frameworks for building conversational AI applications.

- Composability - LangChain allows you to chain together different LLM capabilities and data sources in a modular and reusable way.

The library aims to make it easier to build real-world applications that leverage the power of large language models in a scalable and robust way. It provides abstractions and primitives for working with LLMs from different providers like OpenAI, Anthropic, Cohere, etc. LangChain is open-source and has an active community contributing new features and improvements.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is LangChain?',
 'output': 'LangChain is an open-source Python library that helps developers build applications with large language models (LLMs) through composability. Some key features of LangChain include:\n\n- Retrieval augmented generation - Allowing LLMs to retrieve and utilize external data sources when generating outputs.\n\n- Analyzing structured data - Tools for working with structured data like databases, APIs, PDFs, etc. and allowing LLMs to reason over this data.\n\n- Building chatbots and agents - Frameworks for building conversational AI applications.\n\n- Composability - LangChain allows you to chain together different LLM capabilities and data sources in a modular and reusable way.\n\nThe library aims to make it easier to build real-world applications that leverage the power of large language models in a scalable and robust way. It provides abstractions and primitives for working with LLMs from different providers like OpenAI, Anthropic, Cohere, etc. LangChain is open-source and has an active community contributing new features and improvements.'}
```

:::tip
[Traza de LangSmith](https://smith.langchain.com/public/2f956a2e-0820-47c4-a798-c83f024e5ca1/r)
:::

## Usar con historial de chat

Este tipo de agente puede opcionalmente tomar mensajes de chat que representen turnos de conversación anteriores. Puede usar ese historial previo para responder de manera conversacional. Para más detalles, consulte [esta sección del inicio rápido del agente](/docs/modules/agents/quick_start#adding-in-memory).

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

/Users/bagatur/langchain/libs/partners/anthropic/langchain_anthropic/chat_models.py:347: UserWarning: stream: Tool use is not yet supported in streaming mode.
  warnings.warn("stream: Tool use is not yet supported in streaming mode.")

[32;1m[1;3mBased on what you told me, your name is Bob. I don't need to use any tools to look that up since you directly provided your name.[0m

[1m> Finished chain.[0m
```

```output
{'input': "what's my name? Don't use tools to look this up unless you NEED to",
 'chat_history': [HumanMessage(content='hi! my name is bob'),
  AIMessage(content='Hello Bob! How can I assist you today?')],
 'output': "Based on what you told me, your name is Bob. I don't need to use any tools to look that up since you directly provided your name."}
```

:::tip
[Traza de LangSmith](https://smith.langchain.com/public/e21ececb-2e60-49e5-9f06-a91b0fb11fb8/r)
:::
