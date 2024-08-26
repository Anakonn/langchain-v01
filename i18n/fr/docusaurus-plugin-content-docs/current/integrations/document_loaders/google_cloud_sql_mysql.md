---
translated: true
---

# Google Cloud SQL pour MySQL

> [Cloud SQL](https://cloud.google.com/sql) est un service de base de données relationnelle entièrement géré qui offre des performances élevées, une intégration transparente et une évolutivité impressionnante. Il propose les moteurs de base de données [MySQL](https://cloud.google.com/sql/mysql), [PostgreSQL](https://cloud.google.com/sql/postgresql) et [SQL Server](https://cloud.google.com/sql/sqlserver). Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations Langchain de Cloud SQL.

Ce notebook explique comment utiliser [Cloud SQL pour MySQL](https://cloud.google.com/sql/mysql) pour [enregistrer, charger et supprimer des documents Langchain](/docs/modules/data_connection/document_loaders/) avec `MySQLLoader` et `MySQLDocumentSaver`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/).

[![Ouvrir dans Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/docs/document_loader.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez :

* [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Activer l'API Cloud SQL Admin.](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
* [Créer une instance Cloud SQL pour MySQL](https://cloud.google.com/sql/docs/mysql/create-instance)
* [Créer une base de données Cloud SQL](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
* [Ajouter un utilisateur de base de données IAM à la base de données](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users#creating-a-database-user) (Facultatif)

Après avoir confirmé l'accès à la base de données dans l'environnement d'exécution de ce notebook, remplissez les valeurs suivantes et exécutez la cellule avant d'exécuter les scripts d'exemple.

```python
# @markdown Please fill in the both the Google Cloud region and name of your Cloud SQL instance.
REGION = "us-central1"  # @param {type:"string"}
INSTANCE = "test-instance"  # @param {type:"string"}

# @markdown Please specify a database and a table for demo purpose.
DATABASE = "test"  # @param {type:"string"}
TABLE_NAME = "test-default"  # @param {type:"string"}
```

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans son propre package `langchain-google-cloud-sql-mysql`, nous devons donc l'installer.

```python
%pip install -upgrade --quiet langchain-google-cloud-sql-mysql
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

### Connexion au pool MySQLEngine

Avant d'enregistrer ou de charger des documents à partir d'une table MySQL, nous devons d'abord configurer un pool de connexions à la base de données Cloud SQL. Le `MySQLEngine` configure un pool de connexions à votre base de données Cloud SQL, permettant des connexions réussies à partir de votre application et suivant les meilleures pratiques de l'industrie.

Pour créer un `MySQLEngine` à l'aide de `MySQLEngine.from_instance()`, vous devez fournir seulement 4 éléments :

1. `project_id` : ID du projet Google Cloud où se trouve l'instance Cloud SQL.
2. `region` : Région où se trouve l'instance Cloud SQL.
3. `instance` : Le nom de l'instance Cloud SQL.
4. `database` : Le nom de la base de données à laquelle se connecter sur l'instance Cloud SQL.

Par défaut, [l'authentification de base de données IAM](https://cloud.google.com/sql/docs/mysql/iam-authentication#iam-db-auth) sera utilisée comme méthode d'authentification de la base de données. Cette bibliothèque utilise le principal IAM appartenant aux [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) provenant de l'environnement.

Pour plus d'informations sur l'authentification de base de données IAM, consultez :

* [Configurer une instance pour l'authentification de base de données IAM](https://cloud.google.com/sql/docs/mysql/create-edit-iam-instances)
* [Gérer les utilisateurs avec l'authentification de base de données IAM](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users)

Facultativement, l'[authentification de base de données intégrée](https://cloud.google.com/sql/docs/mysql/built-in-authentication) utilisant un nom d'utilisateur et un mot de passe pour accéder à la base de données Cloud SQL peut également être utilisée. Il suffit de fournir les arguments facultatifs `user` et `password` à `MySQLEngine.from_instance()` :

* `user` : Utilisateur de base de données à utiliser pour l'authentification de base de données intégrée et la connexion
* `password` : Mot de passe de base de données à utiliser pour l'authentification de base de données intégrée et la connexion.

```python
from langchain_google_cloud_sql_mysql import MySQLEngine

engine = MySQLEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### Initialiser une table

Initialisez une table avec le schéma par défaut via `MySQLEngine.init_document_table(<table_name>)`. Colonnes de la table :

- page_content (type : text)
- langchain_metadata (type : JSON)

Le drapeau `overwrite_existing=True` signifie que la nouvelle table initialisée remplacera toute table existante du même nom.

```python
engine.init_document_table(TABLE_NAME, overwrite_existing=True)
```

### Enregistrer des documents

Enregistrez les documents Langchain avec `MySQLDocumentSaver.add_documents(<documents>)`. Pour initialiser la classe `MySQLDocumentSaver`, vous devez fournir 2 éléments :

1. `engine` - Une instance d'un moteur `MySQLEngine`.
2. `table_name` - Le nom de la table dans la base de données Cloud SQL pour stocker les documents Langchain.

```python
from langchain_core.documents import Document
from langchain_google_cloud_sql_mysql import MySQLDocumentSaver

test_docs = [
    Document(
        page_content="Apple Granny Smith 150 0.99 1",
        metadata={"fruit_id": 1},
    ),
    Document(
        page_content="Banana Cavendish 200 0.59 0",
        metadata={"fruit_id": 2},
    ),
    Document(
        page_content="Orange Navel 80 1.29 1",
        metadata={"fruit_id": 3},
    ),
]
saver = MySQLDocumentSaver(engine=engine, table_name=TABLE_NAME)
saver.add_documents(test_docs)
```

### Charger des documents

Chargez les documents Langchain avec `MySQLLoader.load()` ou `MySQLLoader.lazy_load()`. `lazy_load` renvoie un générateur qui ne requête la base de données que pendant l'itération. Pour initialiser la classe `MySQLLoader`, vous devez fournir :

1. `engine` - Une instance d'un moteur `MySQLEngine`.
2. `table_name` - Le nom de la table dans la base de données Cloud SQL pour stocker les documents Langchain.

```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.lazy_load()
for doc in docs:
    print("Loaded documents:", doc)
```

### Charger des documents via une requête

En plus de charger des documents à partir d'une table, nous pouvons également choisir de charger des documents à partir d'une vue générée à partir d'une requête SQL. Par exemple :

```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(
    engine=engine,
    query=f"select * from `{TABLE_NAME}` where JSON_EXTRACT(langchain_metadata, '$.fruit_id') = 1;",
)
onedoc = loader.load()
onedoc
```

La vue générée à partir de la requête SQL peut avoir un schéma différent de celui de la table par défaut. Dans ces cas, le comportement de MySQLLoader est le même que le chargement à partir d'une table avec un schéma non par défaut. Veuillez vous référer à la section [Charger des documents avec un contenu de page et des métadonnées personnalisés](#Charger-des-documents-avec-un-contenu-de-page-et-des-métadonnées-personnalisés).

### Supprimer des documents

Supprimez une liste de documents langchain de la table MySQL avec `MySQLDocumentSaver.delete(<documents>)`.

Pour une table avec un schéma par défaut (page_content, langchain_metadata), le critère de suppression est :

Une `ligne` doit être supprimée s'il existe un `document` dans la liste, tel que

- `document.page_content` est égal à `row[page_content]`
- `document.metadata` est égal à `row[langchain_metadata]`

```python
from langchain_google_cloud_sql_mysql import MySQLLoader

loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(onedoc)
print("Documents after delete:", loader.load())
```

## Utilisation avancée

### Charger des documents avec un contenu de page et des métadonnées personnalisés

Tout d'abord, nous préparons une table d'exemple avec un schéma non par défaut, et nous la remplissons avec des données arbitraires.

```python
import sqlalchemy

with engine.connect() as conn:
    conn.execute(sqlalchemy.text(f"DROP TABLE IF EXISTS `{TABLE_NAME}`"))
    conn.commit()
    conn.execute(
        sqlalchemy.text(
            f"""
            CREATE TABLE IF NOT EXISTS `{TABLE_NAME}`(
                fruit_id INT AUTO_INCREMENT PRIMARY KEY,
                fruit_name VARCHAR(100) NOT NULL,
                variety VARCHAR(50),
                quantity_in_stock INT NOT NULL,
                price_per_unit DECIMAL(6,2) NOT NULL,
                organic TINYINT(1) NOT NULL
            )
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO `{TABLE_NAME}` (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES
                ('Apple', 'Granny Smith', 150, 0.99, 1),
                ('Banana', 'Cavendish', 200, 0.59, 0),
                ('Orange', 'Navel', 80, 1.29, 1);
            """
        )
    )
    conn.commit()
```

Si nous chargeons toujours des documents langchain avec les paramètres par défaut de `MySQLLoader` à partir de cette table d'exemple, le `page_content` des documents chargés sera la première colonne de la table, et `metadata` sera composé de paires clé-valeur de toutes les autres colonnes.

```python
loader = MySQLLoader(
    engine=engine,
    table_name=TABLE_NAME,
)
loader.load()
```

Nous pouvons spécifier le contenu et les métadonnées que nous voulons charger en définissant les `content_columns` et `metadata_columns` lors de l'initialisation de `MySQLLoader`.

1. `content_columns` : Les colonnes à écrire dans le `page_content` du document.
2. `metadata_columns` : Les colonnes à écrire dans les `metadata` du document.

Par exemple, ici, les valeurs des colonnes dans `content_columns` seront jointes ensemble dans une chaîne séparée par des espaces, comme `page_content` des documents chargés, et `metadata` des documents chargés ne contiendra que les paires clé-valeur des colonnes spécifiées dans `metadata_columns`.

```python
loader = MySQLLoader(
    engine=engine,
    table_name=TABLE_NAME,
    content_columns=[
        "variety",
        "quantity_in_stock",
        "price_per_unit",
        "organic",
    ],
    metadata_columns=["fruit_id", "fruit_name"],
)
loader.load()
```

### Enregistrer un document avec un contenu de page et des métadonnées personnalisés

Afin d'enregistrer un document langchain dans une table avec des champs de métadonnées personnalisés, nous devons d'abord créer une telle table via `MySQLEngine.init_document_table()`, et spécifier la liste des `metadata_columns` que nous voulons qu'elle ait. Dans cet exemple, la table créée aura les colonnes suivantes :

- description (type : text) : pour stocker la description du fruit.
- fruit_name (type text) : pour stocker le nom du fruit.
- organic (type tinyint(1)) : pour indiquer si le fruit est biologique.
- other_metadata (type : JSON) : pour stocker d'autres informations de métadonnées sur le fruit.

Nous pouvons utiliser les paramètres suivants avec `MySQLEngine.init_document_table()` pour créer la table :

1. `table_name` : Le nom de la table dans la base de données Cloud SQL pour stocker les documents langchain.
2. `metadata_columns` : Une liste de `sqlalchemy.Column` indiquant la liste des colonnes de métadonnées que nous avons besoin.
3. `content_column` : Le nom de la colonne pour stocker le `page_content` du document langchain. Par défaut : `page_content`.
4. `metadata_json_column` : Le nom de la colonne JSON pour stocker les `metadata` supplémentaires du document langchain. Par défaut : `langchain_metadata`.

```python
engine.init_document_table(
    TABLE_NAME,
    metadata_columns=[
        sqlalchemy.Column(
            "fruit_name",
            sqlalchemy.UnicodeText,
            primary_key=False,
            nullable=True,
        ),
        sqlalchemy.Column(
            "organic",
            sqlalchemy.Boolean,
            primary_key=False,
            nullable=True,
        ),
    ],
    content_column="description",
    metadata_json_column="other_metadata",
    overwrite_existing=True,
)
```

Enregistrez les documents avec `MySQLDocumentSaver.add_documents(<documents>)`. Comme vous pouvez le voir dans cet exemple,

- `document.page_content` sera enregistré dans la colonne `description`.
- `document.metadata.fruit_name` sera enregistré dans la colonne `fruit_name`.
- `document.metadata.organic` sera enregistré dans la colonne `organic`.
- `document.metadata.fruit_id` sera enregistré dans la colonne `other_metadata` au format JSON.

```python
test_docs = [
    Document(
        page_content="Granny Smith 150 0.99",
        metadata={"fruit_id": 1, "fruit_name": "Apple", "organic": 1},
    ),
]
saver = MySQLDocumentSaver(
    engine=engine,
    table_name=TABLE_NAME,
    content_column="description",
    metadata_json_column="other_metadata",
)
saver.add_documents(test_docs)
```

```python
with engine.connect() as conn:
    result = conn.execute(sqlalchemy.text(f"select * from `{TABLE_NAME}`;"))
    print(result.keys())
    print(result.fetchall())
```

### Supprimer des documents avec un contenu de page et des métadonnées personnalisés

Nous pouvons également supprimer des documents de la table avec des colonnes de métadonnées personnalisées via `MySQLDocumentSaver.delete(<documents>)`. Le critère de suppression est :

Une `ligne` doit être supprimée s'il existe un `document` dans la liste, tel que

- `document.page_content` est égal à `row[page_content]`
- Pour chaque champ de métadonnées `k` dans `document.metadata`
    - `document.metadata[k]` est égal à `row[k]` ou `document.metadata[k]` est égal à `row[langchain_metadata][k]`
- Il n'y a pas de champ de métadonnées supplémentaire présent dans `row` mais pas dans `document.metadata`.

```python
loader = MySQLLoader(engine=engine, table_name=TABLE_NAME)
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(docs)
print("Documents after delete:", loader.load())
```
