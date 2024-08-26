---
translated: true
---

# MongoDB

>`MongoDB` es un programa de base de datos orientado a documentos multiplataforma de código abierto. Clasificado como un programa de base de datos NoSQL, `MongoDB` utiliza documentos similares a `JSON` con esquemas opcionales.
>
>`MongoDB` es desarrollado por MongoDB Inc. y con licencia bajo la Licencia Pública del Lado del Servidor (SSPL). - [Wikipedia](https://en.wikipedia.org/wiki/MongoDB)

Este cuaderno repasa cómo usar la clase `MongoDBChatMessageHistory` para almacenar el historial de mensajes de chat en una base de datos Mongodb.

## Configuración

La integración se encuentra en el paquete `langchain-mongodb`, por lo que necesitamos instalarlo.

```bash
pip install -U --quiet langchain-mongodb
```

También es útil (pero no necesario) configurar [LangSmith](https://smith.langchain.com/) para una observabilidad de primera clase.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Uso

Para usar el almacenamiento, solo necesitas proporcionar 2 cosas:

1. ID de sesión: un identificador único de la sesión, como nombre de usuario, correo electrónico, ID de chat, etc.
2. Cadena de conexión: una cadena que especifica la conexión a la base de datos. Se pasará a la función create_engine de MongoDB.

Si deseas personalizar dónde se guardan los historiales de chat, también puedes pasar:
1. *database_name* - nombre de la base de datos a usar
1. *collection_name* - colección a usar dentro de esa base de datos

```python
from langchain_mongodb.chat_message_histories import MongoDBChatMessageHistory

chat_message_history = MongoDBChatMessageHistory(
    session_id="test_session",
    connection_string="mongodb://mongo_user:password123@mongo:27017",
    database_name="my_db",
    collection_name="chat_histories",
)

chat_message_history.add_user_message("Hello")
chat_message_history.add_ai_message("Hi")
```

```python
chat_message_history.messages
```

```output
[HumanMessage(content='Hello'), AIMessage(content='Hi')]
```

## Encadenamiento

Podemos combinar fácilmente esta clase de historial de mensajes con [LCEL Runnables](/docs/expression_language/how_to/message_history)

Para hacer esto, querremos usar OpenAI, así que necesitamos instalarlo. También deberás establecer la variable de entorno OPENAI_API_KEY con tu clave de OpenAI.

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
```

```python
import os

assert os.environ[
    "OPENAI_API_KEY"
], "Set the OPENAI_API_KEY environment variable with your OpenAI API key."
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()
```

```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: MongoDBChatMessageHistory(
        session_id=session_id,
        connection_string="mongodb://mongo_user:password123@mongo:27017",
        database_name="my_db",
        collection_name="chat_histories",
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

```python
# This is where we configure the session id
config = {"configurable": {"session_id": "<SESSION_ID>"}}
```

```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```

```output
AIMessage(content='Hi Bob! How can I assist you today?')
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content='Your name is Bob. Is there anything else I can help you with, Bob?')
```
