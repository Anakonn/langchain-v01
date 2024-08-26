---
translated: true
---

# Recherche vectorielle Google BigQuery

> [Recherche vectorielle Google Cloud BigQuery](https://cloud.google.com/bigquery/docs/vector-search-intro) vous permet d'utiliser GoogleSQL pour effectuer une recherche sémantique, en utilisant des index vectoriels pour des résultats approximatifs rapides, ou en utilisant la force brute pour des résultats exacts.

Ce tutoriel illustre comment travailler avec un système de gestion des données et des intégrations complet dans LangChain, et fournir une recherche sémantique évolutive dans BigQuery.

## Démarrage

### Installer la bibliothèque

```python
%pip install --upgrade --quiet  langchain langchain-google-vertexai google-cloud-bigquery
```

**Colab uniquement :** Décommentez la cellule suivante pour redémarrer le noyau ou utilisez le bouton pour redémarrer le noyau. Pour Vertex AI Workbench, vous pouvez redémarrer le terminal à l'aide du bouton en haut.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

## Avant de commencer

#### Définir votre ID de projet

Si vous ne connaissez pas votre ID de projet, essayez ce qui suit :
* Exécutez `gcloud config list`.
* Exécutez `gcloud projects list`.
* Consultez la page d'assistance : [Localiser l'ID du projet](https://support.google.com/googleapi/answer/7014113).

```python
# @title Project { display-mode: "form" }
PROJECT_ID = ""  # @param {type:"string"}

# Set the project id
! gcloud config set project {PROJECT_ID}
```

#### Définir la région

Vous pouvez également modifier la variable `REGION` utilisée par BigQuery. En savoir plus sur les [régions BigQuery](https://cloud.google.com/bigquery/docs/locations#supported_locations).

```python
# @title Region { display-mode: "form" }
REGION = "US"  # @param {type: "string"}
```

#### Définir les noms de jeu de données et de table

Ils seront votre Vector Store BigQuery.

```python
# @title Dataset and Table { display-mode: "form" }
DATASET = "my_langchain_dataset"  # @param {type: "string"}
TABLE = "doc_and_vectors"  # @param {type: "string"}
```

### Authentifier votre environnement de notebook

- Si vous utilisez **Colab** pour exécuter ce notebook, décommentez la cellule ci-dessous et continuez.
- Si vous utilisez **Vertex AI Workbench**, consultez les instructions de configuration [ici](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth as google_auth

google_auth.authenticate_user()
```

## Démo : BigQueryVectorSearch

### Créer une instance de classe d'intégration

Vous devrez peut-être activer l'API Vertex AI dans votre projet en exécutant
`gcloud services enable aiplatform.googleapis.com --project {PROJECT_ID}`
(remplacez `{PROJECT_ID}` par le nom de votre projet).

Vous pouvez utiliser n'importe quel [modèle d'intégration de texte LangChain](/docs/integrations/text_embedding/).

```python
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### Créer un jeu de données BigQuery

Étape facultative pour créer le jeu de données s'il n'existe pas.

```python
from google.cloud import bigquery

client = bigquery.Client(project=PROJECT_ID, location=REGION)
client.create_dataset(dataset=DATASET, exists_ok=True)
```

### Initialiser le Vector Store BigQueryVectorSearch avec un jeu de données BigQuery existant

```python
from langchain.vectorstores.utils import DistanceStrategy
from langchain_community.vectorstores import BigQueryVectorSearch

store = BigQueryVectorSearch(
    project_id=PROJECT_ID,
    dataset_name=DATASET,
    table_name=TABLE,
    location=REGION,
    embedding=embedding,
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
)
```

### Ajouter des textes

```python
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]

store.add_texts(all_texts, metadatas=metadatas)
```

### Rechercher des documents

```python
query = "I'd like a fruit."
docs = store.similarity_search(query)
print(docs)
```

### Rechercher des documents par vecteur

```python
query_vector = embedding.embed_query(query)
docs = store.similarity_search_by_vector(query_vector, k=2)
print(docs)
```

### Rechercher des documents avec un filtre de métadonnées

```python
# This should only return "Banana" document.
docs = store.similarity_search_by_vector(query_vector, filter={"len": 6})
print(docs)
```

### Explorer les statistiques des tâches avec l'ID de tâche BigQuery

```python
job_id = ""  # @param {type:"string"}
# Debug and explore the job statistics with a BigQuery Job id.
store.explore_job_stats(job_id)
```
