---
translated: true
---

# Google Firestore en mode Datastore

> [Firestore en mode Datastore](https://cloud.google.com/datastore) est une base de données de documents NoSQL conçue pour la mise à l'échelle automatique, les hautes performances et la facilité de développement d'applications. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations Langchain de Datastore.

Ce notebook explique comment utiliser [Firestore en mode Datastore](https://cloud.google.com/datastore) pour [enregistrer, charger et supprimer des documents Langchain](/docs/modules/data_connection/document_loaders/) avec `DatastoreLoader` et `DatastoreSaver`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-datastore-python/).

[![Ouvrir dans Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-datastore-python/blob/main/docs/document_loader.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez faire ce qui suit :

* [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Activer l'API Datastore](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com)
* [Créer une base de données Firestore en mode Datastore](https://cloud.google.com/datastore/docs/manage-databases)

Après avoir confirmé l'accès à la base de données dans l'environnement d'exécution de ce notebook, remplissez les valeurs suivantes et exécutez la cellule avant d'exécuter les scripts d'exemple.

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans son propre package `langchain-google-datastore`, nous devons donc l'installer.

```python
%pip install -upgrade --quiet langchain-google-datastore
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

### Enregistrer des documents

Enregistrez des documents Langchain avec `DatastoreSaver.upsert_documents(<documents>)`. Par défaut, il essaiera d'extraire la clé d'entité à partir de la `key` dans les métadonnées du document.

```python
from langchain_core.documents import Document
from langchain_google_datastore import DatastoreSaver

saver = DatastoreSaver()

data = [Document(page_content="Hello, World!")]
saver.upsert_documents(data)
```

#### Enregistrer des documents sans clé

Si un `kind` est spécifié, les documents seront stockés avec un ID généré automatiquement.

```python
saver = DatastoreSaver("MyKind")

saver.upsert_documents(data)
```

### Charger des documents via Kind

Chargez des documents Langchain avec `DatastoreLoader.load()` ou `DatastoreLoader.lazy_load()`. `lazy_load` renvoie un générateur qui ne requête la base de données que pendant l'itération. Pour initialiser la classe `DatastoreLoader`, vous devez fournir :
1. `source` - La source pour charger les documents. Il peut s'agir d'une instance de Query ou du nom du type Datastore à lire.

```python
from langchain_google_datastore import DatastoreLoader

loader = DatastoreLoader("MyKind")
data = loader.load()
```

### Charger des documents via une requête

Outre le chargement de documents à partir d'un type, nous pouvons également choisir de charger des documents à partir d'une requête. Par exemple :

```python
from google.cloud import datastore

client = datastore.Client(database="non-default-db", namespace="custom_namespace")
query_load = client.query(kind="MyKind")
query_load.add_filter("region", "=", "west_coast")

loader_document = DatastoreLoader(query_load)

data = loader_document.load()
```

### Supprimer des documents

Supprimez une liste de documents Langchain de Datastore avec `DatastoreSaver.delete_documents(<documents>)`.

```python
saver = DatastoreSaver()

saver.delete_documents(data)

keys_to_delete = [
    ["Kind1", "identifier"],
    ["Kind2", 123],
    ["Kind3", "identifier", "NestedKind", 456],
]
# The Documents will be ignored and only the document ids will be used.
saver.delete_documents(data, keys_to_delete)
```

## Utilisation avancée

### Charger des documents avec un contenu de page et des métadonnées personnalisés

Les arguments de `page_content_properties` et `metadata_properties` spécifieront les propriétés d'entité à écrire dans le `page_content` et les `metadata` du document Langchain.

```python
loader = DatastoreLoader(
    source="MyKind",
    page_content_fields=["data_field"],
    metadata_fields=["metadata_field"],
)

data = loader.load()
```

### Personnaliser le format du contenu de la page

Lorsque le `page_content` ne contient qu'un seul champ, l'information sera la valeur du champ uniquement. Sinon, le `page_content` sera au format JSON.

### Personnaliser la connexion et l'authentification

```python
from google.auth import compute_engine
from google.cloud.firestore import Client

client = Client(database="non-default-db", creds=compute_engine.Credentials())
loader = DatastoreLoader(
    source="foo",
    client=client,
)
```
