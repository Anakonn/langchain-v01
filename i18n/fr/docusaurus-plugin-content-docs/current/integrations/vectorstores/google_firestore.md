---
sidebar_label: Firestore
translated: true
---

# Google Firestore (Mode natif)

> [Firestore](https://cloud.google.com/firestore) est une base de données de documents sans serveur qui s'adapte à toute demande. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations Langchain de Firestore.

Ce notebook explique comment utiliser [Firestore](https://cloud.google.com/firestore) pour stocker des vecteurs et les interroger à l'aide de la classe `FirestoreVectorStore`.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/vectorstores.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez effectuer les étapes suivantes :

* [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Activer l'API Firestore](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [Créer une base de données Firestore](https://cloud.google.com/firestore/docs/manage-databases)

Après avoir confirmé l'accès à la base de données dans l'environnement d'exécution de ce notebook, remplissez les valeurs suivantes et exécutez la cellule avant d'exécuter les scripts d'exemple.

```python
# @markdown Please specify a source for demo purpose.
COLLECTION_NAME = "test"  # @param {type:"CollectionReference"|"string"}
```

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans le package `langchain-google-firestore`, nous devons donc l'installer. Pour ce notebook, nous installerons également `langchain-google-genai` pour utiliser les embeddings Google Generative AI.

```python
%pip install -upgrade --quiet langchain-google-firestore langchain-google-vertexai
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

PROJECT_ID = "extensions-testing"  # @param {type:"string"}

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

# Utilisation de base

### Initialiser FirestoreVectorStore

`FirestoreVectorStore` vous permet de stocker de nouveaux vecteurs dans une base de données Firestore. Vous pouvez l'utiliser pour stocker des embeddings de n'importe quel modèle, y compris ceux de Google Generative AI.

```python
from langchain_google_firestore import FirestoreVectorStore
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest",
    project=PROJECT_ID,
)

# Sample data
ids = ["apple", "banana", "orange"]
fruits_texts = ['{"name": "apple"}', '{"name": "banana"}', '{"name": "orange"}']

# Create a vector store
vector_store = FirestoreVectorStore(
    collection="fruits",
    embedding=embedding,
)

# Add the fruits to the vector store
vector_store.add_texts(fruits_texts, ids=ids)
```

En raccourci, vous pouvez initialiser et ajouter des vecteurs en une seule étape à l'aide des méthodes `from_texts` et `from_documents`.

```python
vector_store = FirestoreVectorStore.from_texts(
    collection="fruits",
    texts=fruits_texts,
    embedding=embedding,
)
```

```python
from langchain_core.documents import Document

fruits_docs = [Document(page_content=fruit) for fruit in fruits_texts]

vector_store = FirestoreVectorStore.from_documents(
    collection="fruits",
    documents=fruits_docs,
    embedding=embedding,
)
```

### Supprimer des vecteurs

Vous pouvez supprimer des documents avec des vecteurs de la base de données à l'aide de la méthode `delete`. Vous devrez fournir l'ID du document du vecteur que vous voulez supprimer. Cela supprimera tout le document de la base de données, y compris tous les autres champs qu'il pourrait avoir.

```python
vector_store.delete(ids)
```

### Mettre à jour des vecteurs

La mise à jour des vecteurs est similaire à leur ajout. Vous pouvez utiliser la méthode `add` pour mettre à jour le vecteur d'un document en fournissant l'ID du document et le nouveau vecteur.

```python
fruit_to_update = ['{"name": "apple","price": 12}']
apple_id = "apple"

vector_store.add_texts(fruit_to_update, ids=[apple_id])
```

## Recherche de similarité

Vous pouvez utiliser `FirestoreVectorStore` pour effectuer des recherches de similarité sur les vecteurs que vous avez stockés. Cela est utile pour trouver des documents ou du texte similaires.

```python
vector_store.similarity_search("I like fuji apples", k=3)
```

```python
vector_store.max_marginal_relevance_search("fuji", 5)
```

Vous pouvez ajouter un pré-filtre à la recherche en utilisant le paramètre `filters`. Cela est utile pour filtrer par un champ ou une valeur spécifique.

```python
from google.cloud.firestore_v1.base_query import FieldFilter

vector_store.max_marginal_relevance_search(
    "fuji", 5, filters=FieldFilter("content", "==", "apple")
)
```

### Personnaliser la connexion et l'authentification

```python
from google.api_core.client_options import ClientOptions
from google.cloud import firestore
from langchain_google_firestore import FirestoreVectorStore

client_options = ClientOptions()
client = firestore.Client(client_options=client_options)

# Create a vector store
vector_store = FirestoreVectorStore(
    collection="fruits",
    embedding=embedding,
    client=client,
)
```
