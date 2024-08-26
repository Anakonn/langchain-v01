---
translated: true
---

# Redis

>[Redis (Remote Dictionary Server)](https://en.wikipedia.org/wiki/Redis) es un almacenamiento en memoria abierto, utilizado como una base de datos clave-valor distribuida y en memoria, caché y broker de mensajes, con durabilidad opcional. Debido a que mantiene todos los datos en memoria y a su diseño, `Redis` ofrece lecturas y escrituras de baja latencia, lo que lo hace particularmente adecuado para casos de uso que requieren una caché. Redis es la base de datos NoSQL más popular y una de las bases de datos más populares en general.

Este cuaderno repasa cómo usar `Redis` para almacenar el historial de mensajes de chat.

## Configuración

Primero necesitamos instalar las dependencias y iniciar una instancia de redis usando comandos como: `redis-server`.

```python
pip install -U langchain-community redis
```

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory
```

## Almacenar y Recuperar Mensajes

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

## Usar en las Cadenas

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
