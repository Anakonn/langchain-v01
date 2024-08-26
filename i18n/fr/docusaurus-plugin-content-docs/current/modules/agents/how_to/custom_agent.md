---
sidebar_position: 0
translated: true
---

# Agent personnalisé

Ce cahier de notes explique comment créer votre propre agent personnalisé.

Dans cet exemple, nous utiliserons OpenAI Tool Calling pour créer cet agent.
**C'est généralement le moyen le plus fiable de créer des agents.**

Nous le créerons d'abord SANS mémoire, puis nous montrerons comment y ajouter de la mémoire.
La mémoire est nécessaire pour permettre la conversation.

## Charger le modèle de langage

Tout d'abord, chargeons le modèle de langage que nous allons utiliser pour contrôler l'agent.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

## Définir les outils

Ensuite, définissons quelques outils à utiliser.
Écrivons une fonction Python très simple pour calculer la longueur d'un mot qui lui est passé.

Notez que la docstring de la fonction que nous utilisons est assez importante ici. Lisez-en plus sur les raisons [ici](/docs/modules/tools/custom_tools)

```python
from langchain.agents import tool


@tool
def get_word_length(word: str) -> int:
    """Returns the length of a word."""
    return len(word)


get_word_length.invoke("abc")
```

```output
3
```

```python
tools = [get_word_length]
```

## Créer l'invite

Maintenant, créons l'invite.
Comme OpenAI Function Calling est affiné pour l'utilisation d'outils, nous n'avons presque pas besoin d'instructions sur la façon de raisonner ou de formater la sortie.
Nous n'aurons que deux variables d'entrée : `input` et `agent_scratchpad`. `input` doit être une chaîne contenant l'objectif de l'utilisateur. `agent_scratchpad` doit être une séquence de messages contenant les invocations d'outils précédentes de l'agent et les sorties d'outils correspondantes.

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are very powerful assistant, but don't know current events",
        ),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

## Lier les outils au modèle de langage

Comment l'agent sait-il quels outils il peut utiliser ?

Dans ce cas, nous nous appuyons sur les modèles de langage OpenAI Tool Calling, qui prennent les outils comme argument séparé et ont été spécifiquement entraînés à savoir quand invoquer ces outils.

Pour passer nos outils à l'agent, nous n'avons qu'à les formater selon le [format d'outil OpenAI](https://platform.openai.com/docs/api-reference/chat/create) et à les transmettre à notre modèle. (En "liant" les fonctions, nous nous assurons qu'elles sont passées à chaque fois que le modèle est invoqué.)

```python
llm_with_tools = llm.bind_tools(tools)
```

## Créer l'agent

En rassemblant ces éléments, nous pouvons maintenant créer l'agent.
Nous importerons deux dernières fonctions utilitaires : un composant pour formater les étapes intermédiaires (paires d'actions d'agent, de sorties d'outils) en messages d'entrée qui peuvent être envoyés au modèle, et un composant pour convertir le message de sortie en une action/fin d'agent.

```python
from langchain.agents.format_scratchpad.openai_tools import (
    format_to_openai_tool_messages,
)
from langchain.agents.output_parsers.openai_tools import OpenAIToolsAgentOutputParser

agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_to_openai_tool_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm_with_tools
    | OpenAIToolsAgentOutputParser()
)
```

```python
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
list(agent_executor.stream({"input": "How many letters in the word eudca"}))
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `get_word_length` with `{'word': 'eudca'}`


[0m[36;1m[1;3m5[0m[32;1m[1;3mThere are 5 letters in the word "eudca".[0m

[1m> Finished chain.[0m
```

```output
[{'actions': [OpenAIToolAgentAction(tool='get_word_length', tool_input={'word': 'eudca'}, log="\nInvoking: `get_word_length` with `{'word': 'eudca'}`\n\n\n", message_log=[AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_A07D5TuyqcNIL0DIEVRPpZkg', 'function': {'arguments': '{\n  "word": "eudca"\n}', 'name': 'get_word_length'}, 'type': 'function'}]})], tool_call_id='call_A07D5TuyqcNIL0DIEVRPpZkg')],
  'messages': [AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_A07D5TuyqcNIL0DIEVRPpZkg', 'function': {'arguments': '{\n  "word": "eudca"\n}', 'name': 'get_word_length'}, 'type': 'function'}]})]},
 {'steps': [AgentStep(action=OpenAIToolAgentAction(tool='get_word_length', tool_input={'word': 'eudca'}, log="\nInvoking: `get_word_length` with `{'word': 'eudca'}`\n\n\n", message_log=[AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_A07D5TuyqcNIL0DIEVRPpZkg', 'function': {'arguments': '{\n  "word": "eudca"\n}', 'name': 'get_word_length'}, 'type': 'function'}]})], tool_call_id='call_A07D5TuyqcNIL0DIEVRPpZkg'), observation=5)],
  'messages': [FunctionMessage(content='5', name='get_word_length')]},
 {'output': 'There are 5 letters in the word "eudca".',
  'messages': [AIMessage(content='There are 5 letters in the word "eudca".')]}]
```

Si nous comparons cela au modèle de langage de base, nous pouvons voir que le modèle de langage seul a du mal

```python
llm.invoke("How many letters in the word educa")
```

```output
AIMessage(content='There are 6 letters in the word "educa".')
```

## Ajouter de la mémoire

C'est génial - nous avons un agent !
Cependant, cet agent est sans état - il ne se souvient de rien des interactions précédentes.
Cela signifie que vous ne pouvez pas facilement poser de questions de suivi.
Corrigeons cela en ajoutant de la mémoire.

Pour ce faire, nous devons faire deux choses :

1. Ajouter un emplacement pour les variables de mémoire dans l'invite
2. Garder une trace de l'historique de la conversation

Tout d'abord, ajoutons un emplacement pour la mémoire dans l'invite.
Nous faisons cela en ajoutant un espace réservé pour les messages avec la clé `"chat_history"`.
Notez que nous le plaçons AU-DESSUS de la nouvelle entrée utilisateur (pour suivre le flux de la conversation).

```python
from langchain_core.prompts import MessagesPlaceholder

MEMORY_KEY = "chat_history"
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are very powerful assistant, but bad at calculating lengths of words.",
        ),
        MessagesPlaceholder(variable_name=MEMORY_KEY),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

Nous pouvons ensuite configurer une liste pour suivre l'historique de la conversation

```python
from langchain_core.messages import AIMessage, HumanMessage

chat_history = []
```

Nous pouvons alors tout rassembler !

```python
agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_to_openai_tool_messages(
            x["intermediate_steps"]
        ),
        "chat_history": lambda x: x["chat_history"],
    }
    | prompt
    | llm_with_tools
    | OpenAIToolsAgentOutputParser()
)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

Lors de l'exécution, nous devons maintenant suivre les entrées et les sorties en tant qu'historique de la conversation

```python
input1 = "how many letters in the word educa?"
result = agent_executor.invoke({"input": input1, "chat_history": chat_history})
chat_history.extend(
    [
        HumanMessage(content=input1),
        AIMessage(content=result["output"]),
    ]
)
agent_executor.invoke({"input": "is that a real word?", "chat_history": chat_history})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `get_word_length` with `{'word': 'educa'}`


[0m[36;1m[1;3m5[0m[32;1m[1;3mThere are 5 letters in the word "educa".[0m

[1m> Finished chain.[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mNo, "educa" is not a real word in English.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'is that a real word?',
 'chat_history': [HumanMessage(content='how many letters in the word educa?'),
  AIMessage(content='There are 5 letters in the word "educa".')],
 'output': 'No, "educa" is not a real word in English.'}
```
