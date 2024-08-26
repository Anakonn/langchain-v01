---
translated: true
---

# Facebook Messenger

Este cuaderno muestra cómo cargar datos de Facebook en un formato que puedes ajustar. Los pasos generales son:

1. Descarga tus datos de mensajería a disco.
2. Crea el Chat Loader y llama a `loader.load()` (o `loader.lazy_load()`) para realizar la conversión.
3. Opcionalmente, usa `merge_chat_runs` para combinar mensajes del mismo remitente en secuencia y/o `map_ai_messages` para convertir mensajes del remitente especificado a la clase "AIMessage". Una vez que hayas hecho esto, llama a `convert_messages_for_finetuning` para preparar tus datos para el ajuste fino.

Una vez hecho esto, puedes ajustar tu modelo. Para hacerlo, completarías los siguientes pasos:

4. Carga tus mensajes a OpenAI y ejecuta un trabajo de ajuste fino.
6. ¡Usa el modelo resultante en tu aplicación LangChain!

Comencemos.

## 1. Descargar datos

Para descargar tus propios datos de mensajería, sigue las instrucciones [aquí](https://www.zapptales.com/en/download-facebook-messenger-chat-history-how-to/). IMPORTANTE: asegúrate de descargarlos en formato JSON (no HTML).

Estamos alojando un ejemplo de volcado en [este enlace de Google Drive](https://drive.google.com/file/d/1rh1s1o2i7B-Sk1v9o8KNgivLVGwJ-osV/view?usp=sharing) que usaremos en este tutorial.

```python
# This uses some example data
import zipfile

import requests


def download_and_unzip(url: str, output_path: str = "file.zip") -> None:
    file_id = url.split("/")[-2]
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"

    response = requests.get(download_url)
    if response.status_code != 200:
        print("Failed to download the file.")
        return

    with open(output_path, "wb") as file:
        file.write(response.content)
        print(f"File {output_path} downloaded.")

    with zipfile.ZipFile(output_path, "r") as zip_ref:
        zip_ref.extractall()
        print(f"File {output_path} has been unzipped.")


# URL of the file to download
url = (
    "https://drive.google.com/file/d/1rh1s1o2i7B-Sk1v9o8KNgivLVGwJ-osV/view?usp=sharing"
)

# Download and unzip
download_and_unzip(url)
```

```output
File file.zip downloaded.
File file.zip has been unzipped.
```

## 2. Crear Chat Loader

Tenemos 2 clases `FacebookMessengerChatLoader` diferentes, una para todo un directorio de chats y otra para cargar archivos individuales. Nosotros

```python
directory_path = "./hogwarts"
```

```python
from langchain_community.chat_loaders.facebook_messenger import (
    FolderFacebookMessengerChatLoader,
    SingleFileFacebookMessengerChatLoader,
)
```

```python
loader = SingleFileFacebookMessengerChatLoader(
    path="./hogwarts/inbox/HermioneGranger/messages_Hermione_Granger.json",
)
```

```python
chat_session = loader.load()[0]
chat_session["messages"][:3]
```

```output
[HumanMessage(content="Hi Hermione! How's your summer going so far?", additional_kwargs={'sender': 'Harry Potter'}),
 HumanMessage(content="Harry! Lovely to hear from you. My summer is going well, though I do miss everyone. I'm spending most of my time going through my books and researching fascinating new topics. How about you?", additional_kwargs={'sender': 'Hermione Granger'}),
 HumanMessage(content="I miss you all too. The Dursleys are being their usual unpleasant selves but I'm getting by. At least I can practice some spells in my room without them knowing. Let me know if you find anything good in your researching!", additional_kwargs={'sender': 'Harry Potter'})]
```

```python
loader = FolderFacebookMessengerChatLoader(
    path="./hogwarts",
)
```

```python
chat_sessions = loader.load()
len(chat_sessions)
```

```output
9
```

## 3. Preparar para el ajuste fino

Llamar a `load()` devuelve todos los mensajes de chat que pudimos extraer como mensajes humanos. Cuando se conversa con chatbots, las conversaciones suelen seguir un patrón de diálogo más estricto y alternante en comparación con las conversaciones reales.

Puedes elegir fusionar los "runs" de mensajes (mensajes consecutivos del mismo remitente) y seleccionar un remitente para representar al "AI". El LLM ajustado aprenderá a generar estos mensajes de IA.

```python
from langchain_community.chat_loaders.utils import (
    map_ai_messages,
    merge_chat_runs,
)
```

```python
merged_sessions = merge_chat_runs(chat_sessions)
alternating_sessions = list(map_ai_messages(merged_sessions, "Harry Potter"))
```

```python
# Now all of Harry Potter's messages will take the AI message class
# which maps to the 'assistant' role in OpenAI's training format
alternating_sessions[0]["messages"][:3]
```

```output
[AIMessage(content="Professor Snape, I was hoping I could speak with you for a moment about something that's been concerning me lately.", additional_kwargs={'sender': 'Harry Potter'}),
 HumanMessage(content="What is it, Potter? I'm quite busy at the moment.", additional_kwargs={'sender': 'Severus Snape'}),
 AIMessage(content="I apologize for the interruption, sir. I'll be brief. I've noticed some strange activity around the school grounds at night. I saw a cloaked figure lurking near the Forbidden Forest last night. I'm worried someone may be plotting something sinister.", additional_kwargs={'sender': 'Harry Potter'})]
```

#### Ahora podemos convertir a diccionarios con el formato de OpenAI

```python
from langchain_community.adapters.openai import convert_messages_for_finetuning
```

```python
training_data = convert_messages_for_finetuning(alternating_sessions)
print(f"Prepared {len(training_data)} dialogues for training")
```

```output
Prepared 9 dialogues for training
```

```python
training_data[0][:3]
```

```output
[{'role': 'assistant',
  'content': "Professor Snape, I was hoping I could speak with you for a moment about something that's been concerning me lately."},
 {'role': 'user',
  'content': "What is it, Potter? I'm quite busy at the moment."},
 {'role': 'assistant',
  'content': "I apologize for the interruption, sir. I'll be brief. I've noticed some strange activity around the school grounds at night. I saw a cloaked figure lurking near the Forbidden Forest last night. I'm worried someone may be plotting something sinister."}]
```

OpenAI actualmente requiere al menos 10 ejemplos de entrenamiento para un trabajo de ajuste fino, aunque recomiendan entre 50 y 100 para la mayoría de las tareas. Dado que solo tenemos 9 sesiones de chat, podemos subdividirlas (opcionalmente con algo de superposición) para que cada ejemplo de entrenamiento esté compuesto por una parte de una conversación completa.

Las sesiones de chat de Facebook (1 por persona) a menudo abarcan varios días y conversaciones, por lo que las dependencias a largo plazo pueden no ser tan importantes de modelar de todos modos.

```python
# Our chat is alternating, we will make each datapoint a group of 8 messages,
# with 2 messages overlapping
chunk_size = 8
overlap = 2

training_examples = [
    conversation_messages[i : i + chunk_size]
    for conversation_messages in training_data
    for i in range(0, len(conversation_messages) - chunk_size + 1, chunk_size - overlap)
]

len(training_examples)
```

```output
100
```

## 4. Ajustar el modelo

Es hora de ajustar el modelo. Asegúrate de tener `openai` instalado
y haber establecido tu `OPENAI_API_KEY` apropiadamente

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
for m in training_examples:
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
File file-ULumAXLEFw3vB6bb9uy6DNVC ready after 0.00 seconds.
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
Status=[running]... 874.29s. 56.93s
```

```python
print(job.fine_tuned_model)
```

```output
ft:gpt-3.5-turbo-0613:personal::8QnAzWMr
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
        ("human", "{input}"),
    ]
)

chain = prompt | model | StrOutputParser()
```

```python
for tok in chain.stream({"input": "What classes are you taking?"}):
    print(tok, end="", flush=True)
```

```output
I'm taking Charms, Defense Against the Dark Arts, Herbology, Potions, Transfiguration, and Ancient Runes. How about you?
```
