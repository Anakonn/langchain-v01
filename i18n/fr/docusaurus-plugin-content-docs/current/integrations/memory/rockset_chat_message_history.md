---
translated: true
---

# Rockset

>[Rockset](https://rockset.com/product/) est un service de base de données d'analyse en temps réel pour servir des requêtes analytiques à faible latence et à forte concurrence à grande échelle. Il construit un Converged Index™ sur des données structurées et semi-structurées avec un magasin efficace pour les vecteurs d'intégration. Son support pour l'exécution de SQL sur des données sans schéma en fait un choix parfait pour l'exécution de la recherche vectorielle avec des filtres de métadonnées.

Ce notebook explique comment utiliser [Rockset](https://rockset.com/docs) pour stocker l'historique des messages de discussion.

## Configuration

```python
%pip install --upgrade --quiet  rockset
```

Pour commencer, obtenez votre clé API depuis la [console Rockset](https://console.rockset.com/apikeys). Trouvez votre région API pour la [référence API Rockset](https://rockset.com/docs/rest-api#introduction).

## Exemple

```python
from langchain_community.chat_message_histories import (
    RocksetChatMessageHistory,
)
from rockset import Regions, RocksetClient

history = RocksetChatMessageHistory(
    session_id="MySession",
    client=RocksetClient(
        api_key="YOUR API KEY",
        host=Regions.usw2a1,  # us-west-2 Oregon
    ),
    collection="langchain_demo",
    sync=True,
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
print(history.messages)
```

La sortie devrait ressembler à quelque chose comme :

```python
[
    HumanMessage(content='hi!', additional_kwargs={'id': '2e62f1c2-e9f7-465e-b551-49bae07fe9f0'}, example=False),
    AIMessage(content='whats up?', additional_kwargs={'id': 'b9be8eda-4c18-4cf8-81c3-e91e876927d0'}, example=False)
]

```
