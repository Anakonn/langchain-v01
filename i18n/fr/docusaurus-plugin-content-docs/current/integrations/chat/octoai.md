---
translated: true
---

# ChatOctoAI

[OctoAI](https://docs.octoai.cloud/docs) offre un accès facile à un calcul efficace et permet aux utilisateurs d'intégrer le modèle d'IA de leur choix dans leurs applications. Le service de calcul `OctoAI` vous aide à exécuter, à optimiser et à mettre à l'échelle vos applications d'IA facilement.

Ce notebook démontre l'utilisation de `langchain.chat_models.ChatOctoAI` pour les [points de terminaison OctoAI](https://octoai.cloud/text).

## Configuration

Pour exécuter notre application exemple, il y a deux étapes simples à suivre :

1. Obtenez un jeton API à partir de [votre page de compte OctoAI](https://octoai.cloud/settings).

2. Collez votre jeton API dans la cellule de code ci-dessous ou utilisez l'argument de mot-clé `octoai_api_token`.

Remarque : Si vous souhaitez utiliser un modèle différent des [modèles disponibles](https://octoai.cloud/text?selectedTags=Chat), vous pouvez conteneuriser le modèle et créer un point de terminaison OctoAI personnalisé en suivant [Construire un conteneur à partir de Python](https://octo.ai/docs/bring-your-own-model/advanced-build-a-container-from-scratch-in-python) et [Créer un point de terminaison personnalisé à partir d'un conteneur](https://octo.ai/docs/bring-your-own-model/create-custom-endpoints-from-a-container/create-custom-endpoints-from-a-container), puis mettre à jour votre variable d'environnement `OCTOAI_API_BASE`.

```python
import os

os.environ["OCTOAI_API_TOKEN"] = "OCTOAI_API_TOKEN"
```

```python
from langchain_community.chat_models import ChatOctoAI
from langchain_core.messages import HumanMessage, SystemMessage
```

## Exemple

```python
chat = ChatOctoAI(max_tokens=300, model_name="mixtral-8x7b-instruct")
```

```python
messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Tell me about Leonardo da Vinci briefly."),
]
print(chat(messages).content)
```

Léonard de Vinci (1452-1519) était un polymathe italien souvent considéré comme l'un des plus grands peintres de l'histoire. Cependant, son génie s'étendait bien au-delà de l'art. Il était également scientifique, inventeur, mathématicien, ingénieur, anatomiste, géologue et cartographe.

De Vinci est surtout connu pour ses peintures comme la Joconde, La Cène et La Vierge aux rochers. Ses études scientifiques étaient en avance sur leur temps, et ses carnets contiennent des dessins et des descriptions détaillés de diverses machines, de l'anatomie humaine et de phénomènes naturels.

Malgré l'absence de formation officielle, la curiosité insatiable et les compétences d'observation de de Vinci en ont fait un pionnier dans de nombreux domaines. Son travail continue d'inspirer et d'influencer les artistes, les scientifiques et les penseurs d'aujourd'hui.
