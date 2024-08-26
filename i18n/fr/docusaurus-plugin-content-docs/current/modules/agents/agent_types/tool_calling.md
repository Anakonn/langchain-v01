---
sidebar_label: Appel d'outils
sidebar_position: 0
translated: true
---

# Agent d'appel d'outils

[L'appel d'outils](/docs/modules/model_io/chat/function_calling) permet à un modèle de détecter quand un ou plusieurs outils doivent être appelés et de répondre avec les entrées qui doivent être transmises à ces outils. Dans un appel d'API, vous pouvez décrire des outils et faire en sorte que le modèle choisisse intelligemment de produire un objet structuré comme du JSON contenant les arguments pour appeler ces outils. L'objectif des API d'outils est de retourner des appels d'outils plus fiables et plus utiles que ce qui peut être fait avec une API de complétion de texte générique ou de chat.

Nous pouvons tirer parti de cette sortie structurée, combinée au fait que vous pouvez lier plusieurs outils à un [modèle de chat d'appel d'outils](/docs/integrations/chat/) et permettre au modèle de choisir lequel appeler, pour créer un agent qui appelle à plusieurs reprises des outils et reçoit des résultats jusqu'à ce qu'une requête soit résolue.

Il s'agit d'une version plus généralisée de l'[agent d'outils OpenAI](/docs/modules/agents/agent_types/openai_tools/), qui a été conçu pour le style spécifique d'appel d'outils d'OpenAI. Il utilise l'interface ToolCall de LangChain pour prendre en charge une gamme plus large d'implémentations de fournisseurs, comme [Anthropic](/docs/integrations/chat/anthropic/), [Google Gemini](/docs/integrations/chat/google_vertex_ai_palm/) et [Mistral](/docs/integrations/chat/mistralai/) en plus d'[OpenAI](/docs/integrations/chat/openai/).

## Configuration

Tous les modèles qui prennent en charge l'appel d'outils peuvent être utilisés dans cet agent. Vous pouvez voir quels modèles prennent en charge l'appel d'outils [ici](/docs/integrations/chat/)

Cette démonstration utilise [Tavily](https://app.tavily.com), mais vous pouvez également remplacer par n'importe quel autre [outil intégré](/docs/integrations/tools) ou ajouter des [outils personnalisés](/docs/modules/tools/custom_tools/). 
Vous devrez vous inscrire pour obtenir une clé d'API et la définir comme `process.env.TAVILY_API_KEY`.

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

## Initialiser les outils

Nous allons d'abord créer un outil qui peut effectuer des recherches sur le web :

```python
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate

tools = [TavilySearchResults(max_results=1)]
```

## Créer l'agent

Ensuite, initialisons notre agent d'appel d'outils :

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

## Exécuter l'agent

Maintenant, initialisons l'exécuteur qui exécutera notre agent et invoquons-le !

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
[Trace LangSmith](https://smith.langchain.com/public/2f956a2e-0820-47c4-a798-c83f024e5ca1/r)
:::

## Utilisation avec l'historique du chat

Ce type d'agent peut éventuellement prendre en compte les messages de chat représentant les tours de conversation précédents. Il peut utiliser cette histoire précédente pour répondre de manière conversationnelle. Pour plus de détails, consultez [cette section du démarrage rapide de l'agent](/docs/modules/agents/quick_start#adding-in-memory).

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
[Trace LangSmith](https://smith.langchain.com/public/e21ececb-2e60-49e5-9f06-a91b0fb11fb8/r)
:::
