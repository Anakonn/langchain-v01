---
sidebar_position: 0
title: Référence rapide
translated: true
---

# Référence rapide

Les modèles de prompt sont des recettes prédéfinies pour générer des prompts pour les modèles de langage.

Un modèle peut inclure des instructions, des exemples few-shot et un contexte et des questions spécifiques appropriés pour une tâche donnée.

LangChain fournit des outils pour créer et travailler avec des modèles de prompt.

LangChain s'efforce de créer des modèles indépendants du modèle pour faciliter la réutilisation des modèles existants sur différents modèles de langage.

Généralement, les modèles de langage s'attendent à ce que le prompt soit une chaîne de caractères ou une liste de messages de discussion.

## `PromptTemplate`

Utilisez `PromptTemplate` pour créer un modèle pour un prompt de chaîne de caractères.

Par défaut, `PromptTemplate` utilise la syntaxe [str.format de Python](https://docs.python.org/3/library/stdtypes.html#str.format) pour le modèle.

```python
from langchain_core.prompts import PromptTemplate

prompt_template = PromptTemplate.from_template(
    "Tell me a {adjective} joke about {content}."
)
prompt_template.format(adjective="funny", content="chickens")
```

```output
'Tell me a funny joke about chickens.'
```

Le modèle prend en charge un nombre quelconque de variables, y compris aucune variable :

```python
from langchain_core.prompts import PromptTemplate

prompt_template = PromptTemplate.from_template("Tell me a joke")
prompt_template.format()
```

```output
'Tell me a joke'
```

Vous pouvez créer des modèles de prompt personnalisés qui formatent le prompt de la manière que vous souhaitez.
Pour plus d'informations, consultez [Composition du modèle de prompt](/docs/modules/model_io/prompts/composition/).

## `ChatPromptTemplate`

Le prompt pour [les modèles de discussion](/docs/modules/model_io/chat) est une liste de [messages de discussion](/docs/modules/model_io/chat/message_types/).

Chaque message de discussion est associé à un contenu et à un paramètre supplémentaire appelé `role`.
Par exemple, dans l'API [Chat Completions d'OpenAI](https://platform.openai.com/docs/guides/chat/introduction), un message de discussion peut être associé à un rôle d'assistant IA, d'humain ou de système.

Créez un modèle de prompt de discussion comme ceci :

```python
from langchain_core.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful AI bot. Your name is {name}."),
        ("human", "Hello, how are you doing?"),
        ("ai", "I'm doing well, thanks!"),
        ("human", "{user_input}"),
    ]
)

messages = chat_template.format_messages(name="Bob", user_input="What is your name?")
```

Transmettre ces messages formatés à la classe `ChatOpenAI` de LangChain est à peu près équivalent à ce qui suit en utilisant directement le client OpenAI :

```python
%pip install openai
```

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are a helpful AI bot. Your name is Bob."},
        {"role": "user", "content": "Hello, how are you doing?"},
        {"role": "assistant", "content": "I'm doing well, thanks!"},
        {"role": "user", "content": "What is your name?"},
    ],
)
```

La méthode statique `ChatPromptTemplate.from_messages` accepte une variété de représentations de messages et est un moyen pratique de formater l'entrée des modèles de discussion avec exactement les messages que vous voulez.

Par exemple, en plus d'utiliser la représentation en 2-tuple de (type, contenu) utilisée
ci-dessus, vous pourriez passer une instance de `MessagePromptTemplate` ou `BaseMessage`.

```python
from langchain_core.messages import SystemMessage
from langchain_core.prompts import HumanMessagePromptTemplate

chat_template = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content=(
                "You are a helpful assistant that re-writes the user's text to "
                "sound more upbeat."
            )
        ),
        HumanMessagePromptTemplate.from_template("{text}"),
    ]
)
messages = chat_template.format_messages(text="I don't like eating tasty things")
print(messages)
```

```output
[SystemMessage(content="You are a helpful assistant that re-writes the user's text to sound more upbeat."), HumanMessage(content="I don't like eating tasty things")]
```

Cela vous offre beaucoup de flexibilité dans la construction de vos prompts de discussion.

## Message Prompts

LangChain fournit différents types de `MessagePromptTemplate`. Les plus couramment utilisés sont `AIMessagePromptTemplate`, `SystemMessagePromptTemplate` et `HumanMessagePromptTemplate`, qui créent respectivement un message d'IA, un message système et un message humain. Vous pouvez en savoir plus sur les [différents types de messages ici](/docs/modules/model_io/chat/message_types).

Dans les cas où le modèle de discussion prend en charge les messages de discussion avec un rôle arbitraire, vous pouvez utiliser `ChatMessagePromptTemplate`, qui permet à l'utilisateur de spécifier le nom du rôle.

```python
from langchain_core.prompts import ChatMessagePromptTemplate

prompt = "May the {subject} be with you"

chat_message_prompt = ChatMessagePromptTemplate.from_template(
    role="Jedi", template=prompt
)
chat_message_prompt.format(subject="force")
```

```output
ChatMessage(content='May the force be with you', role='Jedi')
```

## `MessagesPlaceholder`

LangChain fournit également `MessagesPlaceholder`, qui vous donne le contrôle total sur les messages à restituer lors du formatage. Cela peut être utile lorsque vous n'êtes pas sûr du rôle que vous devriez utiliser pour vos modèles de prompt de message ou lorsque vous souhaitez insérer une liste de messages lors du formatage.

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)

human_prompt = "Summarize our conversation so far in {word_count} words."
human_message_template = HumanMessagePromptTemplate.from_template(human_prompt)

chat_prompt = ChatPromptTemplate.from_messages(
    [MessagesPlaceholder(variable_name="conversation"), human_message_template]
)
```

```python
from langchain_core.messages import AIMessage, HumanMessage

human_message = HumanMessage(content="What is the best way to learn programming?")
ai_message = AIMessage(
    content="""\
1. Choose a programming language: Decide on a programming language that you want to learn.

2. Start with the basics: Familiarize yourself with the basic programming concepts such as variables, data types and control structures.

3. Practice, practice, practice: The best way to learn programming is through hands-on experience\
"""
)

chat_prompt.format_prompt(
    conversation=[human_message, ai_message], word_count="10"
).to_messages()
```

```output
[HumanMessage(content='What is the best way to learn programming?'),
 AIMessage(content='1. Choose a programming language: Decide on a programming language that you want to learn.\n\n2. Start with the basics: Familiarize yourself with the basic programming concepts such as variables, data types and control structures.\n\n3. Practice, practice, practice: The best way to learn programming is through hands-on experience'),
 HumanMessage(content='Summarize our conversation so far in 10 words.')]
```

La liste complète des types de modèles de prompt de message comprend :

* [AIMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.AIMessagePromptTemplate.html), pour les messages d'assistant IA ;
* [SystemMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.SystemMessagePromptTemplate.html), pour les messages système ;
* [HumanMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.HumanMessagePromptTemplate.html), pour les messages utilisateur ;
* [ChatMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatMessagePromptTemplate.html), pour les messages avec des rôles arbitraires ;
* [MessagesPlaceholder](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html), qui s'adapte à une liste de messages.

## LCEL

`PromptTemplate` et `ChatPromptTemplate` implémentent l'[interface Runnable](/docs/expression_language/interface), le bloc de construction de base du [LangChain Expression Language (LCEL)](/docs/expression_language/). Cela signifie qu'ils prennent en charge les appels `invoke`, `ainvoke`, `stream`, `astream`, `batch`, `abatch`, `astream_log`.

`PromptTemplate` accepte un dictionnaire (des variables du prompt) et renvoie une `StringPromptValue`. Un `ChatPromptTemplate` accepte un dictionnaire et renvoie une `ChatPromptValue`.

```python
prompt_template = PromptTemplate.from_template(
    "Tell me a {adjective} joke about {content}."
)

prompt_val = prompt_template.invoke({"adjective": "funny", "content": "chickens"})
prompt_val
```

```output
StringPromptValue(text='Tell me a funny joke about chickens.')
```

```python
prompt_val.to_string()
```

```output
'Tell me a funny joke about chickens.'
```

```python
prompt_val.to_messages()
```

```output
[HumanMessage(content='Tell me a funny joke about chickens.')]
```

```python
chat_template = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content=(
                "You are a helpful assistant that re-writes the user's text to "
                "sound more upbeat."
            )
        ),
        HumanMessagePromptTemplate.from_template("{text}"),
    ]
)

chat_val = chat_template.invoke({"text": "i dont like eating tasty things."})
```

```python
chat_val.to_messages()
```

```output
[SystemMessage(content="You are a helpful assistant that re-writes the user's text to sound more upbeat."),
 HumanMessage(content='i dont like eating tasty things.')]
```

```python
chat_val.to_string()
```

```output
"System: You are a helpful assistant that re-writes the user's text to sound more upbeat.\nHuman: i dont like eating tasty things."
```
