---
translated: true
---

# Google Cloud SQL pour MySQL

> [Cloud SQL](https://cloud.google.com/sql) est un service de base de données relationnelle entièrement géré qui offre des performances élevées, une intégration transparente et une évolutivité impressionnante. Il propose les moteurs de base de données PostgreSQL, MySQL et SQL Server. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations LangChain de Cloud SQL.

Ce notebook explique comment utiliser `Cloud SQL pour MySQL` pour stocker des embeddings vectoriels avec la classe `MySQLVectorStore`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/docs/vector_store.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez :

 * [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Activer l'API Cloud SQL Admin.](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com)
 * [Créer une instance Cloud SQL.](https://cloud.google.com/sql/docs/mysql/connect-instance-auth-proxy#create-instance) (la version doit être >= **8.0.36** avec le paramètre de base de données **cloudsql_vector** configuré sur "On")
 * [Créer une base de données Cloud SQL.](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
 * [Ajouter un utilisateur à la base de données.](https://cloud.google.com/sql/docs/mysql/create-manage-users)

### 🦜🔗 Installation de la bibliothèque

Installez la bibliothèque d'intégration, `langchain-google-cloud-sql-mysql`, et la bibliothèque pour le service d'embedding, `langchain-google-vertexai`.

```python
%pip install --upgrade --quiet langchain-google-cloud-sql-mysql langchain-google-vertexai
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

## Utilisation de base

### Définir les valeurs de la base de données Cloud SQL

Trouvez vos valeurs de base de données sur la [page des instances Cloud SQL](https://console.cloud.google.com/sql?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687).

**Remarque :** La prise en charge des vecteurs MySQL n'est disponible que sur les instances MySQL avec la version **>= 8.0.36**.

Pour les instances existantes, vous devrez peut-être effectuer une [mise à jour de maintenance en libre-service](https://cloud.google.com/sql/docs/mysql/self-service-maintenance) pour mettre à jour votre version de maintenance sur **MYSQL_8_0_36.R20240401.03_00** ou une version ultérieure. Une fois mis à jour, [configurez les paramètres de votre base de données](https://cloud.google.com/sql/docs/mysql/flags) pour avoir le nouveau paramètre **cloudsql_vector** sur "On".

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-mysql-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### Connexion à la base de données MySQL

L'une des exigences et des arguments pour établir Cloud SQL en tant que magasin de vecteurs est un objet `MySQLEngine`. Le `MySQLEngine` configure un pool de connexions à votre base de données Cloud SQL, permettant des connexions réussies depuis votre application et suivant les meilleures pratiques de l'industrie.

Pour créer un `MySQLEngine` à l'aide de `MySQLEngine.from_instance()`, vous devez fournir seulement 4 éléments :

1. `project_id` : ID du projet Google Cloud où se trouve l'instance Cloud SQL.
1. `region` : Région où se trouve l'instance Cloud SQL.
1. `instance` : Le nom de l'instance Cloud SQL.
1. `database` : Le nom de la base de données à laquelle se connecter sur l'instance Cloud SQL.

Par défaut, [l'authentification de base de données IAM](https://cloud.google.com/sql/docs/mysql/iam-authentication#iam-db-auth) sera utilisée comme méthode d'authentification de la base de données. Cette bibliothèque utilise le principal IAM appartenant aux [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) provenant de l'environnement.

Pour plus d'informations sur l'authentification de base de données IAM, consultez :

* [Configurer une instance pour l'authentification de base de données IAM](https://cloud.google.com/sql/docs/mysql/create-edit-iam-instances)
* [Gérer les utilisateurs avec l'authentification de base de données IAM](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users)

Facultativement, [l'authentification de base de données intégrée](https://cloud.google.com/sql/docs/mysql/built-in-authentication) utilisant un nom d'utilisateur et un mot de passe pour accéder à la base de données Cloud SQL peut également être utilisée. Il suffit de fournir les arguments facultatifs `user` et `password` à `MySQLEngine.from_instance()` :

* `user` : Utilisateur de la base de données à utiliser pour l'authentification de base de données intégrée et la connexion
* `password` : Mot de passe de la base de données à utiliser pour l'authentification de base de données intégrée et la connexion.

```python
from langchain_google_cloud_sql_mysql import MySQLEngine

engine = MySQLEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### Initialiser une table

La classe `MySQLVectorStore` nécessite une table de base de données. La classe `MySQLEngine` dispose d'une méthode d'assistance `init_vectorstore_table()` qui peut être utilisée pour créer une table avec le schéma approprié pour vous.

```python
engine.init_vectorstore_table(
    table_name=TABLE_NAME,
    vector_size=768,  # Vector size for VertexAI model(textembedding-gecko@latest)
)
```

### Créer une instance de classe d'embedding

Vous pouvez utiliser n'importe quel [modèle d'embeddings LangChain](/docs/integrations/text_embedding/).
Vous devrez peut-être activer l'API Vertex AI pour utiliser `VertexAIEmbeddings`.

Nous vous recommandons d'épingler la version du modèle d'embedding pour la production, en savoir plus sur les [modèles d'embeddings de texte](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-embeddings).

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

### Initialiser un MySQLVectorStore par défaut

Pour initialiser une classe `MySQLVectorStore`, vous n'avez besoin que de 3 éléments :

1. `engine` - Une instance d'un moteur `MySQLEngine`.
1. `embedding_service` - Une instance d'un modèle d'intégration LangChain.
1. `table_name` : Le nom de la table dans la base de données Cloud SQL à utiliser comme magasin de vecteurs.

```python
from langchain_google_cloud_sql_mysql import MySQLVectorStore

store = MySQLVectorStore(
    engine=engine,
    embedding_service=embedding,
    table_name=TABLE_NAME,
)
```

### Ajouter des textes

```python
import uuid

all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]

store.add_texts(all_texts, metadatas=metadatas, ids=ids)
```

### Supprimer des textes

Supprimez les vecteurs du magasin de vecteurs par ID.

```python
store.delete([ids[1]])
```

### Rechercher des documents

```python
query = "I'd like a fruit."
docs = store.similarity_search(query)
print(docs[0].page_content)
```

```output
Pineapple
```

### Rechercher des documents par vecteur

Il est également possible d'effectuer une recherche de documents similaires à un vecteur d'intégration donné en utilisant `similarity_search_by_vector` qui accepte un vecteur d'intégration comme paramètre au lieu d'une chaîne.

```python
query_vector = embedding.embed_query(query)
docs = store.similarity_search_by_vector(query_vector, k=2)
print(docs)
```

```output
[Document(page_content='Pineapple', metadata={'len': 9}), Document(page_content='Banana', metadata={'len': 6})]
```

### Ajouter un index

Accélérez les requêtes de recherche de vecteurs en appliquant un index de vecteurs. En savoir plus sur [les index de vecteurs MySQL](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/src/langchain_google_cloud_sql_mysql/indexes.py).

**Remarque :** Pour l'authentification de la base de données IAM (utilisation par défaut), l'utilisateur de la base de données IAM devra se voir accorder les autorisations suivantes par un utilisateur de base de données privilégié pour le contrôle complet des index de vecteurs.

```sql
GRANT EXECUTE ON PROCEDURE mysql.create_vector_index TO '<IAM_DB_USER>'@'%';
GRANT EXECUTE ON PROCEDURE mysql.alter_vector_index TO '<IAM_DB_USER>'@'%';
GRANT EXECUTE ON PROCEDURE mysql.drop_vector_index TO '<IAM_DB_USER>'@'%';
GRANT SELECT ON mysql.vector_indexes TO '<IAM_DB_USER>'@'%';
```

```python
from langchain_google_cloud_sql_mysql import VectorIndex

store.apply_vector_index(VectorIndex())
```

### Supprimer un index

```python
store.drop_vector_index()
```

## Utilisation avancée

### Créer un MySQLVectorStore avec des métadonnées personnalisées

Un magasin de vecteurs peut tirer parti des données relationnelles pour filtrer les recherches de similarité.

Créez une table et une instance `MySQLVectorStore` avec des colonnes de métadonnées personnalisées.

```python
from langchain_google_cloud_sql_mysql import Column

# set table name
CUSTOM_TABLE_NAME = "vector_store_custom"

engine.init_vectorstore_table(
    table_name=CUSTOM_TABLE_NAME,
    vector_size=768,  # VertexAI model: textembedding-gecko@latest
    metadata_columns=[Column("len", "INTEGER")],
)


# initialize MySQLVectorStore with custom metadata columns
custom_store = MySQLVectorStore(
    engine=engine,
    embedding_service=embedding,
    table_name=CUSTOM_TABLE_NAME,
    metadata_columns=["len"],
    # connect to an existing VectorStore by customizing the table schema:
    # id_column="uuid",
    # content_column="documents",
    # embedding_column="vectors",
)
```

### Rechercher des documents avec un filtre de métadonnées

Il peut être utile de réduire les documents avant de travailler avec eux.

Par exemple, les documents peuvent être filtrés sur les métadonnées à l'aide de l'argument `filter`.

```python
import uuid

# add texts to the vector store
all_texts = ["Apples and oranges", "Cars and airplanes", "Pineapple", "Train", "Banana"]
metadatas = [{"len": len(t)} for t in all_texts]
ids = [str(uuid.uuid4()) for _ in all_texts]
custom_store.add_texts(all_texts, metadatas=metadatas, ids=ids)

# use filter on search
query_vector = embedding.embed_query("I'd like a fruit.")
docs = custom_store.similarity_search_by_vector(query_vector, filter="len >= 6")

print(docs)
```

```output
[Document(page_content='Pineapple', metadata={'len': 9}), Document(page_content='Banana', metadata={'len': 6}), Document(page_content='Apples and oranges', metadata={'len': 18}), Document(page_content='Cars and airplanes', metadata={'len': 18})]
```
