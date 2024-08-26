---
translated: true
---

# Telegram

Ce cahier montre comment utiliser le chargeur de discussion Telegram. Cette classe aide à mapper les conversations Telegram exportées vers les messages de discussion LangChain.

Le processus comporte trois étapes :
1. Exportez le fichier .txt de discussion en copiant les discussions depuis l'application Telegram et en les collant dans un fichier sur votre ordinateur local
2. Créez le `TelegramChatLoader` avec le chemin du fichier pointant vers le fichier JSON ou le répertoire des fichiers JSON
3. Appelez `loader.load()` (ou `loader.lazy_load()`) pour effectuer la conversion. Utilisez éventuellement `merge_chat_runs` pour combiner les messages du même expéditeur en séquence et/ou `map_ai_messages` pour convertir les messages du destinataire spécifié en classe "AIMessage".

## 1. Créer un fichier de messages

Actuellement (2023/08/23), ce chargeur prend mieux en charge les fichiers JSON au format généré par l'exportation de l'historique de vos discussions depuis l'[application de bureau Telegram](https://desktop.telegram.org/).

**Important :** Il existe des versions "lite" de Telegram comme "Telegram for MacOS" qui manquent de la fonctionnalité d'exportation. Assurez-vous d'utiliser l'application correcte pour exporter le fichier.

Pour effectuer l'exportation :
1. Téléchargez et ouvrez l'application de bureau Telegram
2. Sélectionnez une conversation
3. Accédez aux paramètres de la conversation (actuellement les trois points dans le coin supérieur droit)
4. Cliquez sur "Exporter l'historique de la discussion"
5. Désélectionnez les photos et autres médias. Sélectionnez le format "JSON lisible par machine" pour exporter.

Un exemple est ci-dessous :

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

## 2. Créer le chargeur de discussion

Tout ce qui est requis est le chemin du fichier. Vous pouvez éventuellement spécifier le nom d'utilisateur qui correspond à un message IA ainsi que configurer si vous souhaitez fusionner les séquences de messages.

```python
from langchain_community.chat_loaders.telegram import TelegramChatLoader
```

```python
loader = TelegramChatLoader(
    path="./telegram_conversation.json",
)
```

## 3. Charger les messages

Les méthodes `load()` (ou `lazy_load`) renvoient une liste de "ChatSessions" qui contiennent actuellement une liste de messages par conversation chargée.

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

### Prochaines étapes

Vous pouvez ensuite utiliser ces messages comme bon vous semble, comme l'affinage d'un modèle, la sélection d'exemples few-shot ou faire directement des prédictions pour le message suivant.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()

for chunk in llm.stream(messages[0]["messages"]):
    print(chunk.content, end="", flush=True)
```

```output
I said, "You better trust your conscience."
```
