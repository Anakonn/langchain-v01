---
translated: true
---

# SQLite

>[SQLite](https://en.wikipedia.org/wiki/SQLite) est un moteur de base de données écrit dans le langage de programmation C. Ce n'est pas une application autonome ; c'est plutôt une bibliothèque que les développeurs de logiciels intègrent dans leurs applications. En tant que tel, il appartient à la famille des bases de données intégrées. C'est le moteur de base de données le plus largement déployé, car il est utilisé par plusieurs des principaux navigateurs web, systèmes d'exploitation, téléphones mobiles et autres systèmes embarqués.

Dans ce tutoriel, nous allons créer une simple chaîne de conversation qui utilise `ConversationEntityMemory` avec un `SqliteEntityStore` en guise de stockage.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Utilisation

Pour utiliser le stockage, vous n'avez besoin que de 2 éléments :

1. ID de session - un identifiant unique de la session, comme un nom d'utilisateur, un e-mail, un ID de chat, etc.
2. Chaîne de connexion - une chaîne qui spécifie la connexion à la base de données. Pour SQLite, cette chaîne est `slqlite:///` suivie du nom du fichier de base de données. Si ce fichier n'existe pas, il sera créé.

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

## Enchaînement

Nous pouvons facilement combiner cette classe d'historique des messages avec [LCEL Runnables](/docs/expression_language/how_to/message_history)

Pour ce faire, nous voudrons utiliser OpenAI, donc nous devons l'installer. Nous devrons également définir la variable d'environnement OPENAI_API_KEY avec votre clé OpenAI.

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
