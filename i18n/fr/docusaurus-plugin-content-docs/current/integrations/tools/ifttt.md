---
translated: true
---

# IFTTT WebHooks

Ce cahier montre comment utiliser les webhooks IFTTT.

Depuis https://github.com/SidU/teams-langchain-js/wiki/Connecting-IFTTT-Services.

## Créer un webhook

- Allez sur https://ifttt.com/create

## Configurer le "If This"

- Cliquez sur le bouton "If This" dans l'interface IFTTT.
- Recherchez "Webhooks" dans la barre de recherche.
- Choisissez la première option pour "Recevoir une requête web avec une charge utile JSON".
- Choisissez un nom d'événement spécifique au service que vous prévoyez de connecter.
Cela vous aidera à gérer plus facilement l'URL du webhook.
Par exemple, si vous vous connectez à Spotify, vous pourriez utiliser "Spotify" comme nom d'événement.
- Cliquez sur le bouton "Créer le déclencheur" pour enregistrer vos paramètres et créer votre webhook.

## Configurer le "Then That"

- Appuyez sur le bouton "Then That" dans l'interface IFTTT.
- Recherchez le service que vous souhaitez connecter, comme Spotify.
- Choisissez une action à partir du service, comme "Ajouter un morceau à une playlist".
- Configurez l'action en spécifiant les détails nécessaires, comme le nom de la playlist, par exemple "Chansons de l'IA".
- Référencez la charge utile JSON reçue par le webhook dans votre action. Pour le scénario Spotify, choisissez "{{JsonPayload}}" comme requête de recherche.
- Appuyez sur le bouton "Créer l'action" pour enregistrer les paramètres de votre action.
- Une fois que vous avez terminé de configurer votre action, cliquez sur le bouton "Terminer" pour compléter la configuration.
- Félicitations ! Vous avez réussi à connecter le webhook au service souhaité et vous êtes prêt à commencer à recevoir des données et à déclencher des actions 🎉

## Finaliser

- Pour obtenir l'URL de votre webhook, allez sur https://ifttt.com/maker_webhooks/settings
- Copiez la valeur de la clé IFTTT à cet endroit. L'URL est de la forme https://maker.ifttt.com/use/YOUR_IFTTT_KEY. Récupérez la valeur de YOUR_IFTTT_KEY.

```python
from langchain_community.tools.ifttt import IFTTTWebhook
```

```python
import os

key = os.environ["IFTTTKey"]
url = f"https://maker.ifttt.com/trigger/spotify/json/with/key/{key}"
tool = IFTTTWebhook(
    name="Spotify", description="Add a song to spotify playlist", url=url
)
```

```python
tool.run("taylor swift")
```

```output
"Congratulations! You've fired the spotify JSON event"
```
