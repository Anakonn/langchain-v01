---
translated: true
---

# SQLite

>[SQLite](https://en.wikipedia.org/wiki/SQLite) es un motor de base de datos escrito en el lenguaje de programación C. No es una aplicación independiente; más bien, es una biblioteca que los desarrolladores de software integran en sus aplicaciones. Como tal, pertenece a la familia de las bases de datos integradas. Es el motor de base de datos más ampliamente desplegado, ya que es utilizado por varios de los principales navegadores web, sistemas operativos, teléfonos móviles y otros sistemas integrados.

En este tutorial crearemos una cadena de conversación simple que utiliza `ConversationEntityMemory` respaldada por un `SqliteEntityStore`.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Uso

Para usar el almacenamiento, solo necesitas proporcionar 2 cosas:

1. ID de sesión: un identificador único de la sesión, como nombre de usuario, correo electrónico, ID de chat, etc.
2. Cadena de conexión: una cadena que especifica la conexión a la base de datos. Para SQLite, esa cadena es `slqlite:///` seguida del nombre del archivo de la base de datos. Si ese archivo no existe, se creará.

```python
from langchain_community.chat_message_histories import SQLChatMessageHistory

chat_message_history = SQLChatMessageHistory(
    session_id="test_session_id", connection_string="sqlite:///sqlite.db"
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

Para hacer esto, querremos usar OpenAI, así que necesitamos instalar eso. También necesitaremos establecer la variable de entorno OPENAI_API_KEY en tu clave de OpenAI.

```bash
pip install -U langchain-openai

export OPENAI_API_KEY='sk-xxxxxxx'
```

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
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
    lambda session_id: SQLChatMessageHistory(
        session_id=session_id, connection_string="sqlite:///sqlite.db"
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

```python
# This is where we configure the session id
config = {"configurable": {"session_id": "<SQL_SESSION_ID>"}}
```

```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```

```output
AIMessage(content='Hello Bob! How can I assist you today?')
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content='Your name is Bob! Is there anything specific you would like assistance with, Bob?')
```
