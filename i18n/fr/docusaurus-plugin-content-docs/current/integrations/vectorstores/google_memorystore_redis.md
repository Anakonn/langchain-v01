---
translated: true
---

# Google Memorystore pour Redis

> [Google Memorystore pour Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) est un service entièrement géré qui s'appuie sur le magasin de données en mémoire Redis pour construire des caches d'applications offrant un accès aux données en sous-milliseconde. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations Langchain de Memorystore pour Redis.

Ce notebook explique comment utiliser [Memorystore pour Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) pour stocker des embeddings vectoriels avec la classe `MemorystoreVectorStore`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/vector_store.ipynb)

## Prérequis

## Avant de commencer

Pour exécuter ce notebook, vous devrez :

* [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Activer l'API Memorystore pour Redis](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [Créer une instance Memorystore pour Redis](https://cloud.google.com/memorystore/docs/redis/create-instance-console). Assurez-vous que la version soit supérieure ou égale à 7.2.

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans le package `langchain-google-memorystore-redis`, nous devons donc l'installer.

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis langchain
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

### Initialiser un index vectoriel

```python
import redis
from langchain_google_memorystore_redis import (
    DistanceStrategy,
    HNSWConfig,
    RedisVectorStore,
)

# Connect to a Memorystore for Redis instance
redis_client = redis.from_url("redis://127.0.0.1:6379")

# Configure HNSW index with descriptive parameters
index_config = HNSWConfig(
    name="my_vector_index", distance_strategy=DistanceStrategy.COSINE, vector_size=128
)

# Initialize/create the vector store index
RedisVectorStore.init_index(client=redis_client, index_config=index_config)
```

### Préparer les documents

Le texte doit être traité et représenté numériquement avant d'interagir avec un magasin vectoriel. Cela implique :

* Chargement du texte : Le TextLoader obtient les données textuelles à partir d'un fichier (par exemple, "state_of_the_union.txt").
* Fractionnement du texte : Le CharacterTextSplitter divise le texte en plus petits morceaux pour les modèles d'embedding.

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader

loader = TextLoader("./state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### Ajouter des documents au magasin vectoriel

Après la préparation du texte et la génération des embeddings, les méthodes suivantes les insèrent dans le magasin vectoriel Redis.

#### Méthode 1 : Méthode de classe pour l'insertion directe

Cette approche combine la création d'embedding et l'insertion en une seule étape à l'aide de la méthode from_documents :

```python
from langchain_community.embeddings.fake import FakeEmbeddings

embeddings = FakeEmbeddings(size=128)
redis_client = redis.from_url("redis://127.0.0.1:6379")
rvs = RedisVectorStore.from_documents(
    docs, embedding=embeddings, client=redis_client, index_name="my_vector_index"
)
```

#### Méthode 2 : Insertion basée sur l'instance

Cette approche offre de la flexibilité lorsque vous travaillez avec une nouvelle instance RedisVectorStore ou une instance existante :

* [Facultatif] Créer une instance RedisVectorStore : Instancier un objet RedisVectorStore pour la personnalisation. Si vous avez déjà une instance, passez à l'étape suivante.
* Ajouter du texte avec des métadonnées : Fournir le texte brut et les métadonnées à l'instance. La génération d'embedding et l'insertion dans le magasin vectoriel sont gérées automatiquement.

```python
rvs = RedisVectorStore(
    client=redis_client, index_name="my_vector_index", embeddings=embeddings
)
ids = rvs.add_texts(
    texts=[d.page_content for d in docs], metadatas=[d.metadata for d in docs]
)
```

### Effectuer une recherche de similarité (KNN)

Avec le magasin vectoriel peuplé, il est possible de rechercher du texte sémantiquement similaire à une requête. Voici comment utiliser KNN (K-Nearest Neighbors) avec les paramètres par défaut :

* Formuler la requête : Une question en langage naturel exprime l'intention de recherche (par exemple, "Qu'a dit le président à propos de Ketanji Brown Jackson").
* Récupérer les résultats similaires : La méthode `similarity_search` trouve les éléments du magasin vectoriel les plus proches de la requête en termes de sens.

```python
import pprint

query = "What did the president say about Ketanji Brown Jackson"
knn_results = rvs.similarity_search(query=query)
pprint.pprint(knn_results)
```

### Effectuer une recherche de similarité basée sur une plage

Les requêtes de plage offrent plus de contrôle en spécifiant un seuil de similarité souhaité ainsi que le texte de la requête :

* Formuler la requête : Une question en langage naturel définit l'intention de recherche.
* Définir le seuil de similarité : Le paramètre `distance_threshold` détermine à quel point une correspondance doit être considérée comme pertinente.
* Récupérer les résultats : La méthode `similarity_search_with_score` trouve les éléments du magasin vectoriel qui se situent dans le seuil de similarité spécifié.

```python
rq_results = rvs.similarity_search_with_score(query=query, distance_threshold=0.8)
pprint.pprint(rq_results)
```

### Effectuer une recherche de Pertinence Marginale Maximale (MMR)

Les requêtes MMR visent à trouver des résultats qui sont à la fois pertinents pour la requête et diversifiés les uns par rapport aux autres, réduisant ainsi la redondance dans les résultats de recherche.

* Formuler la requête : Une question en langage naturel définit l'intention de recherche.
* Équilibrer la pertinence et la diversité : Le paramètre `lambda_mult` contrôle le compromis entre la pertinence stricte et la promotion de la variété dans les résultats.
* Récupérer les résultats MMR : La méthode `max_marginal_relevance_search` renvoie les éléments qui optimisent la combinaison de pertinence et de diversité en fonction du paramètre lambda.

```python
mmr_results = rvs.max_marginal_relevance_search(query=query, lambda_mult=0.90)
pprint.pprint(mmr_results)
```

## Utiliser le magasin vectoriel comme un Retriever

Pour une intégration transparente avec d'autres composants LangChain, un magasin vectoriel peut être converti en Retriever. Cela offre plusieurs avantages :

* Compatibilité LangChain : De nombreux outils et méthodes LangChain sont conçus pour interagir directement avec les retrievers.
* Facilité d'utilisation : La méthode `as_retriever()` convertit le magasin vectoriel dans un format qui simplifie l'interrogation.

```python
retriever = rvs.as_retriever()
results = retriever.invoke(query)
pprint.pprint(results)
```

## Nettoyage

### Supprimer des documents du magasin vectoriel

Il est parfois nécessaire de supprimer des documents (et leurs vecteurs associés) du magasin vectoriel. La méthode `delete` offre cette fonctionnalité.

```python
rvs.delete(ids)
```

### Supprimer un index vectoriel

Il peut y avoir des circonstances où la suppression d'un index vectoriel existant est nécessaire. Les raisons courantes incluent :

* Modifications de la configuration de l'index : si les paramètres de l'index doivent être modifiés, il est souvent nécessaire de supprimer et de recréer l'index.
* Gestion du stockage : la suppression des index inutilisés peut aider à libérer de l'espace au sein de l'instance Redis.

Attention : la suppression d'un index vectoriel est une opération irréversible. Assurez-vous que les vecteurs stockés et la fonctionnalité de recherche ne sont plus nécessaires avant de procéder.

```python
# Delete the vector index
RedisVectorStore.drop_index(client=redis_client, index_name="my_vector_index")
```
