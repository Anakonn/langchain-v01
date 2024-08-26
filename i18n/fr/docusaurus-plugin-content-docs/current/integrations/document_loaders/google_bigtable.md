---
translated: true
---

# Google Bigtable

> [Bigtable](https://cloud.google.com/bigtable) est un magasin de clés-valeurs et de colonnes larges, idéal pour un accès rapide à des données structurées, semi-structurées ou non structurées. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations Langchain de Bigtable.

Ce notebook explique comment utiliser [Bigtable](https://cloud.google.com/bigtable) pour [enregistrer, charger et supprimer des documents Langchain](/docs/modules/data_connection/document_loaders/) avec `BigtableLoader` et `BigtableSaver`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-bigtable-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-bigtable-python/blob/main/docs/document_loader.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez faire ce qui suit :

* [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Activer l'API Bigtable](https://console.cloud.google.com/flows/enableapi?apiid=bigtable.googleapis.com)
* [Créer une instance Bigtable](https://cloud.google.com/bigtable/docs/creating-instance)
* [Créer une table Bigtable](https://cloud.google.com/bigtable/docs/managing-tables)
* [Créer des identifiants d'accès Bigtable](https://developers.google.com/workspace/guides/create-credentials)

Après avoir confirmé l'accès à la base de données dans l'environnement d'exécution de ce notebook, remplissez les valeurs suivantes et exécutez la cellule avant d'exécuter les scripts d'exemple.

```python
# @markdown Please specify an instance and a table for demo purpose.
INSTANCE_ID = "my_instance"  # @param {type:"string"}
TABLE_ID = "my_table"  # @param {type:"string"}
```

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans son propre package `langchain-google-bigtable`, nous devons donc l'installer.

```python
%pip install -upgrade --quiet langchain-google-bigtable
```

**Colab uniquement** : Décommentez la cellule suivante pour redémarrer le noyau ou utilisez le bouton pour le redémarrer. Pour Vertex AI Workbench, vous pouvez redémarrer le terminal à l'aide du bouton en haut.

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

### Utilisation du saver

Enregistrez les documents Langchain avec `BigtableSaver.add_documents(<documents>)`. Pour initialiser la classe `BigtableSaver`, vous devez fournir 2 éléments :

1. `instance_id` - Une instance de Bigtable.
1. `table_id` - Le nom de la table au sein de Bigtable pour stocker les documents Langchain.

```python
from langchain_core.documents import Document
from langchain_google_bigtable import BigtableSaver

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

saver = BigtableSaver(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)

saver.add_documents(test_docs)
```

### Interrogation de documents à partir de Bigtable

Pour plus de détails sur la connexion à une table Bigtable, veuillez consulter la [documentation du SDK Python](https://cloud.google.com/python/docs/reference/bigtable/latest/client).

#### Charger des documents à partir de la table

Chargez les documents Langchain avec `BigtableLoader.load()` ou `BigtableLoader.lazy_load()`. `lazy_load` renvoie un générateur qui interroge la base de données uniquement pendant l'itération. Pour initialiser la classe `BigtableLoader`, vous devez fournir :

1. `instance_id` - Une instance de Bigtable.
1. `table_id` - Le nom de la table au sein de Bigtable pour stocker les documents Langchain.

```python
from langchain_google_bigtable import BigtableLoader

loader = BigtableLoader(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)

for doc in loader.lazy_load():
    print(doc)
    break
```

### Supprimer des documents

Supprimez une liste de documents Langchain de la table Bigtable avec `BigtableSaver.delete(<documents>)`.

```python
from langchain_google_bigtable import BigtableSaver

docs = loader.load()
print("Documents before delete: ", docs)

onedoc = test_docs[0]
saver.delete([onedoc])
print("Documents after delete: ", loader.load())
```

## Utilisation avancée

### Limiter les lignes renvoyées

Il existe deux moyens de limiter les lignes renvoyées :

1. En utilisant un [filtre](https://cloud.google.com/python/docs/reference/bigtable/latest/row-filters)
2. En utilisant un [row_set](https://cloud.google.com/python/docs/reference/bigtable/latest/row-set#google.cloud.bigtable.row_set.RowSet)

```python
import google.cloud.bigtable.row_filters as row_filters

filter_loader = BigtableLoader(
    INSTANCE_ID, TABLE_ID, filter=row_filters.ColumnQualifierRegexFilter(b"os_build")
)


from google.cloud.bigtable.row_set import RowSet

row_set = RowSet()
row_set.add_row_range_from_keys(
    start_key="phone#4c410523#20190501", end_key="phone#4c410523#201906201"
)

row_set_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    row_set=row_set,
)
```

### Client personnalisé

Le client créé par défaut est le client par défaut, en utilisant uniquement l'option admin=True. Pour utiliser un non-défaut, un [client personnalisé](https://cloud.google.com/python/docs/reference/bigtable/latest/client#class-googlecloudbigtableclientclientprojectnone-credentialsnone-readonlyfalse-adminfalse-clientinfonone-clientoptionsnone-adminclientoptionsnone-channelnone) peut être transmis au constructeur.

```python
from google.cloud import bigtable

custom_client_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    client=bigtable.Client(...),
)
```

### Contenu personnalisé

Le `BigtableLoader` suppose qu'il y a une famille de colonnes appelée `langchain`, qui a une colonne appelée `content`, qui contient des valeurs encodées en UTF-8. Ces valeurs par défaut peuvent être modifiées comme suit :

```python
from langchain_google_bigtable import Encoding

custom_content_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    content_encoding=Encoding.ASCII,
    content_column_family="my_content_family",
    content_column_name="my_content_column_name",
)
```

### Mappage des métadonnées

Par défaut, la carte `metadata` sur l'objet `Document` contiendra une seule clé, `rowkey`, avec la valeur de la valeur de la ligne de la ligne. Pour ajouter plus d'éléments à cette carte, utilisez `metadata_mapping`.

```python
import json

from langchain_google_bigtable import MetadataMapping

metadata_mapping_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    metadata_mappings=[
        MetadataMapping(
            column_family="my_int_family",
            column_name="my_int_column",
            metadata_key="key_in_metadata_map",
            encoding=Encoding.INT_BIG_ENDIAN,
        ),
        MetadataMapping(
            column_family="my_custom_family",
            column_name="my_custom_column",
            metadata_key="custom_key",
            encoding=Encoding.CUSTOM,
            custom_decoding_func=lambda input: json.loads(input.decode()),
            custom_encoding_func=lambda input: str.encode(json.dumps(input)),
        ),
    ],
)
```

### Métadonnées au format JSON

S'il y a une colonne dans Bigtable qui contient une chaîne JSON que vous souhaitez ajouter aux métadonnées du document de sortie, il est possible d'ajouter les paramètres suivants à `BigtableLoader`. Notez que la valeur par défaut de `metadata_as_json_encoding` est UTF-8.

```python
metadata_as_json_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    metadata_as_json_encoding=Encoding.ASCII,
    metadata_as_json_family="my_metadata_as_json_family",
    metadata_as_json_name="my_metadata_as_json_column_name",
)
```

### Personnaliser BigtableSaver

Le `BigtableSaver` est également personnalisable de manière similaire à `BigtableLoader`.

```python
saver = BigtableSaver(
    INSTANCE_ID,
    TABLE_ID,
    client=bigtable.Client(...),
    content_encoding=Encoding.ASCII,
    content_column_family="my_content_family",
    content_column_name="my_content_column_name",
    metadata_mappings=[
        MetadataMapping(
            column_family="my_int_family",
            column_name="my_int_column",
            metadata_key="key_in_metadata_map",
            encoding=Encoding.INT_BIG_ENDIAN,
        ),
        MetadataMapping(
            column_family="my_custom_family",
            column_name="my_custom_column",
            metadata_key="custom_key",
            encoding=Encoding.CUSTOM,
            custom_decoding_func=lambda input: json.loads(input.decode()),
            custom_encoding_func=lambda input: str.encode(json.dumps(input)),
        ),
    ],
    metadata_as_json_encoding=Encoding.ASCII,
    metadata_as_json_family="my_metadata_as_json_family",
    metadata_as_json_name="my_metadata_as_json_column_name",
)
```
