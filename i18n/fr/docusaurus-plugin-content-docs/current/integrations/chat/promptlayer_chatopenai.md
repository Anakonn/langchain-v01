---
sidebar_label: PromptLayer ChatOpenAI
translated: true
---

# PromptLayerChatOpenAI

Cet exemple montre comment se connecter à [PromptLayer](https://www.promptlayer.com) pour commencer à enregistrer vos requêtes ChatOpenAI.

## Installer PromptLayer

Le package `promptlayer` est requis pour utiliser PromptLayer avec OpenAI. Installez `promptlayer` à l'aide de pip.

```python
pip install promptlayer
```

## Imports

```python
import os

from langchain_community.chat_models import PromptLayerChatOpenAI
from langchain_core.messages import HumanMessage
```

## Définir la clé d'API d'environnement

Vous pouvez créer une clé d'API PromptLayer sur [www.promptlayer.com](https://www.promptlayer.com) en cliquant sur l'icône des paramètres dans la barre de navigation.

Définissez-la comme une variable d'environnement appelée `PROMPTLAYER_API_KEY`.

```python
os.environ["PROMPTLAYER_API_KEY"] = "**********"
```

## Utiliser le LLM PromptLayerOpenAI comme d'habitude

*Vous pouvez éventuellement passer `pl_tags` pour suivre vos requêtes avec la fonctionnalité de balisage de PromptLayer.*

```python
chat = PromptLayerChatOpenAI(pl_tags=["langchain"])
chat([HumanMessage(content="I am a cat and I want")])
```

```output
AIMessage(content='to take a nap in a cozy spot. I search around for a suitable place and finally settle on a soft cushion on the window sill. I curl up into a ball and close my eyes, relishing the warmth of the sun on my fur. As I drift off to sleep, I can hear the birds chirping outside and feel the gentle breeze blowing through the window. This is the life of a contented cat.', additional_kwargs={})
```

**La requête ci-dessus devrait maintenant apparaître sur votre [tableau de bord PromptLayer](https://www.promptlayer.com).**

## Utilisation du suivi PromptLayer

Si vous souhaitez utiliser l'une des [fonctionnalités de suivi PromptLayer](https://magniv.notion.site/Track-4deee1b1f7a34c1680d085f82567dab9), vous devez passer l'argument `return_pl_id` lors de l'instanciation du LLM PromptLayer pour obtenir l'ID de la requête.

```python
import promptlayer

chat = PromptLayerChatOpenAI(return_pl_id=True)
chat_results = chat.generate([[HumanMessage(content="I am a cat and I want")]])

for res in chat_results.generations:
    pl_request_id = res[0].generation_info["pl_request_id"]
    promptlayer.track.score(request_id=pl_request_id, score=100)
```

Cela vous permet de suivre les performances de votre modèle dans le tableau de bord PromptLayer. Si vous utilisez un modèle de prompt, vous pouvez également attacher un modèle à une requête.
Dans l'ensemble, cela vous donne la possibilité de suivre les performances de différents modèles et modèles de prompt dans le tableau de bord PromptLayer.
