---
sidebar_position: 1
translated: true
---

# Fonctions OpenAI

:::caution

L'API OpenAI a déprécié les `functions` au profit des `tools`. La différence entre les deux est que l'API `tools` permet au modèle de demander que plusieurs fonctions soient invoquées en même temps, ce qui peut réduire les temps de réponse dans certaines architectures. Il est recommandé d'utiliser l'agent tools pour les modèles OpenAI.

Voir les liens suivants pour plus d'informations :

[OpenAI Tools](/docs/modules/agents/agent_types/openai_tools/)

[Création de chat OpenAI](https://platform.openai.com/docs/api-reference/chat/create)

[Appel de fonction OpenAI](https://platform.openai.com/docs/guides/function-calling)
:::

Certains modèles OpenAI (comme gpt-3.5-turbo-0613 et gpt-4-0613) ont été affinés pour détecter quand une fonction doit être appelée et répondre avec les entrées qui doivent être passées à la fonction. Dans un appel d'API, vous pouvez décrire des fonctions et demander au modèle de choisir intelligemment de renvoyer un objet JSON contenant les arguments pour appeler ces fonctions. L'objectif des API de fonction OpenAI est de renvoyer de manière plus fiable des appels de fonction valides et utiles qu'une API de complétion de texte générique ou de chat.

Un certain nombre de modèles open source ont adopté le même format pour les appels de fonction et ont également affiné le modèle pour détecter quand une fonction doit être appelée.

L'agent de fonctions OpenAI est conçu pour fonctionner avec ces modèles.

Installez les packages `openai` et `tavily-python` qui sont requis car les packages LangChain les appellent en interne.

:::tip
Le format `functions` reste pertinent pour les modèles et fournisseurs open source qui l'ont adopté, et cet agent devrait fonctionner pour ces modèles.
:::

```python
%pip install --upgrade --quiet  langchain-openai tavily-python
```

## Initialiser les outils

Nous allons d'abord créer quelques outils que nous pourrons utiliser

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI
```

```python
tools = [TavilySearchResults(max_results=1)]
```

## Créer un agent

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


[0m[36;1m[1;3m[{'url': 'https://www.ibm.com/topics/langchain', 'content': 'LangChain is essentially a library of abstractions for Python and Javascript, representing common steps and concepts  LangChain is an open source orchestration framework for the development of applications using large language models  other LangChain features, like the eponymous chains.  LangChain provides integrations for over 25 different embedding methods, as well as for over 50 different vector storesLangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. It supports Python and Javascript languages and supports various LLM providers, including OpenAI, Google, and IBM.'}][0m[32;1m[1;3mLangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. LangChain provides integrations for over 25 different embedding methods and for over 50 different vector stores. It is essentially a library of abstractions for Python and JavaScript, representing common steps and concepts. LangChain supports Python and JavaScript languages and various LLM providers, including OpenAI, Google, and IBM. You can find more information about LangChain [here](https://www.ibm.com/topics/langchain).[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is LangChain?',
 'output': 'LangChain is a tool for building applications using large language models (LLMs) like chatbots and virtual agents. It simplifies the process of programming and integration with external data sources and software workflows. LangChain provides integrations for over 25 different embedding methods and for over 50 different vector stores. It is essentially a library of abstractions for Python and JavaScript, representing common steps and concepts. LangChain supports Python and JavaScript languages and various LLM providers, including OpenAI, Google, and IBM. You can find more information about LangChain [here](https://www.ibm.com/topics/langchain).'}
```

## Utiliser avec l'historique du chat

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
