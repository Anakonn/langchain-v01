---
translated: true
---

# Astra DB

> DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) es una base de datos sin servidor capaz de vectores construida sobre Cassandra y puesta a disposición de manera conveniente a través de una API JSON fácil de usar.

Este cuaderno analiza cómo usar Astra DB para almacenar el historial de mensajes de chat.

## Configuración

Para ejecutar este cuaderno, necesitas una Astra DB en ejecución. Obtén los secretos de conexión en tu panel de Astra:

- el extremo de la API se ve como `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`;
- el Token se ve como `AstraCS:6gBhNmsk135...`.

```python
%pip install --upgrade --quiet  "astrapy>=0.7.1"
```

### Configura los parámetros y secretos de conexión a la base de datos

```python
import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass.getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```output
ASTRA_DB_API_ENDPOINT =  https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN =  ········
```

Dependiendo de si Astra DB es local o basada en la nube, crea el objeto de "Sesión" de conexión a la base de datos correspondiente.

## Ejemplo

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
