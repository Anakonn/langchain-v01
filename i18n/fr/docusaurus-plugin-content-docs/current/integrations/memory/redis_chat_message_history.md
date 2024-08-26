---
translated: true
---

# Redis

>[Redis (Remote Dictionary Server)](https://en.wikipedia.org/wiki/Redis) est un stockage en mémoire vive open-source, utilisé comme une base de données clé-valeur distribuée en mémoire, un cache et un courtier de messages, avec une durabilité facultative. Comme il stocke toutes les données en mémoire et en raison de sa conception, `Redis` offre des lectures et des écritures à faible latence, le rendant particulièrement adapté aux cas d'utilisation nécessitant un cache. Redis est la base de données NoSQL la plus populaire et l'une des bases de données les plus populaires dans l'ensemble.

Ce notebook explique comment utiliser `Redis` pour stocker l'historique des messages de discussion.

## Configuration

Nous devons d'abord installer les dépendances et démarrer une instance redis à l'aide de commandes comme : `redis-server`.

```python
pip install -U langchain-community redis
```

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory
```

## Stocker et récupérer des messages

```python
history = RedisChatMessageHistory("foo", url="redis://localhost:6379")

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

## Utilisation dans les chaînes

```python
pip install -U langchain-openai
```

```python
from typing import Optional

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You're an assistant。"),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()

chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: RedisChatMessageHistory(
        session_id, url="redis://localhost:6379"
    ),
    input_messages_key="question",
    history_messages_key="history",
)

config = {"configurable": {"session_id": "foo"}}

chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)

chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content='Your name is Bob, as you mentioned earlier. Is there anything specific you would like assistance with, Bob?')
```
