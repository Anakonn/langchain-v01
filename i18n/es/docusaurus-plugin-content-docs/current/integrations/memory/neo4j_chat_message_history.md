---
translated: true
---

# Neo4j

[Neo4j](https://en.wikipedia.org/wiki/Neo4j) es un sistema de gestión de bases de datos de gráficos de código abierto, reconocido por su eficiente gestión de datos altamente conectados. A diferencia de las bases de datos tradicionales que almacenan datos en tablas, Neo4j utiliza una estructura de gráficos con nodos, bordes y propiedades para representar y almacenar datos. Este diseño permite consultas de alto rendimiento sobre relaciones de datos complejas.

Este cuaderno analiza cómo usar `Neo4j` para almacenar el historial de mensajes de chat.

```python
from langchain_community.chat_message_histories import Neo4jChatMessageHistory

history = Neo4jChatMessageHistory(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password",
    session_id="session_id_1",
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```
