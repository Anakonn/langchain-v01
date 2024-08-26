---
translated: true
---

# Google Cloud SQL pour PostgreSQL

> [Cloud SQL pour PostgreSQL](https://cloud.google.com/sql/docs/postgres) est un service de base de données entièrement géré qui vous aide à configurer, maintenir, gérer et administrer vos bases de données relationnelles PostgreSQL sur Google Cloud Platform. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations Langchain de Cloud SQL pour PostgreSQL.

Ce notebook explique comment utiliser `Cloud SQL pour PostgreSQL` pour charger des documents avec la classe `PostgresLoader`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-pg-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-pg-python/blob/main/docs/document_loader.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez faire ce qui suit :

 * [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Activer l'API Cloud SQL Admin.](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
 * [Créer une instance Cloud SQL pour PostgreSQL.](https://cloud.google.com/sql/docs/postgres/create-instance)
 * [Créer une base de données Cloud SQL pour PostgreSQL.](https://cloud.google.com/sql/docs/postgres/create-manage-databases)
 * [Ajouter un utilisateur à la base de données.](https://cloud.google.com/sql/docs/postgres/create-manage-users)

### 🦜🔗 Installation de la bibliothèque

Installez la bibliothèque d'intégration, `langchain_google_cloud_sql_pg`.

```python
%pip install --upgrade --quiet  langchain_google_cloud_sql_pg
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
# @title Project { display-mode: "form" }
PROJECT_ID = "gcp_project_id"  # @param {type:"string"}

# Set the project id
! gcloud config set project {PROJECT_ID}
```

## Utilisation de base

### Définir les valeurs de la base de données Cloud SQL

Trouvez vos variables de base de données dans la [page des instances Cloud SQL](https://console.cloud.google.com/sql/instances).

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-primary"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "vector_store"  # @param {type: "string"}
```

### Moteur Cloud SQL

L'un des prérequis et arguments pour établir PostgreSQL comme chargeur de documents est un objet `PostgresEngine`. Le `PostgresEngine` configure un pool de connexions à votre base de données Cloud SQL pour PostgreSQL, permettant des connexions réussies à partir de votre application et suivant les meilleures pratiques de l'industrie.

Pour créer un `PostgresEngine` à l'aide de `PostgresEngine.from_instance()`, vous devez fournir seulement 4 éléments :

1. `project_id` : ID du projet Google Cloud où se trouve l'instance Cloud SQL.
1. `region` : Région où se trouve l'instance Cloud SQL.
1. `instance` : Le nom de l'instance Cloud SQL.
1. `database` : Le nom de la base de données à laquelle se connecter sur l'instance Cloud SQL.

Par défaut, [l'authentification de base de données IAM](https://cloud.google.com/sql/docs/postgres/iam-authentication) sera utilisée comme méthode d'authentification de la base de données. Cette bibliothèque utilise le principal IAM appartenant aux [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) provenant de l'environnement.

Facultativement, [l'authentification de base de données intégrée](https://cloud.google.com/sql/docs/postgres/users) utilisant un nom d'utilisateur et un mot de passe pour accéder à la base de données Cloud SQL peut également être utilisée. Il suffit de fournir les arguments facultatifs `user` et `password` à `PostgresEngine.from_instance()` :

* `user` : Utilisateur de la base de données à utiliser pour l'authentification de base de données intégrée et la connexion
* `password` : Mot de passe de la base de données à utiliser pour l'authentification de base de données intégrée et la connexion.

**Remarque** : Ce tutoriel montre l'interface asynchrone. Toutes les méthodes asynchrones ont des méthodes synchrones correspondantes.

```python
from langchain_google_cloud_sql_pg import PostgresEngine

engine = await PostgresEngine.afrom_instance(
    project_id=PROJECT_ID,
    region=REGION,
    instance=INSTANCE,
    database=DATABASE,
)
```

### Créer PostgresLoader

```python
from langchain_google_cloud_sql_pg import PostgresLoader

# Creating a basic PostgreSQL object
loader = await PostgresLoader.create(engine, table_name=TABLE_NAME)
```

### Charger des documents via la table par défaut

Le chargeur renvoie une liste de documents à partir de la table en utilisant la première colonne comme page_content et toutes les autres colonnes comme métadonnées. La table par défaut aura la première colonne comme page_content et la deuxième colonne comme métadonnées (JSON). Chaque ligne devient un document. Veuillez noter que si vous voulez que vos documents aient des identifiants, vous devrez les ajouter.

```python
from langchain_google_cloud_sql_pg import PostgresLoader

# Creating a basic PostgresLoader object
loader = await PostgresLoader.create(engine, table_name=TABLE_NAME)

docs = await loader.aload()
print(docs)
```

### Charger des documents via une table/métadonnées personnalisée ou des colonnes de contenu de page personnalisées

```python
loader = await PostgresLoader.create(
    engine,
    table_name=TABLE_NAME,
    content_columns=["product_name"],  # Optional
    metadata_columns=["id"],  # Optional
)
docs = await loader.aload()
print(docs)
```

### Définir le format du contenu de la page

Le chargeur renvoie une liste de documents, avec un document par ligne, avec le contenu de la page dans le format de chaîne spécifié, c'est-à-dire texte (concaténation séparée par des espaces), JSON, YAML, CSV, etc. Les formats JSON et YAML incluent les en-têtes, tandis que le texte et le CSV n'incluent pas les en-têtes de champ.

```python
loader = await PostgresLoader.create(
    engine,
    table_name="products",
    content_columns=["product_name", "description"],
    format="YAML",
)
docs = await loader.aload()
print(docs)
```
