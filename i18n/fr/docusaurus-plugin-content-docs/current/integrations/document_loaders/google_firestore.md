---
translated: true
---

# Google Firestore (Mode natif)

> [Firestore](https://cloud.google.com/firestore) est une base de données sans serveur orientée document qui s'adapte à toute demande. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations Langchain de Firestore.

Ce notebook explique comment utiliser [Firestore](https://cloud.google.com/firestore) pour [enregistrer, charger et supprimer des documents Langchain](/docs/modules/data_connection/document_loaders/) avec `FirestoreLoader` et `FirestoreSaver`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-firestore-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/document_loader.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez faire ce qui suit :

* [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Activer l'API Firestore](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [Créer une base de données Firestore](https://cloud.google.com/firestore/docs/manage-databases)

Après avoir confirmé l'accès à la base de données dans l'environnement d'exécution de ce notebook, remplissez les valeurs suivantes et exécutez la cellule avant d'exécuter les scripts d'exemple.

```python
# @markdown Please specify a source for demo purpose.
SOURCE = "test"  # @param {type:"Query"|"CollectionGroup"|"DocumentReference"|"string"}
```

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans son propre package `langchain-google-firestore`, nous devons donc l'installer.

```python
%pip install -upgrade --quiet langchain-google-firestore
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

`FirestoreSaver` peut stocker des documents dans Firestore. Par défaut, il essaiera d'extraire la référence du document à partir des métadonnées.

Enregistrez les documents Langchain avec `FirestoreSaver.upsert_documents(<documents>)`.

```python
from langchain_core.documents import Document
from langchain_google_firestore import FirestoreSaver

saver = FirestoreSaver()

data = [Document(page_content="Hello, World!")]

saver.upsert_documents(data)
```

#### Enregistrer des documents sans référence

Si une collection est spécifiée, les documents seront stockés avec un ID généré automatiquement.

```python
saver = FirestoreSaver("Collection")

saver.upsert_documents(data)
```

#### Enregistrer des documents avec d'autres références

```python
doc_ids = ["AnotherCollection/doc_id", "foo/bar"]
saver = FirestoreSaver()

saver.upsert_documents(documents=data, document_ids=doc_ids)
```

### Charger à partir d'une collection ou d'une sous-collection

Chargez les documents Langchain avec `FirestoreLoader.load()` ou `Firestore.lazy_load()`. `lazy_load` renvoie un générateur qui ne requête la base de données que pendant l'itération. Pour initialiser la classe `FirestoreLoader`, vous devez fournir :

1. `source` - Une instance de Query, CollectionGroup, DocumentReference ou le chemin à une collection Firestore délimité par des `\`.

```python
from langchain_google_firestore import FirestoreLoader

loader_collection = FirestoreLoader("Collection")
loader_subcollection = FirestoreLoader("Collection/doc/SubCollection")


data_collection = loader_collection.load()
data_subcollection = loader_subcollection.load()
```

### Charger un seul document

```python
from google.cloud import firestore

client = firestore.Client()
doc_ref = client.collection("foo").document("bar")

loader_document = FirestoreLoader(doc_ref)

data = loader_document.load()
```

### Charger à partir d'un CollectionGroup ou d'une Query

```python
from google.cloud.firestore import CollectionGroup, FieldFilter, Query

col_ref = client.collection("col_group")
collection_group = CollectionGroup(col_ref)

loader_group = FirestoreLoader(collection_group)

col_ref = client.collection("collection")
query = col_ref.where(filter=FieldFilter("region", "==", "west_coast"))

loader_query = FirestoreLoader(query)
```

### Supprimer des documents

Supprimez une liste de documents Langchain de la collection Firestore avec `FirestoreSaver.delete_documents(<documents>)`.

Si les identifiants de document sont fournis, les documents seront ignorés.

```python
saver = FirestoreSaver()

saver.delete_documents(data)

# The Documents will be ignored and only the document ids will be used.
saver.delete_documents(data, doc_ids)
```

## Utilisation avancée

### Charger des documents avec un contenu de page et des métadonnées personnalisés

Les arguments `page_content_fields` et `metadata_fields` spécifieront les champs du document Firestore à écrire dans le `page_content` et les `metadata` du document Langchain.

```python
loader = FirestoreLoader(
    source="foo/bar/subcol",
    page_content_fields=["data_field"],
    metadata_fields=["metadata_field"],
)

data = loader.load()
```

#### Personnaliser le format du contenu de la page

Lorsque le `page_content` ne contient qu'un seul champ, l'information sera la valeur du champ uniquement. Sinon, le `page_content` sera au format JSON.

### Personnaliser la connexion et l'authentification

```python
from google.auth import compute_engine
from google.cloud.firestore import Client

client = Client(database="non-default-db", creds=compute_engine.Credentials())
loader = FirestoreLoader(
    source="foo",
    client=client,
)
```
