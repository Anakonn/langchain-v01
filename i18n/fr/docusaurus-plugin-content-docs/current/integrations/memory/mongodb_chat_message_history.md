---
translated: true
---

# MongoDB

>`MongoDB` est un programme de base de données orientée document multiplateforme disponible sous licence. Classé comme un programme de base de données NoSQL, `MongoDB` utilise des documents `JSON` avec des schémas facultatifs.
>
>`MongoDB` est développé par MongoDB Inc. et est sous licence Server Side Public License (SSPL). - [Wikipédia](https://en.wikipedia.org/wiki/MongoDB)

Ce cahier d'exercices explique comment utiliser la classe `MongoDBChatMessageHistory` pour stocker l'historique des messages de chat dans une base de données Mongodb.

## Configuration

L'intégration se trouve dans le package `langchain-mongodb`, nous devons donc l'installer.

```bash
pip install -U --quiet langchain-mongodb
```

Il est également utile (mais pas nécessaire) de configurer [LangSmith](https://smith.langchain.com/) pour une observabilité de premier ordre.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Utilisation

Pour utiliser le stockage, vous devez fournir seulement 2 éléments :

1. ID de session - un identifiant unique de la session, comme un nom d'utilisateur, un e-mail, un ID de chat, etc.
2. Chaîne de connexion - une chaîne qui spécifie la connexion à la base de données. Elle sera transmise à la fonction create_engine de MongoDB.

Si vous voulez personnaliser l'emplacement des historiques de chat, vous pouvez également passer :
1. *database_name* - nom de la base de données à utiliser
1. *collection_name* - collection à utiliser dans cette base de données

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

## Enchaînement

Nous pouvons facilement combiner cette classe d'historique de messages avec [LCEL Runnables](/docs/expression_language/how_to/message_history)

Pour ce faire, nous voudrons utiliser OpenAI, donc nous devons l'installer. Vous devrez également définir la variable d'environnement OPENAI_API_KEY avec votre clé OpenAI.

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
