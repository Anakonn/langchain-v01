---
translated: true
---

# Cassandra

>[Apache Cassandra®](https://cassandra.apache.org) est une base de données `NoSQL`, orientée lignes, très évolutive et hautement disponible, bien adaptée pour stocker de grandes quantités de données.

>`Cassandra` est un bon choix pour stocker l'historique des messages de chat car il est facile à mettre à l'échelle et peut gérer un grand nombre d'écritures.

Ce notebook explique comment utiliser Cassandra pour stocker l'historique des messages de chat.

## Configuration

Pour exécuter ce notebook, vous avez besoin soit d'un cluster `Cassandra` en cours d'exécution, soit d'une instance `DataStax Astra DB` en cours d'exécution dans le cloud (vous pouvez en obtenir une gratuitement sur [datastax.com](https://astra.datastax.com)). Consultez [cassio.org](https://cassio.org/start_here/) pour plus d'informations.

```python
%pip install --upgrade --quiet  "cassio>=0.1.0"
```

### Définissez les paramètres de connexion à la base de données et les secrets

```python
import getpass

database_mode = (input("\n(C)assandra or (A)stra DB? ")).upper()

keyspace_name = input("\nKeyspace name? ")

if database_mode == "A":
    ASTRA_DB_APPLICATION_TOKEN = getpass.getpass('\nAstra DB Token ("AstraCS:...") ')
    #
    ASTRA_DB_SECURE_BUNDLE_PATH = input("Full path to your Secure Connect Bundle? ")
elif database_mode == "C":
    CASSANDRA_CONTACT_POINTS = input(
        "Contact points? (comma-separated, empty for localhost) "
    ).strip()
```

Selon que vous utilisez une base de données locale ou cloud-based Astra DB, créez l'objet "Session" de connexion à la base de données correspondant.

```python
from cassandra.auth import PlainTextAuthProvider
from cassandra.cluster import Cluster

if database_mode == "C":
    if CASSANDRA_CONTACT_POINTS:
        cluster = Cluster(
            [cp.strip() for cp in CASSANDRA_CONTACT_POINTS.split(",") if cp.strip()]
        )
    else:
        cluster = Cluster()
    session = cluster.connect()
elif database_mode == "A":
    ASTRA_DB_CLIENT_ID = "token"
    cluster = Cluster(
        cloud={
            "secure_connect_bundle": ASTRA_DB_SECURE_BUNDLE_PATH,
        },
        auth_provider=PlainTextAuthProvider(
            ASTRA_DB_CLIENT_ID,
            ASTRA_DB_APPLICATION_TOKEN,
        ),
    )
    session = cluster.connect()
else:
    raise NotImplementedError
```

## Exemple

```python
from langchain_community.chat_message_histories import (
    CassandraChatMessageHistory,
)

message_history = CassandraChatMessageHistory(
    session_id="test-session",
    session=session,
    keyspace=keyspace_name,
)

message_history.add_user_message("hi!")

message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

#### Déclaration d'attribution

> Apache Cassandra, Cassandra et Apache sont soit des marques déposées, soit des marques commerciales de l'[Apache Software Foundation](http://www.apache.org/) aux États-Unis et/ou dans d'autres pays.
