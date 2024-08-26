---
translated: true
---

# Astra DB

> DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) est une base de données serverless capable de vecteurs, construite sur Cassandra et rendue facilement accessible via une API JSON facile à utiliser.

Ce notebook explique comment utiliser Astra DB pour stocker l'historique des messages de discussion.

## Configuration

Pour exécuter ce notebook, vous avez besoin d'une Astra DB en cours d'exécution. Obtenez les secrets de connexion sur votre tableau de bord Astra :

- le point de terminaison API ressemble à `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com` ;
- le jeton ressemble à `AstraCS:6gBhNmsk135...`.

```python
%pip install --upgrade --quiet  "astrapy>=0.7.1"
```

### Définissez les paramètres de connexion à la base de données et les secrets

```python
import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass.getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```output
ASTRA_DB_API_ENDPOINT =  https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN =  ········
```

Selon que l'Astra DB soit locale ou basée sur le cloud, créez l'objet "Session" de connexion à la base de données correspondante.

## Exemple

```python
from langchain_community.chat_message_histories import AstraDBChatMessageHistory

message_history = AstraDBChatMessageHistory(
    session_id="test-session",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
)

message_history.add_user_message("hi!")

message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```
