---
translated: true
---

# Telegram

Este cuaderno muestra cómo usar el cargador de chat de Telegram. Esta clase ayuda a asignar las conversaciones de Telegram exportadas a los mensajes de chat de LangChain.

El proceso tiene tres pasos:
1. Exportar el archivo .txt de chat copiando los chats de la aplicación Telegram y pegándolos en un archivo en su computadora local
2. Crear el `TelegramChatLoader` con la ruta del archivo apuntando al archivo json o al directorio de archivos JSON
3. Llame a `loader.load()` (o `loader.lazy_load()`) para realizar la conversión. Opcionalmente, use `merge_chat_runs` para combinar mensajes del mismo remitente en secuencia y/o `map_ai_messages` para convertir los mensajes del remitente especificado a la clase "AIMessage".

## 1. Crear volcado de mensajes

Actualmente (2023/08/23) este cargador es compatible con archivos json en el formato generado al exportar el historial de chat desde la [aplicación de escritorio de Telegram](https://desktop.telegram.org/).

**Importante:** Hay versiones 'ligeras' de Telegram como "Telegram for MacOS" que carecen de la funcionalidad de exportación. Asegúrese de usar la aplicación correcta para exportar el archivo.

Para hacer la exportación:
1. Descargue y abra el escritorio de Telegram
2. Seleccione una conversación
3. Navegue a la configuración de la conversación (actualmente los tres puntos en la esquina superior derecha)
4. Haga clic en "Exportar historial de chat"
5. Deseleccione fotos y otros medios. Seleccione el formato "JSON legible por máquina" para exportar.

Un ejemplo se muestra a continuación:

```python
%%writefile telegram_conversation.json
{
 "name": "Jiminy",
 "type": "personal_chat",
 "id": 5965280513,
 "messages": [
  {
   "id": 1,
   "type": "message",
   "date": "2023-08-23T13:11:23",
   "date_unixtime": "1692821483",
   "from": "Jiminy Cricket",
   "from_id": "user123450513",
   "text": "You better trust your conscience",
   "text_entities": [
    {
     "type": "plain",
     "text": "You better trust your conscience"
    }
   ]
  },
  {
   "id": 2,
   "type": "message",
   "date": "2023-08-23T13:13:20",
   "date_unixtime": "1692821600",
   "from": "Batman & Robin",
   "from_id": "user6565661032",
   "text": "What did you just say?",
   "text_entities": [
    {
     "type": "plain",
     "text": "What did you just say?"
    }
   ]
  }
 ]
}
```

```output
Overwriting telegram_conversation.json
```

## 2. Crear el cargador de chat

Todo lo que se requiere es la ruta del archivo. También puede especificar el nombre de usuario que se asigna a un mensaje de IA y configurar si se deben combinar los recorridos de mensajes.

```python
from langchain_community.chat_loaders.telegram import TelegramChatLoader
```

```python
loader = TelegramChatLoader(
    path="./telegram_conversation.json",
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
# Convert messages from "Jiminy Cricket" to AI messages
messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="Jiminy Cricket")
)
```

### Próximos pasos

Puede usar estos mensajes como mejor le parezca, como ajustar un modelo, seleccionar ejemplos de pocos disparos o hacer predicciones directamente para el siguiente mensaje

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```

```output
I said, "You better trust your conscience."
```
