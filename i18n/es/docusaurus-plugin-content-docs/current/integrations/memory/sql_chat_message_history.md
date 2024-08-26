---
translated: true
---

# SQL (SQLAlchemy)

>[Structured Query Language (SQL)](https://en.wikipedia.org/wiki/SQL) es un lenguaje de dominio específico utilizado en programación y diseñado para gestionar datos almacenados en un sistema de gestión de bases de datos relacionales (RDBMS) o para el procesamiento de flujos en un sistema de gestión de flujos de datos relacionales (RDSMS). Es particularmente útil para manejar datos estructurados, es decir, datos que incorporan relaciones entre entidades y variables.

>[SQLAlchemy](https://github.com/sqlalchemy/sqlalchemy) es un kit de herramientas de `SQL` de código abierto y un asignador objeto-relacional (ORM) para el lenguaje de programación Python, publicado bajo la Licencia MIT.

Este cuaderno analiza una clase `SQLChatMessageHistory` que permite almacenar el historial de chat en cualquier base de datos compatible con `SQLAlchemy`.

Tenga en cuenta que para usarlo con bases de datos distintas de `SQLite`, deberá instalar el controlador de base de datos correspondiente.

## Configuración

La integración se encuentra en el paquete `langchain-community`, por lo que debemos instalarlo. También necesitamos instalar el paquete `SQLAlchemy`.

```bash
pip install -U langchain-community SQLAlchemy langchain-openai
```

También es útil (pero no necesario) configurar [LangSmith](https://smith.langchain.com/) para una observabilidad de primera clase.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Uso

Para usar el almacenamiento, solo necesitas proporcionar 2 cosas:

1. ID de sesión: un identificador único de la sesión, como el nombre de usuario, el correo electrónico, el ID de chat, etc.
2. Cadena de conexión: una cadena que especifica la conexión a la base de datos. Se pasará a la función create_engine de SQLAlchemy.

```python
from langchain_community.chat_message_histories import SQLChatMessageHistory

chat_message_history = SQLChatMessageHistory(
    session_id="test_session", connection_string="sqlite:///sqlite.db"
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

Para hacer esto, querremos usar OpenAI, así que necesitamos instalarlo.

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
config = {"configurable": {"session_id": "<SESSION_ID>"}}
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
