---
sidebar_position: 1
title: Utiliser des exemples de référence
translated: true
---

La qualité des extractions peut souvent être améliorée en fournissant des exemples de référence au LLM.

:::tip
Bien que ce tutoriel se concentre sur l'utilisation d'exemples avec un modèle appelant un outil, cette technique est généralement applicable et fonctionnera également avec des techniques basées sur JSON ou des invites.
:::

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# Define a custom prompt to provide instructions and any additional context.
# 1) You can add examples into the prompt template to improve extraction quality
# 2) Introduce additional parameters to take context into account (e.g., include metadata
#    about the document from which the text was extracted.)
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert extraction algorithm. "
            "Only extract relevant information from the text. "
            "If you do not know the value of an attribute asked "
            "to extract, return null for the attribute's value.",
        ),
        # ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        MessagesPlaceholder("examples"),  # <-- EXAMPLES!
        # ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
        ("human", "{text}"),
    ]
)
```

Testez le modèle :

```python
from langchain_core.messages import (
    HumanMessage,
)

prompt.invoke(
    {"text": "this is some text", "examples": [HumanMessage(content="testing 1 2 3")]}
)
```

```output
ChatPromptValue(messages=[SystemMessage(content="You are an expert extraction algorithm. Only extract relevant information from the text. If you do not know the value of an attribute asked to extract, return null for the attribute's value."), HumanMessage(content='testing 1 2 3'), HumanMessage(content='this is some text')])
```

## Définir le schéma

Réutilisons le schéma de personne du démarrage rapide.

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI


class Person(BaseModel):
    """Information about a person."""

    # ^ Doc-string for the entity Person.
    # This doc-string is sent to the LLM as the description of the schema Person,
    # and it can help to improve extraction results.

    # Note that:
    # 1. Each field is an `optional` -- this allows the model to decline to extract it!
    # 2. Each field has a `description` -- this description is used by the LLM.
    # Having a good description can help improve extraction results.
    name: Optional[str] = Field(..., description="The name of the person")
    hair_color: Optional[str] = Field(
        ..., description="The color of the peron's eyes if known"
    )
    height_in_meters: Optional[str] = Field(..., description="Height in METERs")


class Data(BaseModel):
    """Extracted data about people."""

    # Creates a model so that we can extract multiple entities.
    people: List[Person]
```

## Définir des exemples de référence

Les exemples peuvent être définis comme une liste de paires entrée-sortie.

Chaque exemple contient un texte `input` d'exemple et un `output` d'exemple montrant ce qui devrait être extrait du texte.

:::important
Ceci est un peu dans les détails, alors n'hésitez pas à l'ignorer si vous ne le comprenez pas !

Le format de l'exemple doit correspondre à l'API utilisée (par exemple, appel d'outil ou mode JSON, etc.).

Ici, les exemples formatés correspondront au format attendu pour l'API d'appel d'outil, car c'est ce que nous utilisons.
:::

```python
import uuid
from typing import Dict, List, TypedDict

from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
from langchain_core.pydantic_v1 import BaseModel, Field


class Example(TypedDict):
    """A representation of an example consisting of text input and expected tool calls.

    For extraction, the tool calls are represented as instances of pydantic model.
    """

    input: str  # This is the example text
    tool_calls: List[BaseModel]  # Instances of pydantic model that should be extracted


def tool_example_to_messages(example: Example) -> List[BaseMessage]:
    """Convert an example into a list of messages that can be fed into an LLM.

    This code is an adapter that converts our example to a list of messages
    that can be fed into a chat model.

    The list of messages per example corresponds to:

    1) HumanMessage: contains the content from which content should be extracted.
    2) AIMessage: contains the extracted information from the model
    3) ToolMessage: contains confirmation to the model that the model requested a tool correctly.

    The ToolMessage is required because some of the chat models are hyper-optimized for agents
    rather than for an extraction use case.
    """
    messages: List[BaseMessage] = [HumanMessage(content=example["input"])]
    openai_tool_calls = []
    for tool_call in example["tool_calls"]:
        openai_tool_calls.append(
            {
                "id": str(uuid.uuid4()),
                "type": "function",
                "function": {
                    # The name of the function right now corresponds
                    # to the name of the pydantic model
                    # This is implicit in the API right now,
                    # and will be improved over time.
                    "name": tool_call.__class__.__name__,
                    "arguments": tool_call.json(),
                },
            }
        )
    messages.append(
        AIMessage(content="", additional_kwargs={"tool_calls": openai_tool_calls})
    )
    tool_outputs = example.get("tool_outputs") or [
        "You have correctly called this tool."
    ] * len(openai_tool_calls)
    for output, tool_call in zip(tool_outputs, openai_tool_calls):
        messages.append(ToolMessage(content=output, tool_call_id=tool_call["id"]))
    return messages
```

Définissons maintenant nos exemples, puis convertissons-les au format de message.

```python
examples = [
    (
        "The ocean is vast and blue. It's more than 20,000 feet deep. There are many fish in it.",
        Person(name=None, height_in_meters=None, hair_color=None),
    ),
    (
        "Fiona traveled far from France to Spain.",
        Person(name="Fiona", height_in_meters=None, hair_color=None),
    ),
]


messages = []

for text, tool_call in examples:
    messages.extend(
        tool_example_to_messages({"input": text, "tool_calls": [tool_call]})
    )
```

Testons l'invite

```python
prompt.invoke({"text": "this is some text", "examples": messages})
```

```output
ChatPromptValue(messages=[SystemMessage(content="You are an expert extraction algorithm. Only extract relevant information from the text. If you do not know the value of an attribute asked to extract, return null for the attribute's value."), HumanMessage(content="The ocean is vast and blue. It's more than 20,000 feet deep. There are many fish in it."), AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'c75e57cc-8212-4959-81e9-9477b0b79126', 'type': 'function', 'function': {'name': 'Person', 'arguments': '{"name": null, "hair_color": null, "height_in_meters": null}'}}]}), ToolMessage(content='You have correctly called this tool.', tool_call_id='c75e57cc-8212-4959-81e9-9477b0b79126'), HumanMessage(content='Fiona traveled far from France to Spain.'), AIMessage(content='', additional_kwargs={'tool_calls': [{'id': '69da50b5-e427-44be-b396-1e56d821c6b0', 'type': 'function', 'function': {'name': 'Person', 'arguments': '{"name": "Fiona", "hair_color": null, "height_in_meters": null}'}}]}), ToolMessage(content='You have correctly called this tool.', tool_call_id='69da50b5-e427-44be-b396-1e56d821c6b0'), HumanMessage(content='this is some text')])
```

## Créer un extracteur

Ici, nous allons créer un extracteur en utilisant **gpt-4**.

```python
# We will be using tool calling mode, which
# requires a tool calling capable model.
llm = ChatOpenAI(
    # Consider benchmarking with a good model to get
    # a sense of the best possible quality.
    model="gpt-4-0125-preview",
    # Remember to set the temperature to 0 for extractions!
    temperature=0,
)


runnable = prompt | llm.with_structured_output(
    schema=Data,
    method="function_calling",
    include_raw=False,
)
```

```output
/Users/harrisonchase/workplace/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

## Sans exemples 😿

Notez que même si nous utilisons gpt-4, il échoue avec un **cas de test très simple** !

```python
for _ in range(5):
    text = "The solar system is large, but earth has only 1 moon."
    print(runnable.invoke({"text": text, "examples": []}))
```

```output
people=[]
people=[Person(name='earth', hair_color=None, height_in_meters=None)]
people=[Person(name='earth', hair_color=None, height_in_meters=None)]
people=[]
people=[]
```

## Avec des exemples 😻

Les exemples de référence aident à résoudre l'échec !

```python
for _ in range(5):
    text = "The solar system is large, but earth has only 1 moon."
    print(runnable.invoke({"text": text, "examples": messages}))
```

```output
people=[]
people=[]
people=[]
people=[]
people=[]
```

```python
runnable.invoke(
    {
        "text": "My name is Harrison. My hair is black.",
        "examples": messages,
    }
)
```

```output
Data(people=[Person(name='Harrison', hair_color='black', height_in_meters=None)])
```
