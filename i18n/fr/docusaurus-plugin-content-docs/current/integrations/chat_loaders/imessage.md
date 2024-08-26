---
translated: true
---

# iMessage

Ce cahier montre comment utiliser le chargeur de discussion iMessage. Cette classe aide à convertir les conversations iMessage en messages de discussion LangChain.

Sur macOS, iMessage stocke les conversations dans une base de données sqlite à `~/Library/Messages/chat.db` (au moins pour macOS Ventura 13.4).
Le `IMessageChatLoader` charge à partir de ce fichier de base de données.

1. Créez le `IMessageChatLoader` avec le chemin du fichier pointant vers la base de données `chat.db` que vous souhaitez traiter.
2. Appelez `loader.load()` (ou `loader.lazy_load()`) pour effectuer la conversion. Utilisez éventuellement `merge_chat_runs` pour combiner les messages du même expéditeur en séquence et/ou `map_ai_messages` pour convertir les messages du destinataire spécifié en classe "AIMessage".

## 1. Accéder à la base de données de discussion

Il est probable que votre terminal n'ait pas accès à `~/Library/Messages`. Pour utiliser cette classe, vous pouvez copier la base de données dans un répertoire accessible (par exemple, Documents) et la charger à partir de là. Sinon (et ce n'est pas recommandé), vous pouvez accorder l'accès complet au disque pour votre émulateur de terminal dans Paramètres système > Sécurité et confidentialité > Accès complet au disque.

Nous avons créé une base de données d'exemple que vous pouvez utiliser à [ce lien](https://drive.google.com/file/d/1NebNKqTA2NXApCmeH6mu0unJD2tANZzo/view?usp=sharing).

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

## 2. Créer le chargeur de discussion

Fournissez le chargeur avec le chemin du fichier vers le répertoire zip. Vous pouvez éventuellement spécifier l'identifiant utilisateur qui correspond à un message IA et configurer si vous souhaitez fusionner les séquences de messages.

```python
from langchain_community.chat_loaders.imessage import IMessageChatLoader
```

```python
loader = IMessageChatLoader(
    path="./chat.db",
)
```

## 3. Charger les messages

Les méthodes `load()` (ou `lazy_load`) renvoient une liste de "ChatSessions" qui contiennent actuellement une liste de messages par conversation chargée. Tous les messages sont mappés sur des objets "HumanMessage" pour commencer.

Vous pouvez éventuellement choisir de fusionner les "séquences" de messages (messages consécutifs du même expéditeur) et de sélectionner un expéditeur pour représenter l'"IA". Le modèle de langage affiné apprendra à générer ces messages IA.

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

## 3. Se préparer pour l'affinage

Il est maintenant temps de convertir nos messages de discussion en dictionnaires OpenAI. Nous pouvons utiliser l'utilitaire `convert_messages_for_finetuning` pour le faire.

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

## 4. Affiner le modèle

Il est temps d'affiner le modèle. Assurez-vous d'avoir `openai` installé
et d'avoir défini votre `OPENAI_API_KEY` de manière appropriée

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

Avec le fichier prêt, il est temps de lancer un travail de formation.

```python
job = openai.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-3.5-turbo",
)
```

Prenez une tasse de thé pendant que votre modèle est en préparation. Cela peut prendre un certain temps !

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

## 5. Utiliser dans LangChain

Vous pouvez utiliser directement l'ID de modèle résultant dans la classe `ChatOpenAI`.

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
