---
translated: true
---

# Google Spanner

> [Google Cloud Spanner](https://cloud.google.com/spanner) est une base de données hautement évolutive qui combine une évolutivité illimitée avec une sémantique relationnelle, telle que des index secondaires, une forte cohérence, des schémas et SQL, offrant une disponibilité de 99,999 % dans une seule solution facile à utiliser.

Ce notebook explique comment utiliser `Spanner` pour stocker l'historique des messages de chat avec la classe `SpannerChatMessageHistory`.
En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-spanner-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-spanner-python/blob/main/samples/chat_message_history.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez faire ce qui suit :

 * [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Activer l'API Cloud Spanner](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)
 * [Créer une instance Spanner](https://cloud.google.com/spanner/docs/create-manage-instances)
 * [Créer une base de données Spanner](https://cloud.google.com/spanner/docs/create-manage-databases)

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans son propre package `langchain-google-spanner`, nous devons donc l'installer.

```python
%pip install --upgrade --quiet langchain-google-spanner
```

**Colab uniquement :** Décommentez la cellule suivante pour redémarrer le noyau ou utilisez le bouton pour le faire. Pour Vertex AI Workbench, vous pouvez redémarrer le terminal à l'aide du bouton en haut.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 Authentification

Authentifiez-vous sur Google Cloud en tant qu'utilisateur IAM connecté à ce notebook afin d'accéder à votre projet Google Cloud.

* Si vous utilisez Colab pour exécuter ce notebook, utilisez la cellule ci-dessous et continuez.
* Si vous utilisez Vertex AI Workbench, consultez les instructions de configuration [ici](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
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

### 💡 Activation de l'API

Le package `langchain-google-spanner` nécessite que vous [activiez l'API Spanner](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com) dans votre projet Google Cloud.

```python
# enable Spanner API
!gcloud services enable spanner.googleapis.com
```

## Utilisation de base

### Définir les valeurs de la base de données Spanner

Trouvez vos valeurs de base de données dans la [page des instances Spanner](https://console.cloud.google.com/spanner).

```python
# @title Set Your Values Here { display-mode: "form" }
INSTANCE = "my-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### Initialiser une table

La classe `SpannerChatMessageHistory` nécessite une table de base de données avec un schéma spécifique afin de stocker l'historique des messages de chat.

La méthode d'assistance `init_chat_history_table()` peut être utilisée pour créer une table avec le schéma approprié pour vous.

```python
from langchain_google_spanner import (
    SpannerChatMessageHistory,
)

SpannerChatMessageHistory.init_chat_history_table(table_name=TABLE_NAME)
```

### SpannerChatMessageHistory

Pour initialiser la classe `SpannerChatMessageHistory`, vous devez fournir seulement 3 éléments :

1. `instance_id` - Le nom de l'instance Spanner
1. `database_id` - Le nom de la base de données Spanner
1. `session_id` - Un identifiant unique qui spécifie un ID pour la session.
1. `table_name` - Le nom de la table dans la base de données pour stocker l'historique des messages de chat.

```python
message_history = SpannerChatMessageHistory(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    session_id="user-session-id",
)

message_history.add_user_message("hi!")
message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

## Client personnalisé

Le client créé par défaut est le client par défaut. Pour utiliser un non-défaut, un [client personnalisé](https://cloud.google.com/spanner/docs/samples/spanner-create-client-with-query-options#spanner_create_client_with_query_options-python) peut être transmis au constructeur.

```python
from google.cloud import spanner

custom_client_message_history = SpannerChatMessageHistory(
    instance_id="my-instance",
    database_id="my-database",
    client=spanner.Client(...),
)
```

## Nettoyage

Lorsque l'historique d'une session spécifique est obsolète et peut être supprimé, cela peut être fait de la manière suivante.
Remarque : Une fois supprimées, les données ne sont plus stockées dans Cloud Spanner et sont définitivement perdues.

```python
message_history = SpannerChatMessageHistory(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    session_id="user-session-id",
)

message_history.clear()
```
