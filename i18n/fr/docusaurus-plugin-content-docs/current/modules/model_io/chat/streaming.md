---
sidebar_position: 1.5
translated: true
---

# Streaming

Tous les ChatModels implémentent l'interface Runnable, qui comprend des implémentations par défaut de toutes les méthodes, c'est-à-dire ainvoke, batch, abatch, stream, astream. Cela donne à tous les ChatModels un support de base pour le streaming.

Le support du streaming par défaut consiste à renvoyer un Itérateur (ou AsyncItérateur dans le cas du streaming asynchrone) d'une seule valeur, le résultat final renvoyé par le fournisseur de ChatModel sous-jacent. Cela ne vous donne évidemment pas de streaming token par token, ce qui nécessite un support natif du fournisseur de ChatModel, mais s'assure que votre code qui s'attend à un itérateur de tokens peut fonctionner pour n'importe laquelle de nos intégrations de ChatModel.

Voir quelles [intégrations prennent en charge le streaming token par token ici](/docs/integrations/chat/).

```python
from langchain_community.chat_models import ChatAnthropic
```

```python
chat = ChatAnthropic(model="claude-2")
for chunk in chat.stream("Write me a song about goldfish on the moon"):
    print(chunk.content, end="", flush=True)
```

```output
 Here's a song I just improvised about goldfish on the moon:

Floating in space, looking for a place
To call their home, all alone
Swimming through stars, these goldfish from Mars
Left their fishbowl behind, a new life to find
On the moon, where the craters loom
Searching for food, maybe some lunar food
Out of their depth, close to death
How they wish, for just one small fish
To join them up here, their future unclear
On the moon, where the Earth looms
Dreaming of home, filled with foam
Their bodies adapt, continuing to last
On the moon, where they learn to swoon
Over cheese that astronauts tease
As they stare back at Earth, the planet of birth
These goldfish out of water, swim on and on
Lunar pioneers, conquering their fears
On the moon, where they happily swoon
```
