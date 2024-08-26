---
translated: true
---

# PromptLayer OpenAI

`PromptLayer` est la première plateforme qui vous permet de suivre, de gérer et de partager votre ingénierie des invites GPT. `PromptLayer` agit comme un intergiciel entre votre code et la bibliothèque python `OpenAI`.

`PromptLayer` enregistre toutes vos demandes `OpenAI API`, vous permettant de rechercher et d'explorer l'historique des demandes dans le tableau de bord `PromptLayer`.

Cet exemple montre comment se connecter à [PromptLayer](https://www.promptlayer.com) pour commencer à enregistrer vos demandes OpenAI.

Un autre exemple se trouve [ici](/docs/integrations/providers/promptlayer).

## Installer PromptLayer

Le package `promptlayer` est requis pour utiliser PromptLayer avec OpenAI. Installez `promptlayer` à l'aide de pip.

```python
%pip install --upgrade --quiet  promptlayer
```

## Imports

```python
import os

import promptlayer
from langchain_community.llms import PromptLayerOpenAI
```

## Définir la clé API d'environnement

Vous pouvez créer une clé API PromptLayer sur [www.promptlayer.com](https://www.promptlayer.com) en cliquant sur l'icône des paramètres dans la barre de navigation.

Définissez-la comme une variable d'environnement appelée `PROMPTLAYER_API_KEY`.

Vous avez également besoin d'une clé OpenAI, appelée `OPENAI_API_KEY`.

```python
from getpass import getpass

PROMPTLAYER_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["PROMPTLAYER_API_KEY"] = PROMPTLAYER_API_KEY
```

```python
from getpass import getpass

OPENAI_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

## Utilisez le LLM PromptLayerOpenAI comme d'habitude

*Vous pouvez éventuellement passer `pl_tags` pour suivre vos demandes avec la fonctionnalité de balisage de PromptLayer.*

```python
llm = PromptLayerOpenAI(pl_tags=["langchain"])
llm("I am a cat and I want")
```

**La demande ci-dessus devrait maintenant apparaître sur votre [tableau de bord PromptLayer](https://www.promptlayer.com).**

## Utilisation du suivi PromptLayer

Si vous souhaitez utiliser l'une des [fonctionnalités de suivi PromptLayer](https://magniv.notion.site/Track-4deee1b1f7a34c1680d085f82567dab9), vous devez passer l'argument `return_pl_id` lors de l'instanciation du LLM PromptLayer pour obtenir l'ID de la demande.

```python
llm = PromptLayerOpenAI(return_pl_id=True)
llm_results = llm.generate(["Tell me a joke"])

for res in llm_results.generations:
    pl_request_id = res[0].generation_info["pl_request_id"]
    promptlayer.track.score(request_id=pl_request_id, score=100)
```

Cela vous permet de suivre les performances de votre modèle dans le tableau de bord PromptLayer. Si vous utilisez un modèle d'invite, vous pouvez également attacher un modèle à une demande.
Dans l'ensemble, cela vous donne l'opportunité de suivre les performances de différents modèles et modèles d'invite dans le tableau de bord PromptLayer.
