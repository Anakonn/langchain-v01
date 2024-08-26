---
translated: true
---

# Google Firestore (Mode natif)

> [Google Cloud Firestore](https://cloud.google.com/firestore) est une base de données sans serveur orientée document qui s'adapte à toute demande. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations Langchain de `Firestore`.

Ce notebook explique comment utiliser [Google Cloud Firestore](https://cloud.google.com/firestore) pour stocker l'historique des messages de chat avec la classe `FirestoreChatMessageHistory`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-firestore-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/chat_message_history.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez faire ce qui suit :

* [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Activer l'API Firestore](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [Créer une base de données Firestore](https://cloud.google.com/firestore/docs/manage-databases)

Après avoir confirmé l'accès à la base de données dans l'environnement d'exécution de ce notebook, remplissez les valeurs suivantes et exécutez la cellule avant d'exécuter les scripts d'exemple.

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans son propre package `langchain-google-firestore`, nous devons donc l'installer.

```python
%pip install -upgrade --quiet langchain-google-firestore
```

**Colab uniquement** : Décommentez la cellule suivante pour redémarrer le noyau ou utilisez le bouton pour redémarrer le noyau. Pour Vertex AI Workbench, vous pouvez redémarrer le terminal à l'aide du bouton en haut.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Définissez votre projet Google Cloud

Définissez votre projet Google Cloud afin de pouvoir utiliser les ressources Google Cloud dans ce notebook.

Si vous ne connaissez pas votre ID de projet, essayez ce qui suit :

* Exécutez `gcloud config list`.
* Exécutez `gcloud projects list`.
* Consultez la page d'assistance : [Localiser l'ID du projet](https://support.google.com/googleapi/answer/7014113).

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 Authentification

Authentifiez-vous sur Google Cloud en tant qu'utilisateur IAM connecté à ce notebook afin d'accéder à votre projet Google Cloud.

- Si vous utilisez Colab pour exécuter ce notebook, utilisez la cellule ci-dessous et continuez.
- Si vous utilisez Vertex AI Workbench, consultez les instructions de configuration [ici](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

## Utilisation de base

### FirestoreChatMessageHistory

Pour initialiser la classe `FirestoreChatMessageHistory`, vous n'avez besoin que de 3 choses :

1. `session_id` - Une chaîne d'identification unique qui spécifie un identifiant pour la session.
1. `collection` : Le chemin `/`-délimité unique vers une collection Firestore.

```python
from langchain_google_firestore import FirestoreChatMessageHistory

chat_history = FirestoreChatMessageHistory(
    session_id="user-session-id", collection="HistoryMessages"
)

chat_history.add_user_message("Hi!")
chat_history.add_ai_message("How can I help you?")
```

```python
chat_history.messages
```

#### Nettoyage

Lorsque l'historique d'une session spécifique est obsolète et peut être supprimé de la base de données et de la mémoire, cela peut être fait de la manière suivante.

**Remarque :** Une fois supprimées, les données ne sont plus stockées dans Firestore et sont définitivement perdues.

```python
chat_history.clear()
```

### Client personnalisé

Le client est créé par défaut en utilisant les variables d'environnement disponibles. Un [client personnalisé](https://cloud.google.com/python/docs/reference/firestore/latest/client) peut être transmis au constructeur.

```python
from google.auth import compute_engine
from google.cloud import firestore

client = firestore.Client(
    project="project-custom",
    database="non-default-database",
    credentials=compute_engine.Credentials(),
)

history = FirestoreChatMessageHistory(
    session_id="session-id", collection="History", client=client
)

history.add_user_message("New message")

history.messages

history.clear()
```
