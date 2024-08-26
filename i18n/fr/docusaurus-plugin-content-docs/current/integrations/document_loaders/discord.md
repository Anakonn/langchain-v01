---
translated: true
---

# Discord

>[Discord](https://discord.com/) est une plateforme sociale de VoIP et de messagerie instantanée. Les utilisateurs ont la possibilité de communiquer par appels vocaux, appels vidéo, messagerie texte, médias et fichiers dans des discussions privées ou dans le cadre de communautés appelées "serveurs". Un serveur est un ensemble de salons de discussion et de canaux vocaux persistants accessibles via des liens d'invitation.

Suivez ces étapes pour télécharger vos données `Discord` :

1. Allez dans vos **Paramètres utilisateur**
2. Puis allez dans **Confidentialité et sécurité**
3. Rendez-vous sur la section **Demander toutes mes données** et cliquez sur le bouton **Demander les données**

Il peut falloir jusqu'à 30 jours pour recevoir vos données. Vous recevrez un e-mail à l'adresse enregistrée avec Discord. Cet e-mail contiendra un bouton de téléchargement à l'aide duquel vous pourrez télécharger vos données Discord personnelles.

```python
import os

import pandas as pd
```

```python
path = input('Please enter the path to the contents of the Discord "messages" folder: ')
li = []
for f in os.listdir(path):
    expected_csv_path = os.path.join(path, f, "messages.csv")
    csv_exists = os.path.isfile(expected_csv_path)
    if csv_exists:
        df = pd.read_csv(expected_csv_path, index_col=None, header=0)
        li.append(df)

df = pd.concat(li, axis=0, ignore_index=True, sort=False)
```

```python
from langchain_community.document_loaders.discord import DiscordChatLoader
```

```python
loader = DiscordChatLoader(df, user_id_col="ID")
print(loader.load())
```
