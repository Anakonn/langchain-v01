---
sidebar_position: 0.1
translated: true
---

# Outils OpenAI

Les modèles OpenAI les plus récents ont été affinés pour détecter quand une ou plusieurs fonctions doivent être appelées et répondre avec les entrées qui doivent être transmises à la ou aux fonction(s). Dans un appel d'API, vous pouvez décrire des fonctions et le modèle choisira intelligemment de renvoyer un objet JSON contenant les arguments pour appeler ces fonctions. L'objectif des API d'outils OpenAI est de renvoyer de manière plus fiable des appels de fonction valides et utiles que ce qui peut être fait en utilisant une API de complétion de texte générique ou de chat.

OpenAI a qualifié la capacité d'invoquer une seule fonction de "fonctions", et la capacité d'invoquer une ou plusieurs fonctions de "outils".

:::tip

Dans l'API OpenAI Chat, les "fonctions" sont désormais considérées comme une option obsolète qui est dépréciée au profit des "outils".

Si vous créez des agents à l'aide de modèles OpenAI, vous devriez utiliser cet agent OpenAI Tools plutôt que l'agent OpenAI functions.

L'utilisation des "outils" permet au modèle de demander que plusieurs fonctions soient appelées lorsque cela est approprié.

Dans certaines situations, cela peut aider à réduire considérablement le temps nécessaire à un agent pour atteindre son objectif.

Voir

* [Création de chat OpenAI](https://platform.openai.com/docs/api-reference/chat/create)
* [Appel de fonction OpenAI](https://platform.openai.com/docs/guides/function-calling)

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

## Initialiser les outils

Pour cet agent, donnons-lui la capacité de rechercher sur le web avec Tavily.

```python
tools = [TavilySearchResults(max_results=1)]
```

## Créer un agent

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

## Exécuter l'agent

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

## Utilisation avec l'historique du chat

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
