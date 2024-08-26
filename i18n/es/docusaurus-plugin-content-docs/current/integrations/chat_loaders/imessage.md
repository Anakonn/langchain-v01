---
translated: true
---

# iMessage

Este cuaderno muestra cómo usar el cargador de chat de iMessage. Esta clase ayuda a convertir las conversaciones de iMessage en mensajes de chat de LangChain.

En MacOS, iMessage almacena las conversaciones en una base de datos sqlite en `~/Library/Messages/chat.db` (al menos para macOS Ventura 13.4).
El `IMessageChatLoader` carga desde este archivo de base de datos.

1. Crea el `IMessageChatLoader` con la ruta del archivo apuntando a la base de datos `chat.db` que deseas procesar.
2. Llama a `loader.load()` (o `loader.lazy_load()`) para realizar la conversión. Opcionalmente, usa `merge_chat_runs` para combinar mensajes del mismo remitente en secuencia y/o `map_ai_messages` para convertir los mensajes del remitente especificado a la clase "AIMessage".

## 1. Acceder a la base de datos de chat

Es probable que tu terminal tenga denegado el acceso a `~/Library/Messages`. Para usar esta clase, puedes copiar la base de datos a un directorio accesible (por ejemplo, Documentos) y cargarla desde allí. Alternativamente (y no se recomienda), puedes otorgar acceso de disco completo para tu emulador de terminal en Configuración del sistema > Seguridad y privacidad > Acceso de disco completo.

Hemos creado una base de datos de ejemplo que puedes usar en [este archivo de unidad vinculado](https://drive.google.com/file/d/1NebNKqTA2NXApCmeH6mu0unJD2tANZzo/view?usp=sharing).

```python
# This uses some example data
import requests


def download_drive_file(url: str, output_path: str = "chat.db") -> None:
    file_id = url.split("/")[-2]
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"

    response = requests.get(download_url)
    if response.status_code != 200:
        print("Failed to download the file.")
        return

    with open(output_path, "wb") as file:
        file.write(response.content)
        print(f"File {output_path} downloaded.")


url = (
    "https://drive.google.com/file/d/1NebNKqTA2NXApCmeH6mu0unJD2tANZzo/view?usp=sharing"
)

# Download file to chat.db
download_drive_file(url)
```

```output
File chat.db downloaded.
```

## 2. Crear el cargador de chat

Proporciona al cargador la ruta del archivo al directorio zip. También puedes especificar opcionalmente el ID de usuario que se asigna a un mensaje de IA, así como configurar si se deben fusionar los recorridos de mensajes.

```python
from langchain_community.chat_loaders.imessage import IMessageChatLoader
```

```python
loader = IMessageChatLoader(
    path="./chat.db",
)
```

## 3. Cargar mensajes

Los métodos `load()` (o `lazy_load`) devuelven una lista de "ChatSessions" que actualmente solo contienen una lista de mensajes por cada conversación cargada. Todos los mensajes se asignan a objetos "HumanMessage" para comenzar.

Puedes optar por fusionar los "recorridos" de mensajes (mensajes consecutivos del mismo remitente) y seleccionar un remitente para representar a la "IA". El modelo de lenguaje afinado aprenderá a generar estos mensajes de IA.

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
# Convert messages from "Tortoise" to AI messages. Do you have a guess who these conversations are between?
chat_sessions: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="Tortoise")
)
```

```python
# Now all of the Tortoise's messages will take the AI message class
# which maps to the 'assistant' role in OpenAI's training format
chat_sessions[0]["messages"][:3]
```

```output
[AIMessage(content="Slow and steady, that's my motto.", additional_kwargs={'message_time': 1693182723, 'sender': 'Tortoise'}, example=False),
 HumanMessage(content='Speed is key!', additional_kwargs={'message_time': 1693182753, 'sender': 'Hare'}, example=False),
 AIMessage(content='A balanced approach is more reliable.', additional_kwargs={'message_time': 1693182783, 'sender': 'Tortoise'}, example=False)]
```

## 3. Preparar para el ajuste fino

Ahora es el momento de convertir nuestros mensajes de chat en diccionarios de OpenAI. Podemos usar el utilitario `convert_messages_for_finetuning` para hacerlo.

```python
from langchain_community.adapters.openai import convert_messages_for_finetuning
```

```python
training_data = convert_messages_for_finetuning(chat_sessions)
print(f"Prepared {len(training_data)} dialogues for training")
```

```output
Prepared 10 dialogues for training
```

## 4. Ajustar el modelo

Es hora de ajustar el modelo. Asegúrate de tener `openai` instalado
y haber establecido tu `OPENAI_API_KEY` apropiadamente.

```python
%pip install --upgrade --quiet  langchain-openai
```

```python
import json
import time
from io import BytesIO

import openai

# We will write the jsonl file in memory
my_file = BytesIO()
for m in training_data:
    my_file.write((json.dumps({"messages": m}) + "\n").encode("utf-8"))

my_file.seek(0)
training_file = openai.files.create(file=my_file, purpose="fine-tune")

# OpenAI audits each training file for compliance reasons.
# This make take a few minutes
status = openai.files.retrieve(training_file.id).status
start_time = time.time()
while status != "processed":
    print(f"Status=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    status = openai.files.retrieve(training_file.id).status
print(f"File {training_file.id} ready after {time.time() - start_time:.2f} seconds.")
```

```output
File file-zHIgf4r8LltZG3RFpkGd4Sjf ready after 10.19 seconds.
```

Con el archivo listo, es hora de iniciar un trabajo de entrenamiento.

```python
job = openai.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-3.5-turbo",
)
```

¡Toma una taza de té mientras se prepara tu modelo. ¡Esto puede llevar algún tiempo!

```python
status = openai.fine_tuning.jobs.retrieve(job.id).status
start_time = time.time()
while status != "succeeded":
    print(f"Status=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    job = openai.fine_tuning.jobs.retrieve(job.id)
    status = job.status
```

```output
Status=[running]... 524.95s
```

```python
print(job.fine_tuned_model)
```

```output
ft:gpt-3.5-turbo-0613:personal::7sKoRdlz
```

## 5. Usar en LangChain

Puedes usar directamente el ID del modelo resultante en la clase `ChatOpenAI`.

```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=job.fine_tuned_model,
    temperature=1,
)
```

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are speaking to hare."),
        ("human", "{input}"),
    ]
)

chain = prompt | model | StrOutputParser()
```

```python
for tok in chain.stream({"input": "What's the golden thread?"}):
    print(tok, end="", flush=True)
```

```output
A symbol of interconnectedness.
```
