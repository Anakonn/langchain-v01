---
translated: true
---

# Google Bigtable

> [Google Cloud Bigtable](https://cloud.google.com/bigtable) est un magasin de clés-valeurs et de colonnes larges, idéal pour un accès rapide aux données structurées, semi-structurées ou non structurées. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations Langchain de Bigtable.

Ce notebook explique comment utiliser [Google Cloud Bigtable](https://cloud.google.com/bigtable) pour stocker l'historique des messages de chat avec la classe `BigtableChatMessageHistory`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-bigtable-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-bigtable-python/blob/main/docs/chat_message_history.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez faire ce qui suit :

* [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Activer l'API Bigtable](https://console.cloud.google.com/flows/enableapi?apiid=bigtable.googleapis.com)
* [Créer une instance Bigtable](https://cloud.google.com/bigtable/docs/creating-instance)
* [Créer une table Bigtable](https://cloud.google.com/bigtable/docs/managing-tables)
* [Créer des identifiants d'accès Bigtable](https://developers.google.com/workspace/guides/create-credentials)

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans son propre package `langchain-google-bigtable`, nous devons donc l'installer.

```python
%pip install -upgrade --quiet langchain-google-bigtable
```

**Colab uniquement** : Décommentez la cellule suivante pour redémarrer le noyau ou utilisez le bouton pour le faire. Pour Vertex AI Workbench, vous pouvez redémarrer le terminal à l'aide du bouton en haut.

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

### Initialiser le schéma Bigtable

Le schéma de `BigtableChatMessageHistory` nécessite que l'instance et la table existent, et qu'elles aient une famille de colonnes appelée `langchain`.

```python
# @markdown Please specify an instance and a table for demo purpose.
INSTANCE_ID = "my_instance"  # @param {type:"string"}
TABLE_ID = "my_table"  # @param {type:"string"}
```

Si la table ou la famille de colonnes n'existent pas, vous pouvez utiliser la fonction suivante pour les créer :

```python
from google.cloud import bigtable
from langchain_google_bigtable import create_chat_history_table

create_chat_history_table(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)
```

### BigtableChatMessageHistory

Pour initialiser la classe `BigtableChatMessageHistory`, vous n'avez besoin que de 3 choses :

1. `instance_id` - L'instance Bigtable à utiliser pour l'historique des messages de chat.
1. `table_id` : La table Bigtable pour stocker l'historique des messages de chat.
1. `session_id` - Une chaîne d'identification unique qui spécifie un identifiant pour la session.

```python
from langchain_google_bigtable import BigtableChatMessageHistory

message_history = BigtableChatMessageHistory(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
    session_id="user-session-id",
)

message_history.add_user_message("hi!")
message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

#### Nettoyage

Lorsque l'historique d'une session spécifique est obsolète et peut être supprimé, cela peut être fait de la manière suivante.

**Remarque :** Une fois supprimées, les données ne sont plus stockées dans Bigtable et sont définitivement perdues.

```python
message_history.clear()
```

## Utilisation avancée

### Client personnalisé

Le client créé par défaut est le client par défaut, en utilisant uniquement l'option admin=True. Pour utiliser un client non par défaut, un [client personnalisé](https://cloud.google.com/python/docs/reference/bigtable/latest/client#class-googlecloudbigtableclientclientprojectnone-credentialsnone-readonlyfalse-adminfalse-clientinfonone-clientoptionsnone-adminclientoptionsnone-channelnone) peut être transmis au constructeur.

```python
from google.cloud import bigtable

client = (bigtable.Client(...),)

create_chat_history_table(
    instance_id="my-instance",
    table_id="my-table",
    client=client,
)

custom_client_message_history = BigtableChatMessageHistory(
    instance_id="my-instance",
    table_id="my-table",
    client=client,
)
```
