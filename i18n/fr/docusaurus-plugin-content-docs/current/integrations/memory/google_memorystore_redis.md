---
translated: true
---

# Google Memorystore pour Redis

> [Google Cloud Memorystore pour Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) est un service entièrement géré alimenté par la base de données Redis en mémoire pour construire des caches d'applications qui offrent un accès aux données en moins d'une milliseconde. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations Langchain de Memorystore pour Redis.

Ce notebook explique comment utiliser [Google Cloud Memorystore pour Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) pour stocker l'historique des messages de chat avec la classe `MemorystoreChatMessageHistory`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/chat_message_history.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez faire ce qui suit :

* [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Activer l'API Memorystore pour Redis](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [Créer une instance Memorystore pour Redis](https://cloud.google.com/memorystore/docs/redis/create-instance-console). Assurez-vous que la version est supérieure ou égale à 5.0.

Après avoir confirmé l'accès à la base de données dans l'environnement d'exécution de ce notebook, remplissez les valeurs suivantes et exécutez la cellule avant d'exécuter les scripts d'exemple.

```python
# @markdown Please specify an endpoint associated with the instance or demo purpose.
ENDPOINT = "redis://127.0.0.1:6379"  # @param {type:"string"}
```

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans son propre package `langchain-google-memorystore-redis`, nous devons donc l'installer.

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis
```

**Colab uniquement :** Décommentez la cellule suivante pour redémarrer le noyau ou utilisez le bouton pour le faire. Pour Vertex AI Workbench, vous pouvez redémarrer le terminal à l'aide du bouton en haut.

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

* Si vous utilisez Colab pour exécuter ce notebook, utilisez la cellule ci-dessous et continuez.
* Si vous utilisez Vertex AI Workbench, consultez les instructions de configuration [ici](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

## Utilisation de base

### MemorystoreChatMessageHistory

Pour initialiser la classe `MemorystoreMessageHistory`, vous n'avez besoin que de 2 choses :

1. `redis_client` - Une instance d'un Memorystore Redis.
1. `session_id` - Chaque objet d'historique des messages de chat doit avoir un ID de session unique. Si l'ID de session a déjà des messages stockés dans Redis, ils pourront être récupérés.

```python
import redis
from langchain_google_memorystore_redis import MemorystoreChatMessageHistory

# Connect to a Memorystore for Redis instance
redis_client = redis.from_url("redis://127.0.0.1:6379")

message_history = MemorystoreChatMessageHistory(redis_client, session_id="session1")
```

```python
message_history.messages
```

#### Nettoyage

Lorsque l'historique d'une session spécifique est obsolète et peut être supprimé, cela peut être fait de la manière suivante.

**Remarque :** Une fois supprimées, les données ne sont plus stockées dans Memorystore pour Redis et sont définitivement perdues.

```python
message_history.clear()
```
