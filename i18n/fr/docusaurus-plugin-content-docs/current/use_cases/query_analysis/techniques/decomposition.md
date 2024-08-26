---
sidebar_position: 1
translated: true
---

# Décomposition

Lorsqu'un utilisateur pose une question, rien ne garantit que les résultats pertinents puissent être renvoyés avec une seule requête. Parfois, pour répondre à une question, nous devons la diviser en sous-questions distinctes, récupérer les résultats pour chaque sous-question, puis répondre en utilisant le contexte cumulé.

Par exemple, si un utilisateur demande : "En quoi Web Voyager est-il différent des agents de réflexion", et que nous avons un document qui explique Web Voyager et un autre qui explique les agents de réflexion, mais aucun document qui les compare, nous obtiendrions probablement de meilleurs résultats en récupérant à la fois "Qu'est-ce que Web Voyager" et "Qu'est-ce que les agents de réflexion" et en combinant les documents récupérés plutôt qu'en récupérant directement à partir de la question de l'utilisateur.

Ce processus de division d'une entrée en plusieurs sous-requêtes distinctes est ce que nous appelons la **décomposition de requête**. On parle aussi parfois de génération de sous-requêtes. Dans ce guide, nous allons parcourir un exemple de la façon de procéder à une décomposition, en utilisant notre exemple de chatbot Q&A sur les vidéos YouTube de LangChain à partir du [Démarrage rapide](/docs/use_cases/query_analysis/quickstart).

## Configuration

#### Installer les dépendances

```python
# %pip install -qU langchain langchain-openai
```

#### Définir les variables d'environnement

Nous utiliserons OpenAI dans cet exemple :

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Génération de requête

Pour convertir les questions des utilisateurs en une liste de sous-questions, nous utiliserons l'API d'appel de fonction d'OpenAI, qui peut renvoyer plusieurs fonctions à chaque tour :

```python
import datetime
from typing import Literal, Optional, Tuple

from langchain_core.pydantic_v1 import BaseModel, Field


class SubQuery(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    sub_query: str = Field(
        ...,
        description="A very specific query against the database.",
    )
```

```python
from langchain.output_parsers import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \

Perform query decomposition. Given a user question, break it down into distinct sub questions that \
you need to answer in order to answer the original question.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
llm_with_tools = llm.bind_tools([SubQuery])
parser = PydanticToolsParser(tools=[SubQuery])
query_analyzer = prompt | llm_with_tools | parser
```

Essayons-le :

```python
query_analyzer.invoke({"question": "how to do rag"})
```

```output
[SubQuery(sub_query='How to do rag')]
```

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
```

```output
[SubQuery(sub_query='How to use multi-modal models in a chain?'),
 SubQuery(sub_query='How to turn a chain into a REST API?')]
```

```python
query_analyzer.invoke(
    {
        "question": "what's the difference between web voyager and reflection agents? do they use langgraph?"
    }
)
```

```output
[SubQuery(sub_query='What is Web Voyager and how does it differ from Reflection Agents?'),
 SubQuery(sub_query='Do Web Voyager and Reflection Agents use Langgraph?')]
```

## Ajout d'exemples et ajustement de l'invite

Cela fonctionne assez bien, mais nous voulons probablement le décomposer davantage pour séparer les requêtes sur Web Voyager et les agents de réflexion. Si nous ne sommes pas sûrs à l'avance des types de requêtes qui fonctionneront le mieux avec notre index, nous pouvons également inclure intentionnellement un certain degré de redondance dans nos requêtes, afin de renvoyer à la fois des sous-requêtes et des requêtes de niveau supérieur.

Pour ajuster les résultats de la génération de requêtes, nous pouvons ajouter quelques exemples de questions d'entrée et de requêtes de référence à notre invite. Nous pouvons également essayer d'améliorer notre message système.

```python
examples = []
```

```python
question = "What's chat langchain, is it a langchain template?"
queries = [
    SubQuery(sub_query="What is chat langchain"),
    SubQuery(sub_query="What is a langchain template"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "How would I use LangGraph to build an automaton"
queries = [
    SubQuery(sub_query="How to build automaton with LangGraph"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "How to build multi-agent system and stream intermediate steps from it"
queries = [
    SubQuery(sub_query="How to build multi-agent system"),
    SubQuery(sub_query="How to stream intermediate steps"),
    SubQuery(sub_query="How to stream intermediate steps from multi-agent system"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "What's the difference between LangChain agents and LangGraph?"
queries = [
    SubQuery(sub_query="What's the difference between LangChain agents and LangGraph?"),
    SubQuery(sub_query="What are LangChain agents"),
    SubQuery(sub_query="What is LangGraph"),
]
examples.append({"input": question, "tool_calls": queries})
```

Maintenant, nous devons mettre à jour notre modèle d'invite et notre chaîne afin que les exemples soient inclus dans chaque invite. Comme nous travaillons avec l'appel de fonction d'OpenAI, nous devrons faire un peu de structuration supplémentaire pour envoyer des exemples d'entrées et de sorties au modèle. Nous créerons une fonction d'assistance `tool_example_to_messages` pour nous en charger :

```python
import uuid
from typing import Dict, List

from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)


def tool_example_to_messages(example: Dict) -> List[BaseMessage]:
    messages: List[BaseMessage] = [HumanMessage(content=example["input"])]
    openai_tool_calls = []
    for tool_call in example["tool_calls"]:
        openai_tool_calls.append(
            {
                "id": str(uuid.uuid4()),
                "type": "function",
                "function": {
                    "name": tool_call.__class__.__name__,
                    "arguments": tool_call.json(),
                },
            }
        )
    messages.append(
        AIMessage(content="", additional_kwargs={"tool_calls": openai_tool_calls})
    )
    tool_outputs = example.get("tool_outputs") or [
        "This is an example of a correct usage of this tool. Make sure to continue using the tool this way."
    ] * len(openai_tool_calls)
    for output, tool_call in zip(tool_outputs, openai_tool_calls):
        messages.append(ToolMessage(content=output, tool_call_id=tool_call["id"]))
    return messages


example_msgs = [msg for ex in examples for msg in tool_example_to_messages(ex)]
```

```python
from langchain_core.prompts import MessagesPlaceholder

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \

Perform query decomposition. Given a user question, break it down into the most specific sub questions you can \
which will help you answer the original question. Each sub question should be about a single concept/fact/idea.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        MessagesPlaceholder("examples", optional=True),
        ("human", "{question}"),
    ]
)
query_analyzer_with_examples = (
    prompt.partial(examples=example_msgs) | llm_with_tools | parser
)
```

```python
query_analyzer_with_examples.invoke(
    {
        "question": "what's the difference between web voyager and reflection agents? do they use langgraph?"
    }
)
```

```output
[SubQuery(sub_query="What's the difference between web voyager and reflection agents"),
 SubQuery(sub_query='Do web voyager and reflection agents use LangGraph'),
 SubQuery(sub_query='What is web voyager'),
 SubQuery(sub_query='What are reflection agents')]
```
