---
translated: true
---

# Google Memorystore pour Redis

> [Google Memorystore pour Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) est un service entièrement géré qui s'appuie sur le magasin de données en mémoire Redis pour construire des caches d'applications offrant un accès aux données en sous-milliseconde. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations Langchain de Memorystore pour Redis.

Ce notebook explique comment utiliser [Memorystore pour Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) pour [enregistrer, charger et supprimer des documents Langchain](/docs/modules/data_connection/document_loaders/) avec `MemorystoreDocumentLoader` et `MemorystoreDocumentSaver`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/document_loader.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez faire ce qui suit :

* [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Activer l'API Memorystore pour Redis](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [Créer une instance Memorystore pour Redis](https://cloud.google.com/memorystore/docs/redis/create-instance-console). Assurez-vous que la version est supérieure ou égale à 5.0.

Après avoir confirmé l'accès à la base de données dans l'environnement d'exécution de ce notebook, remplissez les valeurs suivantes et exécutez la cellule avant d'exécuter les scripts d'exemple.

```python
# @markdown Please specify an endpoint associated with the instance and a key prefix for demo purpose.
ENDPOINT = "redis://127.0.0.1:6379"  # @param {type:"string"}
KEY_PREFIX = "doc:"  # @param {type:"string"}
```

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans son propre package `langchain-google-memorystore-redis`, nous devons donc l'installer.

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis
```

**Colab uniquement** : Décommentez la cellule suivante pour redémarrer le noyau ou utilisez le bouton pour redémarrer le noyau. Pour Vertex AI Workbench, vous pouvez redémarrer le terminal à l'aide du bouton en haut.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Définir votre projet Google Cloud

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

### Enregistrer des documents

Enregistrez les documents Langchain avec `MemorystoreDocumentSaver.add_documents(<documents>)`. Pour initialiser la classe `MemorystoreDocumentSaver`, vous devez fournir 2 éléments :

1. `client` - Un objet client `redis.Redis`.
1. `key_prefix` - Un préfixe pour les clés permettant de stocker les documents dans Redis.

Les documents seront stockés dans des clés générées de manière aléatoire avec le préfixe `key_prefix` spécifié. Vous pouvez également désigner les suffixes des clés en spécifiant `ids` dans la méthode `add_documents`.

```python
import redis
from langchain_core.documents import Document
from langchain_google_memorystore_redis import MemorystoreDocumentSaver

test_docs = [
    Document(
        page_content="Apple Granny Smith 150 0.99 1",
        metadata={"fruit_id": 1},
    ),
    Document(
        page_content="Banana Cavendish 200 0.59 0",
        metadata={"fruit_id": 2},
    ),
    Document(
        page_content="Orange Navel 80 1.29 1",
        metadata={"fruit_id": 3},
    ),
]
doc_ids = [f"{i}" for i in range(len(test_docs))]

redis_client = redis.from_url(ENDPOINT)
saver = MemorystoreDocumentSaver(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_field="page_content",
)
saver.add_documents(test_docs, ids=doc_ids)
```

### Charger des documents

Initialisez un chargeur qui charge tous les documents stockés dans l'instance Memorystore pour Redis avec un préfixe spécifique.

Chargez les documents Langchain avec `MemorystoreDocumentLoader.load()` ou `MemorystoreDocumentLoader.lazy_load()`. `lazy_load` renvoie un générateur qui ne requête la base de données que pendant l'itération. Pour initialiser la classe `MemorystoreDocumentLoader`, vous devez fournir :

1. `client` - Un objet client `redis.Redis`.
1. `key_prefix` - Un préfixe pour les clés permettant de stocker les documents dans Redis.

```python
import redis
from langchain_google_memorystore_redis import MemorystoreDocumentLoader

redis_client = redis.from_url(ENDPOINT)
loader = MemorystoreDocumentLoader(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_fields=set(["page_content"]),
)
for doc in loader.lazy_load():
    print("Loaded documents:", doc)
```

### Supprimer des documents

Supprimez toutes les clés avec le préfixe spécifié dans l'instance Memorystore pour Redis avec `MemorystoreDocumentSaver.delete()`. Vous pouvez également spécifier les suffixes des clés si vous les connaissez.

```python
docs = loader.load()
print("Documents before delete:", docs)

saver.delete(ids=[0])
print("Documents after delete:", loader.load())

saver.delete()
print("Documents after delete all:", loader.load())
```

## Utilisation avancée

### Personnaliser le contenu de la page et les métadonnées des documents

Lors de l'initialisation d'un chargeur avec plus d'un champ de contenu, le `page_content` des documents chargés contiendra une chaîne encodée en JSON avec des champs de premier niveau égaux aux champs spécifiés dans `content_fields`.

Si les `metadata_fields` sont spécifiés, le champ `metadata` des documents chargés n'aura que les champs de premier niveau égaux aux `metadata_fields` spécifiés. Si l'une des valeurs des champs de métadonnées est stockée sous forme de chaîne encodée en JSON, elle sera décodée avant d'être chargée dans les champs de métadonnées.

```python
loader = MemorystoreDocumentLoader(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_fields=set(["content_field_1", "content_field_2"]),
    metadata_fields=set(["title", "author"]),
)
```
