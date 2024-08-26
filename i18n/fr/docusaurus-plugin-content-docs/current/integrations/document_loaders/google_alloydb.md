---
translated: true
---

# Google AlloyDB pour PostgreSQL

> [AlloyDB](https://cloud.google.com/alloydb) est un service de base de données relationnelle entièrement géré qui offre des performances élevées, une intégration transparente et une évolutivité impressionnante. AlloyDB est 100% compatible avec PostgreSQL. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations Langchain d'AlloyDB.

Ce notebook explique comment utiliser `AlloyDB pour PostgreSQL` pour charger des documents avec la classe `AlloyDBLoader`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-alloydb-pg-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-alloydb-pg-python/blob/main/docs/document_loader.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez faire ce qui suit :

 * [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Activer l'API AlloyDB](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)
 * [Créer un cluster et une instance AlloyDB.](https://cloud.google.com/alloydb/docs/cluster-create)
 * [Créer une base de données AlloyDB.](https://cloud.google.com/alloydb/docs/quickstart/create-and-connect)
 * [Ajouter un utilisateur à la base de données.](https://cloud.google.com/alloydb/docs/database-users/about)

### 🦜🔗 Installation de la bibliothèque

Installez la bibliothèque d'intégration, `langchain-google-alloydb-pg`.

```python
%pip install --upgrade --quiet  langchain-google-alloydb-pg
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

### Définir les variables de la base de données AlloyDB

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

L'une des exigences et des arguments pour établir AlloyDB en tant que magasin de vecteurs est un objet `AlloyDBEngine`. Le `AlloyDBEngine` configure un pool de connexions à votre base de données AlloyDB, permettant des connexions réussies à partir de votre application et suivant les meilleures pratiques de l'industrie.

Pour créer un `AlloyDBEngine` à l'aide de `AlloyDBEngine.from_instance()`, vous devez fournir seulement 5 choses :

1. `project_id` : ID du projet Google Cloud où se trouve l'instance AlloyDB.
1. `region` : Région où se trouve l'instance AlloyDB.
1. `cluster`: Le nom du cluster AlloyDB.
1. `instance` : Le nom de l'instance AlloyDB.
1. `database` : Le nom de la base de données à laquelle se connecter sur l'instance AlloyDB.

Par défaut, [l'authentification de base de données IAM](https://cloud.google.com/alloydb/docs/connect-iam) sera utilisée comme méthode d'authentification de la base de données. Cette bibliothèque utilise le principal IAM appartenant aux [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) provenant de l'environnement.

Facultativement, [l'authentification de base de données intégrée](https://cloud.google.com/alloydb/docs/database-users/about) utilisant un nom d'utilisateur et un mot de passe pour accéder à la base de données AlloyDB peut également être utilisée. Il suffit de fournir les arguments facultatifs `user` et `password` à `AlloyDBEngine.from_instance()` :

* `user` : Utilisateur de la base de données à utiliser pour l'authentification de la base de données intégrée et la connexion
* `password` : Mot de passe de la base de données à utiliser pour l'authentification de la base de données intégrée et la connexion.

**Remarque** : Ce tutoriel démontre l'interface asynchrone. Toutes les méthodes asynchrones ont des méthodes synchrones correspondantes.

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

### Créer AlloyDBLoader

```python
from langchain_google_alloydb_pg import AlloyDBLoader

# Creating a basic AlloyDBLoader object
loader = await AlloyDBLoader.create(engine, table_name=TABLE_NAME)
```

### Charger des documents via la table par défaut

Le chargeur renvoie une liste de documents à partir de la table en utilisant la première colonne comme page_content et toutes les autres colonnes comme métadonnées. La table par défaut aura la première colonne comme page_content et la deuxième colonne comme métadonnées (JSON). Chaque ligne devient un document.

```python
docs = await loader.aload()
print(docs)
```

### Charger des documents via une table/métadonnées personnalisée ou des colonnes de contenu de page personnalisées

```python
loader = await AlloyDBLoader.create(
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
loader = AlloyDBLoader.create(
    engine,
    table_name="products",
    content_columns=["product_name", "description"],
    format="YAML",
)
docs = await loader.aload()
print(docs)
```
