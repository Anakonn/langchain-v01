---
translated: true
---

# Cassandra

>[Apache Cassandra®](https://cassandra.apache.org) es una base de datos `NoSQL`, orientada a filas, altamente escalable y altamente disponible, adecuada para almacenar grandes cantidades de datos.

>`Cassandra` es una buena opción para almacenar el historial de mensajes de chat porque es fácil de escalar y puede manejar un gran número de escrituras.

Este cuaderno explica cómo usar Cassandra para almacenar el historial de mensajes de chat.

## Configuración

Para ejecutar este cuaderno, necesitas un clúster `Cassandra` en ejecución o una instancia `DataStax Astra DB` en la nube (puedes obtener una de forma gratuita en [datastax.com](https://astra.datastax.com)). Consulta [cassio.org](https://cassio.org/start_here/) para obtener más información.

```python
%pip install --upgrade --quiet  "cassio>=0.1.0"
```

### Configurar los parámetros de conexión a la base de datos y los secretos

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

Dependiendo de si la base de datos Astra DB es local o basada en la nube, crea el objeto de "Sesión" de conexión a la base de datos correspondiente.

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

## Ejemplo

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

#### Declaración de atribución

> Apache Cassandra, Cassandra y Apache son marcas comerciales registradas o marcas comerciales de la [Apache Software Foundation](http://www.apache.org/) en los Estados Unidos y/o en otros países.
