---
translated: true
---

# Slack

Este cuaderno muestra cómo usar el cargador de chat de Slack. Esta clase ayuda a asignar las conversaciones de Slack exportadas a los mensajes de chat de LangChain.

El proceso tiene tres pasos:
1. Exporta el hilo de conversación deseado siguiendo las [instrucciones aquí](https://slack.com/help/articles/1500001548241-Request-to-export-all-conversations).
2. Crea el `SlackChatLoader` con la ruta del archivo apuntando al archivo JSON o al directorio de archivos JSON.
3. Llama a `loader.load()` (o `loader.lazy_load()`) para realizar la conversión. Opcionalmente, usa `merge_chat_runs` para combinar mensajes del mismo remitente en secuencia y/o `map_ai_messages` para convertir los mensajes del remitente especificado a la clase "AIMessage".

## 1. Crear volcado de mensajes

Actualmente (2023/08/23), este cargador es compatible con un directorio zip de archivos con el formato generado al exportar una conversación de mensaje directo de Slack. Sigue las instrucciones actualizadas de Slack sobre cómo hacerlo.

Tenemos un ejemplo en el repositorio de LangChain.

```python
import requests

permalink = "https://raw.githubusercontent.com/langchain-ai/langchain/342087bdfa3ac31d622385d0f2d09cf5e06c8db3/libs/langchain/tests/integration_tests/examples/slack_export.zip"
response = requests.get(permalink)
with open("slack_dump.zip", "wb") as f:
    f.write(response.content)
```

## 2. Crear el cargador de chat

Proporciona al cargador la ruta del archivo al directorio zip. También puedes especificar opcionalmente el ID de usuario que se asigna a un mensaje de IA y configurar si se deben fusionar los recorridos de mensajes.

```python
from langchain_community.chat_loaders.slack import SlackChatLoader
```

```python
loader = SlackChatLoader(
    path="slack_dump.zip",
)
```

## 3. Cargar mensajes

Los métodos `load()` (o `lazy_load`) devuelven una lista de "ChatSessions" que actualmente solo contienen una lista de mensajes por cada conversación cargada.

```python
from typing import List

from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
from langchain_core.chat_sessions import ChatSession

raw_messages = loader.lazy_load()
# Merge consecutive messages from the same sender into a single message
merged_messages = merge_chat_runs(raw_messages)
# Convert messages from "U0500003428" to AI messages
messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="U0500003428")
)
```

### Próximos pasos

Puedes usar estos mensajes como mejor te convenga, como ajustar un modelo, seleccionar ejemplos de pocos disparos o hacer predicciones directamente para el siguiente mensaje.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[1]["messages"]):
    print(chunk.content, end="", flush=True)
```

```output
Hi,

I hope you're doing well. I wanted to reach out and ask if you'd be available to meet up for coffee sometime next week. I'd love to catch up and hear about what's been going on in your life. Let me know if you're interested and we can find a time that works for both of us.

Looking forward to hearing from you!

Best, [Your Name]
```
