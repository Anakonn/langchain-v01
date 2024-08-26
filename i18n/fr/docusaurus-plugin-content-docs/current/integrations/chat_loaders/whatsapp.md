---
translated: true
---

# WhatsApp

Ce cahier montre comment utiliser le chargeur de conversations WhatsApp. Cette classe aide à mapper les conversations WhatsApp exportées vers les messages de chat LangChain.

Le processus comporte trois étapes :
1. Exporter les conversations de chat sur l'ordinateur
2. Créer le `WhatsAppChatLoader` avec le chemin du fichier pointant vers le fichier JSON ou le répertoire des fichiers JSON
3. Appeler `loader.load()` (ou `loader.lazy_load()`) pour effectuer la conversion.

## 1. Créer un dump de messages

Pour effectuer l'exportation de votre(vos) conversation(s) WhatsApp, suivez les étapes suivantes :

1. Ouvrez la conversation cible
2. Cliquez sur les trois points dans le coin supérieur droit et sélectionnez "Plus".
3. Puis sélectionnez "Exporter la conversation" et choisissez "Sans média".

Voici un exemple du format de données pour chaque conversation :

```python
%%writefile whatsapp_chat.txt
[8/15/23, 9:12:33 AM] Dr. Feather: ‎Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
[8/15/23, 9:12:43 AM] Dr. Feather: I spotted a rare Hyacinth Macaw yesterday in the Amazon Rainforest. Such a magnificent creature!
‎[8/15/23, 9:12:48 AM] Dr. Feather: ‎image omitted
[8/15/23, 9:13:15 AM] Jungle Jane: That's stunning! Were you able to observe its behavior?
‎[8/15/23, 9:13:23 AM] Dr. Feather: ‎image omitted
[8/15/23, 9:14:02 AM] Dr. Feather: Yes, it seemed quite social with other macaws. They're known for their playful nature.
[8/15/23, 9:14:15 AM] Jungle Jane: How's the research going on parrot communication?
‎[8/15/23, 9:14:30 AM] Dr. Feather: ‎image omitted
[8/15/23, 9:14:50 AM] Dr. Feather: It's progressing well. We're learning so much about how they use sound and color to communicate.
[8/15/23, 9:15:10 AM] Jungle Jane: That's fascinating! Can't wait to read your paper on it.
[8/15/23, 9:15:20 AM] Dr. Feather: Thank you! I'll send you a draft soon.
[8/15/23, 9:25:16 PM] Jungle Jane: Looking forward to it! Keep up the great work.
```

```output
Writing whatsapp_chat.txt
```

## 2. Créer le chargeur de chat

Le WhatsAppChatLoader accepte le fichier zip résultant, le répertoire décompressé ou le chemin de l'un des fichiers `.txt` de conversation.

Fournissez-le ainsi que le nom d'utilisateur que vous voulez prendre dans le rôle de "AI" lors de l'affinage.

```python
from langchain_community.chat_loaders.whatsapp import WhatsAppChatLoader
```

```python
loader = WhatsAppChatLoader(
    path="./whatsapp_chat.txt",
)
```

## 3. Charger les messages

Les méthodes `load()` (ou `lazy_load`) renvoient une liste de "ChatSessions" qui stockent actuellement la liste des messages par conversation chargée.

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
# Convert messages from "Dr. Feather" to AI messages
messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="Dr. Feather")
)
```

```output
[{'messages': [AIMessage(content='I spotted a rare Hyacinth Macaw yesterday in the Amazon Rainforest. Such a magnificent creature!', additional_kwargs={'sender': 'Dr. Feather', 'events': [{'message_time': '8/15/23, 9:12:43 AM'}]}, example=False),
   HumanMessage(content="That's stunning! Were you able to observe its behavior?", additional_kwargs={'sender': 'Jungle Jane', 'events': [{'message_time': '8/15/23, 9:13:15 AM'}]}, example=False),
   AIMessage(content="Yes, it seemed quite social with other macaws. They're known for their playful nature.", additional_kwargs={'sender': 'Dr. Feather', 'events': [{'message_time': '8/15/23, 9:14:02 AM'}]}, example=False),
   HumanMessage(content="How's the research going on parrot communication?", additional_kwargs={'sender': 'Jungle Jane', 'events': [{'message_time': '8/15/23, 9:14:15 AM'}]}, example=False),
   AIMessage(content="It's progressing well. We're learning so much about how they use sound and color to communicate.", additional_kwargs={'sender': 'Dr. Feather', 'events': [{'message_time': '8/15/23, 9:14:50 AM'}]}, example=False),
   HumanMessage(content="That's fascinating! Can't wait to read your paper on it.", additional_kwargs={'sender': 'Jungle Jane', 'events': [{'message_time': '8/15/23, 9:15:10 AM'}]}, example=False),
   AIMessage(content="Thank you! I'll send you a draft soon.", additional_kwargs={'sender': 'Dr. Feather', 'events': [{'message_time': '8/15/23, 9:15:20 AM'}]}, example=False),
   HumanMessage(content='Looking forward to it! Keep up the great work.', additional_kwargs={'sender': 'Jungle Jane', 'events': [{'message_time': '8/15/23, 9:25:16 PM'}]}, example=False)]}]
```

### Prochaines étapes

Vous pouvez ensuite utiliser ces messages comme bon vous semble, comme l'affinage d'un modèle, la sélection d'exemples few-shot ou faire directement des prédictions pour le message suivant.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```

```output
Thank you for the encouragement! I'll do my best to continue studying and sharing fascinating insights about parrot communication.
```
