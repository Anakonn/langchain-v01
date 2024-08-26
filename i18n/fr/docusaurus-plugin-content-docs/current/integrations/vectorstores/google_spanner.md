---
translated: true
---

# Google Spanner

> [Spanner](https://cloud.google.com/spanner) est une base de données hautement évolutive qui combine une évolutivité illimitée avec des sémantiques relationnelles, telles que des index secondaires, une forte cohérence, des schémas et SQL, offrant une disponibilité de 99,999 % dans une seule solution facile à utiliser.

Ce notebook explique comment utiliser `Spanner` pour la recherche vectorielle avec la classe `SpannerVectorStore`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-spanner-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-spanner-python/blob/main/docs/vector_store.ipynb)

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

```output
Note: you may need to restart the kernel to use updated packages.
```

**Colab uniquement :** Décommentez la cellule suivante pour redémarrer le noyau ou utilisez le bouton pour redémarrer le noyau. Pour Vertex AI Workbench, vous pouvez redémarrer le terminal à l'aide du bouton en haut.

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

Trouvez vos valeurs de base de données, dans la [page des instances Spanner](https://console.cloud.google.com/spanner?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687).

```python
# @title Set Your Values Here { display-mode: "form" }
INSTANCE = "my-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vectors_search_data"  # @param {type: "string"}
```

### Initialiser une table

L'instance de la classe `SpannerVectorStore` nécessite une table de base de données avec des colonnes id, content et embeddings.

La méthode d'assistance `init_vector_store_table()` peut être utilisée pour créer une table avec le schéma approprié pour vous.

```python
from langchain_google_spanner import SecondaryIndex, SpannerVectorStore, TableColumn

SpannerVectorStore.init_vector_store_table(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    id_column="row_id",
    metadata_columns=[
        TableColumn(name="metadata", type="JSON", is_null=True),
        TableColumn(name="title", type="STRING(MAX)", is_null=False),
    ],
    secondary_indexes=[
        SecondaryIndex(index_name="row_id_and_title", columns=["row_id", "title"])
    ],
)
```

### Créer une instance de classe d'intégration

Vous pouvez utiliser n'importe quel [modèle d'intégration LangChain](/docs/integrations/text_embedding/).
Vous devrez peut-être activer l'API Vertex AI pour utiliser `VertexAIEmbeddings`. Nous vous recommandons de définir la version du modèle d'intégration pour la production, en savoir plus sur les [modèles d'intégration de texte](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings).

```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```

```python
from langchain_google_vertexai import VertexAIEmbeddings

embeddings = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### SpannerVectorStore

Pour initialiser la classe `SpannerVectorStore`, vous devez fournir 4 arguments obligatoires et d'autres arguments sont facultatifs et ne doivent être transmis que s'ils sont différents des valeurs par défaut.

1. `instance_id` - Le nom de l'instance Spanner
1. `database_id` - Le nom de la base de données Spanner
1. `table_name` - Le nom de la table dans la base de données pour stocker les documents et leurs intégrations.
1. `embedding_service` - L'implémentation des intégrations qui est utilisée pour générer les intégrations.

```python
db = SpannerVectorStore(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    ignore_metadata_columns=[],
    embedding_service=embeddings,
    metadata_json_column="metadata",
)
```

#### 🔐 Ajouter des documents

Pour ajouter des documents dans le magasin vectoriel.

```python
import uuid

from langchain_community.document_loaders import HNLoader

loader = HNLoader("https://news.ycombinator.com/item?id=34817881")

documents = loader.load()
ids = [str(uuid.uuid4()) for _ in range(len(documents))]
```

#### 🔐 Rechercher des documents

Pour rechercher des documents dans le magasin vectoriel avec une recherche de similarité.

```python
db.similarity_search(query="Explain me vector store?", k=3)
```

#### 🔐 Rechercher des documents

Pour rechercher des documents dans le magasin vectoriel avec une recherche de pertinence marginale maximale.

```python
db.max_marginal_relevance_search("Testing the langchain integration with spanner", k=3)
```

#### 🔐 Supprimer des documents

Pour supprimer des documents du magasin vectoriel, utilisez les ID qui correspondent aux valeurs de la colonne `row_id` lors de l'initialisation du VectorStore.

```python
db.delete(ids=["id1", "id2"])
```

#### 🔐 Supprimer des documents

Pour supprimer des documents du magasin vectoriel, vous pouvez utiliser les documents eux-mêmes. La colonne de contenu et les colonnes de métadonnées fournies lors de l'initialisation de VectorStore seront utilisées pour trouver les lignes correspondant aux documents. Toutes les lignes correspondantes seront alors supprimées.

```python
db.delete(documents=[documents[0], documents[1]])
```
