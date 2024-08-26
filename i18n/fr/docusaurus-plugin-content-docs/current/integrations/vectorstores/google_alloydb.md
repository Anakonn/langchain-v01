---
translated: true
---

# Google AlloyDB pour PostgreSQL

> [AlloyDB](https://cloud.google.com/alloydb) est un service de base de données relationnelle entièrement géré qui offre des performances élevées, une intégration transparente et une évolutivité impressionnante. AlloyDB est 100% compatible avec PostgreSQL. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations Langchain d'AlloyDB.

Ce notebook explique comment utiliser `AlloyDB pour PostgreSQL` pour stocker des embeddings vectoriels avec la classe `AlloyDBVectorStore`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-alloydb-pg-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-alloydb-pg-python/blob/main/docs/vector_store.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez faire ce qui suit :

 * [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Activer l'API AlloyDB](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)
 * [Créer un cluster et une instance AlloyDB.](https://cloud.google.com/alloydb/docs/cluster-create)
 * [Créer une base de données AlloyDB.](https://cloud.google.com/alloydb/docs/quickstart/create-and-connect)
 * [Ajouter un utilisateur à la base de données.](https://cloud.google.com/alloydb/docs/database-users/about)

### 🦜🔗 Installation de la bibliothèque

Installez la bibliothèque d'intégration, `langchain-google-alloydb-pg`, et la bibliothèque pour le service d'embedding, `langchain-google-vertexai`.

```python
%pip install --upgrade --quiet  langchain-google-alloydb-pg langchain-google-vertexai
```

**Colab uniquement :** Décommentez la cellule suivante pour redémarrer le noyau ou utilisez le bouton pour le redémarrer. Pour Vertex AI Workbench, vous pouvez redémarrer le terminal à l'aide du bouton en haut.

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

## Utilisation de base

### Définir les valeurs de la base de données AlloyDB

Trouvez vos valeurs de base de données dans la [page des instances AlloyDB](https://console.cloud.google.com/alloydb/clusters).

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
CLUSTER = "my-cluster"  # @param {type: "string"}
INSTANCE = "my-primary"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### Pool de connexions AlloyDBEngine

L'une des exigences et des arguments pour établir AlloyDB en tant que vector store est un objet `AlloyDBEngine`. Le `AlloyDBEngine` configure un pool de connexions à votre base de données AlloyDB, permettant des connexions réussies à partir de votre application et suivant les meilleures pratiques de l'industrie.

Pour créer un `AlloyDBEngine` à l'aide de `AlloyDBEngine.from_instance()`, vous devez fournir seulement 5 choses :

1. `project_id` : ID du projet Google Cloud où se trouve l'instance AlloyDB.
1. `region` : Région où se trouve l'instance AlloyDB.
1. `cluster`: Le nom du cluster AlloyDB.
1. `instance` : Le nom de l'instance AlloyDB.
1. `database` : Le nom de la base de données à laquelle se connecter sur l'instance AlloyDB.

Par défaut, [l'authentification de base de données IAM](https://cloud.google.com/alloydb/docs/connect-iam) sera utilisée comme méthode d'authentification de la base de données. Cette bibliothèque utilise le principal IAM appartenant aux [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) provenant de l'environnement.

Facultativement, [l'authentification de base de données intégrée](https://cloud.google.com/alloydb/docs/database-users/about) à l'aide d'un nom d'utilisateur et d'un mot de passe pour accéder à la base de données AlloyDB peut également être utilisée. Il suffit de fournir les arguments facultatifs `user` et `password` à `AlloyDBEngine.from_instance()` :

* `user` : Utilisateur de la base de données à utiliser pour l'authentification et la connexion de la base de données intégrée
* `password` : Mot de passe de la base de données à utiliser pour l'authentification et la connexion de la base de données intégrée.

**Remarque :** Ce tutoriel démontre l'interface asynchrone. Toutes les méthodes asynchrones ont des méthodes synchrones correspondantes.

```python
from langchain_google_alloydb_pg import AlloyDBEngine

engine = await AlloyDBEngine.afrom_instance(
    project_id=PROJECT_ID,
    region=REGION,
    cluster=CLUSTER,
    instance=INSTANCE,
    database=DATABASE,
)
```

### Initialiser une table

La classe `AlloyDBVectorStore` nécessite une table de base de données. Le moteur `AlloyDBEngine` a une méthode d'assistance `init_vectorstore_table()` qui peut être utilisée pour créer une table avec le schéma approprié pour vous.

```python
await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
)
```

### Créer une instance de classe d'embedding

Vous pouvez utiliser n'importe quel [modèle d'embeddings LangChain](/docs/integrations/text_embedding/).
Vous devrez peut-être activer l'API Vertex AI pour utiliser `VertexAIEmbeddings`. Nous vous recommandons de définir la version du modèle d'embedding pour la production, en savoir plus sur les [modèles d'embeddings de texte](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings).

```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```

```python
from langchain_google_vertexai import VertexAIEmbeddings

embedding = VertexAIEmbeddings(
    model_name="textembedding-gecko@latest", project=PROJECT_ID
)
```

### Initialiser un AlloyDBVectorStore par défaut

```python
from langchain_google_alloydb_pg import AlloyDBVectorStore

store = await AlloyDBVectorStore.create(
    engine=engine,
    table_name=TABLE_NAME,
    embedding_service=embedding,
)
```

### Ajouter des textes

```python
import uuid

all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]

await store.aadd_texts(all_texts, metadatas=metadatas, ids=ids)
```

### Supprimer des textes

```python
await store.adelete([ids[1]])
```

### Rechercher des documents

```python
query = "I'd like a fruit."
docs = await store.asimilarity_search(query)
print(docs)
```

### Rechercher des documents par vecteur

```python
query_vector = embedding.embed_query(query)
docs = await store.asimilarity_search_by_vector(query_vector, k=2)
print(docs)
```

## Ajouter un index

Accélérez les requêtes de recherche vectorielle en appliquant un index vectoriel. En savoir plus sur les [index vectoriels](https://cloud.google.com/blog/products/databases/faster-similarity-search-performance-with-pgvector-indexes).

```python
from langchain_google_alloydb_pg.indexes import IVFFlatIndex

index = IVFFlatIndex()
await store.aapply_vector_index(index)
```

### Ré-indexer

```python
await store.areindex()  # Re-index using default index name
```

### Supprimer un index

```python
await store.adrop_vector_index()  # Delete index using default name
```

## Créer un Vector Store personnalisé

Un Vector Store peut tirer parti des données relationnelles pour filtrer les recherches de similarité.

Créez une table avec des colonnes de métadonnées personnalisées.

```python
from langchain_google_alloydb_pg import Column

# Set table name
TABLE_NAME = "vectorstore_custom"

await engine.ainit_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # VertexAI model: textembedding-gecko@latest
    metadata_columns=[Column("len", "INTEGER")],
)


# Initialize AlloyDBVectorStore
custom_store = await AlloyDBVectorStore.create(
    engine=engine,
    table_name=TABLE_NAME,
    embedding_service=embedding,
    metadata_columns=["len"],
    # Connect to a existing VectorStore by customizing the table schema:
    # id_column="uuid",
    # content_column="documents",
    # embedding_column="vectors",
)
```

### Rechercher des documents avec un filtre de métadonnées

```python
import uuid

# Add texts to the Vector Store
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]
await store.aadd_texts(all_texts, metadatas=metadatas, ids=ids)

# Use filter on search
docs = await custom_store.asimilarity_search_by_vector(query_vector, filter="len >= 6")

print(docs)
```
