---
translated: true
---

# Facebook Messenger

Ce carnet de notes montre comment charger des données de Facebook dans un format que vous pouvez affiner. Les étapes générales sont les suivantes :

1. Téléchargez vos données de messagerie sur le disque.
2. Créez le `ChatLoader` et appelez `loader.load()` (ou `loader.lazy_load()`) pour effectuer la conversion.
3. Optionnellement, utilisez `merge_chat_runs` pour combiner les messages du même expéditeur en séquence et/ou `map_ai_messages` pour convertir les messages du destinataire spécifié en classe "AIMessage". Une fois que vous avez fait cela, appelez `convert_messages_for_finetuning` pour préparer vos données pour l'affinage.

Une fois cela fait, vous pouvez affiner votre modèle. Pour ce faire, vous devriez suivre les étapes suivantes :

4. Téléchargez vos messages sur OpenAI et lancez un travail d'affinage.
6. Utilisez le modèle résultant dans votre application LangChain !

Commençons.

## 1. Télécharger les données

Pour télécharger vos propres données de messagerie, suivez les instructions [ici](https://www.zapptales.com/en/download-facebook-messenger-chat-history-how-to/). IMPORTANT - assurez-vous de les télécharger au format JSON (pas en HTML).

Nous hébergeons un exemple de vidage à [ce lien Google Drive](https://drive.google.com/file/d/1rh1s1o2i7B-Sk1v9o8KNgivLVGwJ-osV/view?usp=sharing) que nous utiliserons dans cette présentation.

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

## 2. Créer le Chat Loader

Nous avons 2 classes `FacebookMessengerChatLoader` différentes, l'une pour un répertoire entier de discussions et l'autre pour charger des fichiers individuels. Nous

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

## 3. Se préparer pour l'affinage

L'appel de `load()` renvoie tous les messages de discussion que nous avons pu extraire en tant que messages humains. Lors de la conversation avec des chatbots, les conversations suivent généralement un schéma de dialogue plus strict et alternatif par rapport aux vraies conversations.

Vous pouvez choisir de fusionner les "runs" de messages (messages consécutifs du même expéditeur) et de sélectionner un expéditeur pour représenter l'"IA". Le LLM affiné apprendra à générer ces messages IA.

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

#### Maintenant, nous pouvons les convertir en dictionnaires au format OpenAI

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

OpenAI nécessite actuellement au moins 10 exemples d'entraînement pour un travail d'affinage, bien qu'ils recommandent entre 50 et 100 pour la plupart des tâches. Comme nous n'avons que 9 sessions de discussion, nous pouvons les subdiviser (éventuellement avec un certain chevauchement) afin que chaque exemple d'entraînement soit composé d'une partie d'une conversation complète.

Les sessions de discussion Facebook (1 par personne) s'étendent souvent sur plusieurs jours et conversations, donc les dépendances à long terme peuvent ne pas être si importantes à modéliser de toute façon.

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
Status=[running]... 874.29s. 56.93s
```

```python
print(job.fine_tuned_model)
```

```output
ft:gpt-3.5-turbo-0613:personal::8QnAzWMr
```

## 5. Utiliser dans LangChain

Vous pouvez utiliser directement l'ID de modèle résultant dans la classe de modèle `ChatOpenAI`.

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
