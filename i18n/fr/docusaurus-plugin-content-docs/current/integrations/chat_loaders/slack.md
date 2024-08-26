---
translated: true
---

# Slack

Ce cahier de notes montre comment utiliser le chargeur de discussion Slack. Cette classe aide à mapper les conversations Slack exportées vers les messages de discussion LangChain.

Le processus comporte trois étapes :
1. Exportez le fil de discussion souhaité en suivant les [instructions ici](https://slack.com/help/articles/1500001548241-Request-to-export-all-conversations).
2. Créez le `SlackChatLoader` avec le chemin du fichier pointant vers le fichier JSON ou le répertoire des fichiers JSON
3. Appelez `loader.load()` (ou `loader.lazy_load()`) pour effectuer la conversion. Utilisez éventuellement `merge_chat_runs` pour combiner les messages du même expéditeur en séquence et/ou `map_ai_messages` pour convertir les messages du destinataire spécifié en classe "AIMessage".

## 1. Créer un dump de messages

Actuellement (2023/08/23), ce chargeur prend mieux en charge un répertoire zip de fichiers au format généré par l'exportation de votre conversation de message direct depuis Slack. Suivez les instructions à jour de Slack pour le faire.

Nous avons un exemple dans le référentiel LangChain.

```python
import requests

permalink = "https://raw.githubusercontent.com/langchain-ai/langchain/342087bdfa3ac31d622385d0f2d09cf5e06c8db3/libs/langchain/tests/integration_tests/examples/slack_export.zip"
response = requests.get(permalink)
with open("slack_dump.zip", "wb") as f:
    f.write(response.content)
```

## 2. Créer le chargeur de discussion

Fournissez le chargeur avec le chemin du fichier vers le répertoire zip. Vous pouvez éventuellement spécifier l'identifiant utilisateur qui correspond à un message IA ainsi que configurer si vous souhaitez fusionner les séquences de messages.

```python
from langchain_community.chat_loaders.slack import SlackChatLoader
```

```python
loader = SlackChatLoader(
    path="slack_dump.zip",
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
# Convert messages from "U0500003428" to AI messages
messages: List[ChatSession] = list(
    map_ai_messages(merged_messages, sender="U0500003428")
)
```

### Prochaines étapes

Vous pouvez ensuite utiliser ces messages comme bon vous semble, comme l'affinage d'un modèle, la sélection d'exemples few-shot ou faire directement des prédictions pour le message suivant.

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
