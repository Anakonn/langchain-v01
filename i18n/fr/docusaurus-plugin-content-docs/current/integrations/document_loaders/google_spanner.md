---
translated: true
---

# Google Spanner

> [Spanner](https://cloud.google.com/spanner) est une base de données hautement évolutive qui combine une évolutivité illimitée avec des sémantiques relationnelles, telles que des index secondaires, une forte cohérence, des schémas et SQL, offrant une disponibilité de 99,999 % dans une seule solution facile à utiliser.

Ce notebook explique comment utiliser [Spanner](https://cloud.google.com/spanner) pour [enregistrer, charger et supprimer des documents langchain](/docs/modules/data_connection/document_loaders/) avec `SpannerLoader` et `SpannerDocumentSaver`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-spanner-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-spanner-python/blob/main/docs/document_loader.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez faire ce qui suit :

* [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Activer l'API Cloud Spanner](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)
* [Créer une instance Spanner](https://cloud.google.com/spanner/docs/create-manage-instances)
* [Créer une base de données Spanner](https://cloud.google.com/spanner/docs/create-manage-databases)
* [Créer une table Spanner](https://cloud.google.com/spanner/docs/create-query-database-console#create-schema)

Après avoir confirmé l'accès à la base de données dans l'environnement d'exécution de ce notebook, remplissez les valeurs suivantes et exécutez la cellule avant d'exécuter les scripts d'exemple.

```python
# @markdown Please specify an instance id, a database, and a table for demo purpose.
INSTANCE_ID = "test_instance"  # @param {type:"string"}
DATABASE_ID = "test_database"  # @param {type:"string"}
TABLE_NAME = "test_table"  # @param {type:"string"}
```

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans son propre package `langchain-google-spanner`, nous devons donc l'installer.

```python
%pip install -upgrade --quiet langchain-google-spanner langchain
```

**Colab uniquement** : Décommentez la cellule suivante pour redémarrer le noyau ou utilisez le bouton pour redémarrer le noyau. Pour Vertex AI Workbench, vous pouvez redémarrer le terminal à l'aide du bouton en haut.

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

Enregistrez des documents langchain avec `SpannerDocumentSaver.add_documents(<documents>)`. Pour initialiser la classe `SpannerDocumentSaver`, vous devez fournir 3 éléments :

1. `instance_id` - Une instance de Spanner à partir de laquelle charger les données.
1. `database_id` - Une instance de la base de données Spanner à partir de laquelle charger les données.
1. `table_name` - Le nom de la table dans la base de données Spanner pour stocker les documents langchain.

```python
from langchain_core.documents import Document
from langchain_google_spanner import SpannerDocumentSaver

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

saver = SpannerDocumentSaver(
    instance_id=INSTANCE_ID,
    database_id=DATABASE_ID,
    table_name=TABLE_NAME,
)
saver.add_documents(test_docs)
```

### Interroger des documents à partir de Spanner

Pour plus de détails sur la connexion à une table Spanner, veuillez consulter la [documentation du SDK Python](https://cloud.google.com/python/docs/reference/spanner/latest).

#### Charger des documents à partir de la table

Chargez des documents langchain avec `SpannerLoader.load()` ou `SpannerLoader.lazy_load()`. `lazy_load` renvoie un générateur qui n'interroge la base de données que pendant l'itération. Pour initialiser la classe `SpannerLoader`, vous devez fournir :

1. `instance_id` - Une instance de Spanner à partir de laquelle charger les données.
1. `database_id` - Une instance de la base de données Spanner à partir de laquelle charger les données.
1. `query` - Une requête du dialecte de la base de données.

```python
from langchain_google_spanner import SpannerLoader

query = f"SELECT * from {TABLE_NAME}"
loader = SpannerLoader(
    instance_id=INSTANCE_ID,
    database_id=DATABASE_ID,
    query=query,
)

for doc in loader.lazy_load():
    print(doc)
    break
```

### Supprimer des documents

Supprimez une liste de documents langchain de la table avec `SpannerDocumentSaver.delete(<documents>)`.

```python
docs = loader.load()
print("Documents before delete:", docs)

doc = test_docs[0]
saver.delete([doc])
print("Documents after delete:", loader.load())
```

## Utilisation avancée

### Client personnalisé

Le client créé par défaut est le client par défaut. Pour passer explicitement les `credentials` et le `project`, un client personnalisé peut être transmis au constructeur.

```python
from google.cloud import spanner
from google.oauth2 import service_account

creds = service_account.Credentials.from_service_account_file("/path/to/key.json")
custom_client = spanner.Client(project="my-project", credentials=creds)
loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    client=custom_client,
)
```

### Personnaliser le contenu et les métadonnées de la page du document

Le chargeur renverra une liste de documents avec le contenu de la page à partir d'une colonne de données spécifique. Toutes les autres colonnes de données seront ajoutées aux métadonnées. Chaque ligne devient un document.

#### Personnaliser le format du contenu de la page

Le SpannerLoader suppose qu'il y a une colonne appelée `page_content`. Ces valeurs par défaut peuvent être modifiées comme suit :

```python
custom_content_loader = SpannerLoader(
    INSTANCE_ID, DATABASE_ID, query, content_columns=["custom_content"]
)
```

Si plusieurs colonnes sont spécifiées, le format de la chaîne de contenu de la page sera par défaut `text` (concaténation de chaînes séparées par des espaces). Il existe d'autres formats que l'utilisateur peut spécifier, notamment `text`, `JSON`, `YAML`, `CSV`.

#### Personnaliser le format des métadonnées

Le SpannerLoader suppose qu'il y a une colonne de métadonnées appelée `langchain_metadata` qui stocke des données JSON. La colonne de métadonnées sera utilisée comme dictionnaire de base. Par défaut, toutes les autres données de colonne seront ajoutées et pourront écraser la valeur d'origine. Ces valeurs par défaut peuvent être modifiées comme suit :

```python
custom_metadata_loader = SpannerLoader(
    INSTANCE_ID, DATABASE_ID, query, metadata_columns=["column1", "column2"]
)
```

#### Personnaliser le nom de la colonne de métadonnées JSON

Par défaut, le chargeur utilise `langchain_metadata` comme dictionnaire de base. Cela peut être personnalisé pour sélectionner une colonne JSON à utiliser comme dictionnaire de base pour les métadonnées du document.

```python
custom_metadata_json_loader = SpannerLoader(
    INSTANCE_ID, DATABASE_ID, query, metadata_json_column="another-json-column"
)
```

### Fraîcheur personnalisée

La [fraîcheur](https://cloud.google.com/python/docs/reference/spanner/latest/snapshot-usage#beginning-a-snapshot) par défaut est de 15 s. Cela peut être personnalisé en spécifiant une limite plus faible (qui peut être d'effectuer toutes les lectures à un moment donné donné) ou à une durée donnée dans le passé.

```python
import datetime

timestamp = datetime.datetime.utcnow()
custom_timestamp_loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    staleness=timestamp,
)
```

```python
duration = 20.0
custom_duration_loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    staleness=duration,
)
```

### Activer le boost des données

Par défaut, le chargeur n'utilisera pas le [boost des données](https://cloud.google.com/spanner/docs/databoost/databoost-overview) car il a des coûts supplémentaires associés et nécessite des autorisations IAM supplémentaires. Cependant, l'utilisateur peut choisir de l'activer.

```python
custom_databoost_loader = SpannerLoader(
    INSTANCE_ID,
    DATABASE_ID,
    query,
    databoost=True,
)
```

### Client personnalisé

Le client créé par défaut est le client par défaut. Pour passer explicitement les `credentials` et le `project`, un client personnalisé peut être transmis au constructeur.

```python
from google.cloud import spanner

custom_client = spanner.Client(project="my-project", credentials=creds)
saver = SpannerDocumentSaver(
    INSTANCE_ID,
    DATABASE_ID,
    TABLE_NAME,
    client=custom_client,
)
```

### Initialisation personnalisée pour SpannerDocumentSaver

Le SpannerDocumentSaver permet une initialisation personnalisée. Cela permet à l'utilisateur de spécifier comment le Document est enregistré dans la table.

content_column : Cela sera utilisé comme nom de colonne pour le contenu de la page du Document. Défaut à `page_content`.

metadata_columns : Ces métadonnées seront enregistrées dans des colonnes spécifiques si la clé existe dans les métadonnées du Document.

metadata_json_column : Ce sera le nom de colonne pour la colonne JSON spéciale. Défaut à `langchain_metadata`.

```python
custom_saver = SpannerDocumentSaver(
    INSTANCE_ID,
    DATABASE_ID,
    TABLE_NAME,
    content_column="my-content",
    metadata_columns=["foo"],
    metadata_json_column="my-special-json-column",
)
```

### Initialiser un schéma personnalisé pour Spanner

Le SpannerDocumentSaver aura une méthode `init_document_table` pour créer une nouvelle table pour stocker les documents avec un schéma personnalisé.

```python
from langchain_google_spanner import Column

new_table_name = "my_new_table"

SpannerDocumentSaver.init_document_table(
    INSTANCE_ID,
    DATABASE_ID,
    new_table_name,
    content_column="my-page-content",
    metadata_columns=[
        Column("category", "STRING(36)", True),
        Column("price", "FLOAT64", False),
    ],
)
```
