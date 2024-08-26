---
translated: true
---

# Momento Cache

>[Momento Cache](https://docs.momentohq.com/) es el primer servicio de caché verdaderamente sin servidor del mundo. Proporciona elasticidad instantánea, capacidad de escalado a cero y un rendimiento ultrarrápido.

Este cuaderno explica cómo usar [Momento Cache](https://www.gomomento.com/services/cache) para almacenar el historial de mensajes de chat utilizando la clase `MomentoChatMessageHistory`. Consulta la [documentación](https://docs.momentohq.com/getting-started) de Momento para obtener más detalles sobre cómo configurar Momento.

Ten en cuenta que, de forma predeterminada, crearemos una caché si no existe una con el nombre dado.

Necesitarás obtener una clave API de Momento para usar esta clase. Esto se puede pasar a un momento.CacheClient si deseas instanciarlo directamente, como un parámetro con nombre `api_key` a `MomentoChatMessageHistory.from_client_params`, o simplemente se puede establecer como una variable de entorno `MOMENTO_API_KEY`.

```python
from datetime import timedelta

from langchain_community.chat_message_histories import MomentoChatMessageHistory

session_id = "foo"
cache_name = "langchain"
ttl = timedelta(days=1)
history = MomentoChatMessageHistory.from_client_params(
    session_id,
    cache_name,
    ttl,
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!', additional_kwargs={}, example=False),
 AIMessage(content='whats up?', additional_kwargs={}, example=False)]
```
