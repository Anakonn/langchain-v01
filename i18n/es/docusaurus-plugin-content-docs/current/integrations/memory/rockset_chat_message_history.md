---
translated: true
---

# Rockset

>[Rockset](https://rockset.com/product/) es un servicio de base de datos analítica en tiempo real para servir consultas analíticas de baja latencia y alta concurrencia a escala. Construye un Converged Index™ en datos estructurados y semiestructurados con un almacenamiento eficiente para incrustaciones vectoriales. Su compatibilidad con la ejecución de SQL en datos sin esquema lo convierte en una opción perfecta para ejecutar búsqueda vectorial con filtros de metadatos.

Este cuaderno analiza cómo usar [Rockset](https://rockset.com/docs) para almacenar el historial de mensajes de chat.

## Configuración

```python
%pip install --upgrade --quiet  rockset
```

Para comenzar, obtenga su clave API de la [consola de Rockset](https://console.rockset.com/apikeys). Encuentre su región de API para la [referencia de API](https://rockset.com/docs/rest-api#introduction) de Rockset.

## Ejemplo

```python
from langchain_community.chat_message_histories import (
    RocksetChatMessageHistory,
)
from rockset import Regions, RocksetClient

history = RocksetChatMessageHistory(
    session_id="MySession",
    client=RocksetClient(
        api_key="YOUR API KEY",
        host=Regions.usw2a1,  # us-west-2 Oregon
    ),
    collection="langchain_demo",
    sync=True,
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
print(history.messages)
```

La salida debería ser algo así:

```python
[
    HumanMessage(content='hi!', additional_kwargs={'id': '2e62f1c2-e9f7-465e-b551-49bae07fe9f0'}, example=False),
    AIMessage(content='whats up?', additional_kwargs={'id': 'b9be8eda-4c18-4cf8-81c3-e91e876927d0'}, example=False)
]

```
