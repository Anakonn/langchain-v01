---
translated: true
---

# SQL (SQLAlchemy)

>[Structured Query Language (SQL)](https://en.wikipedia.org/wiki/SQL) est un langage spécifique au domaine utilisé dans la programmation et conçu pour gérer les données stockées dans un système de gestion de base de données relationnelles (SGBDR) ou pour le traitement en flux dans un système de gestion de flux de données relationnelles (SGFDR). Il est particulièrement utile pour manipuler des données structurées, c'est-à-dire des données incorporant des relations entre entités et variables.

>[SQLAlchemy](https://github.com/sqlalchemy/sqlalchemy) est une boîte à outils `SQL` open-source et un mappeur objet-relationnel (ORM) pour le langage de programmation Python, publié sous la licence MIT.

Ce notebook présente une classe `SQLChatMessageHistory` qui permet de stocker l'historique des discussions dans n'importe quelle base de données prise en charge par `SQLAlchemy`.

Veuillez noter que pour l'utiliser avec des bases de données autres que `SQLite`, vous devrez installer le pilote de base de données correspondant.

## Configuration

L'intégration se trouve dans le package `langchain-community`, nous devons donc l'installer. Nous devons également installer le package `SQLAlchemy`.

```bash
pip install -U langchain-community SQLAlchemy langchain-openai
```

Il est également utile (mais pas nécessaire) de configurer [LangSmith](https://smith.langchain.com/) pour une observabilité de premier ordre.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Utilisation

Pour utiliser le stockage, vous devez fournir seulement 2 éléments :

1. ID de session - un identifiant unique de la session, comme un nom d'utilisateur, un e-mail, un ID de discussion, etc.
2. Chaîne de connexion - une chaîne qui spécifie la connexion à la base de données. Elle sera transmise à la fonction create_engine de SQLAlchemy.

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

## Enchaînement

Nous pouvons facilement combiner cette classe d'historique des messages avec [LCEL Runnables](/docs/expression_language/how_to/message_history)

Pour ce faire, nous voudrons utiliser OpenAI, donc nous devons l'installer.

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
