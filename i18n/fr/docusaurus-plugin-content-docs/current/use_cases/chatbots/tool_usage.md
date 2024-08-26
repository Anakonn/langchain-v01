---
sidebar_position: 3
translated: true
---

# Utilisation des outils

Cette section couvrira comment créer des agents conversationnels : des chatbots qui peuvent interagir avec d'autres systèmes et APIs à l'aide d'outils.

Avant de lire ce guide, nous vous recommandons de lire à la fois [le démarrage rapide des chatbots](/docs/use_cases/chatbots/quickstart) dans cette section et de vous familiariser avec [la documentation sur les agents](/docs/modules/agents/).

## Configuration

Pour ce guide, nous utiliserons un [agent à outils OpenAI](/docs/modules/agents/agent_types/openai_tools) avec un seul outil pour rechercher sur le web. La valeur par défaut sera alimentée par [Tavily](/docs/integrations/tools/tavily_search), mais vous pouvez le remplacer par un outil similaire. Le reste de cette section supposera que vous utilisez Tavily.

Vous devrez vous [inscrire à un compte](https://tavily.com/) sur le site Web de Tavily et installer les packages suivants :

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

Vous aurez également besoin de votre clé OpenAI définie comme `OPENAI_API_KEY` et de votre clé API Tavily définie comme `TAVILY_API_KEY`.

## Création d'un agent

Notre objectif final est de créer un agent qui puisse répondre de manière conversationnelle aux questions des utilisateurs tout en recherchant des informations au besoin.

Commençons par initialiser Tavily et un modèle de chat OpenAI capable d'appeler des outils :

```python
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI

tools = [TavilySearchResults(max_results=1)]

# Choose the LLM that will drive the agent
# Only certain models support this
chat = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0)
```

Pour rendre notre agent conversationnel, nous devons également choisir une invite avec un espace réservé pour notre historique de discussion. Voici un exemple :

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

Très bien ! Maintenant, assemblons notre agent :

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent

agent = create_openai_tools_agent(chat, tools, prompt)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## Exécution de l'agent

Maintenant que nous avons configuré notre agent, essayons d'interagir avec lui ! Il peut gérer à la fois les requêtes triviales qui ne nécessitent aucune recherche :

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

Ou il peut utiliser l'outil de recherche passé pour obtenir des informations à jour si nécessaire :

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

## Réponses conversationnelles

Comme notre invite contient un espace réservé pour les messages de l'historique de discussion, notre agent peut également prendre en compte les interactions précédentes et répondre de manière conversationnelle comme un chatbot standard :

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

Si vous le préférez, vous pouvez également envelopper l'exécuteur d'agent dans une classe `RunnableWithMessageHistory` pour gérer les messages d'historique en interne. Tout d'abord, nous devons légèrement modifier l'invite pour prendre une variable d'entrée séparée afin que l'enveloppe puisse analyser quelle valeur d'entrée à stocker dans l'historique :

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

Ensuite, comme notre exécuteur d'agent a plusieurs sorties, nous devons également définir la propriété `output_messages_key` lors de l'initialisation de l'enveloppe :

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

## Lectures complémentaires

D'autres types d'agents peuvent également prendre en charge les réponses conversationnelles - pour en savoir plus, consultez la [section agents](/docs/modules/agents).

Pour plus d'informations sur l'utilisation des outils, vous pouvez également consulter [cette section sur les cas d'utilisation](/docs/use_cases/tool_use/).
