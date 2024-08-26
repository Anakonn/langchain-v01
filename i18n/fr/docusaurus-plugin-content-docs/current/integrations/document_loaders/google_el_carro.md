---
translated: true
---

# Google El Carro pour les charges de travail Oracle

> L'opérateur Google [El Carro Oracle](https://github.com/GoogleCloudPlatform/elcarro-oracle-operator) offre un moyen d'exécuter des bases de données Oracle dans Kubernetes en tant que système d'orchestration de conteneurs portable, open source, piloté par la communauté et sans verrouillage fournisseur. El Carro fournit une puissante API déclarative pour une configuration et un déploiement complets et cohérents, ainsi que pour des opérations et une surveillance en temps réel.
Étendez les capacités de votre base de données Oracle pour construire des expériences alimentées par l'IA en tirant parti de l'intégration El Carro Langchain.

Ce guide explique comment utiliser l'intégration El Carro Langchain pour [enregistrer, charger et supprimer des documents langchain](/docs/modules/data_connection/document_loaders/) avec `ElCarroLoader` et `ElCarroDocumentSaver`. Cette intégration fonctionne pour toute base de données Oracle, quel que soit l'endroit où elle s'exécute.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-el-carro-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-el-carro-python/blob/main/docs/document_loader.ipynb)

## Avant de commencer

Veuillez terminer la section [Démarrage](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/README.md#getting-started) du README pour configurer votre base de données Oracle El Carro.

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans son propre package `langchain-google-el-carro`, nous devons donc l'installer.

```python
%pip install --upgrade --quiet langchain-google-el-carro
```

## Utilisation de base

### Configurer la connexion à la base de données Oracle

Remplissez la variable suivante avec les détails de connexion à votre base de données Oracle.

```python
# @title Set Your Values Here { display-mode: "form" }
HOST = "127.0.0.1"  # @param {type: "string"}
PORT = 3307  # @param {type: "integer"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
USER = "my-user"  # @param {type: "string"}
PASSWORD = input("Please provide a password to be used for the database user: ")
```

Si vous utilisez El Carro, vous pouvez trouver les valeurs d'hôte et de port dans l'état de l'instance Kubernetes El Carro.
Utilisez le mot de passe utilisateur que vous avez créé pour votre PDB.

Exemple de sortie :

```output
kubectl get -w instances.oracle.db.anthosapis.com -n db
NAME   DB ENGINE   VERSION   EDITION      ENDPOINT      URL                DB NAMES   BACKUP ID   READYSTATUS   READYREASON        DBREADYSTATUS   DBREADYREASON

mydb   Oracle      18c       Express      mydb-svc.db   34.71.69.25:6021   ['pdbname']            TRUE          CreateComplete     True            CreateComplete
```

### Pool de connexions ElCarroEngine

`ElCarroEngine` configure un pool de connexions à votre base de données Oracle, permettant des connexions réussies depuis votre application et suivant les meilleures pratiques de l'industrie.

```python
from langchain_google_el_carro import ElCarroEngine

elcarro_engine = ElCarroEngine.from_instance(
    db_host=HOST,
    db_port=PORT,
    db_name=DATABASE,
    db_user=USER,
    db_password=PASSWORD,
)
```

### Initialiser une table

Initialisez une table du schéma par défaut via `elcarro_engine.init_document_table(<nom_table>)`. Colonnes de la table :

- page_content (type : text)
- langchain_metadata (type : JSON)

```python
elcarro_engine.drop_document_table(TABLE_NAME)
elcarro_engine.init_document_table(
    table_name=TABLE_NAME,
)
```

### Enregistrer des documents

Enregistrez des documents langchain avec `ElCarroDocumentSaver.add_documents(<documents>)`.
Pour initialiser la classe `ElCarroDocumentSaver`, vous devez fournir 2 éléments :

1. `elcarro_engine` - Une instance d'un moteur `ElCarroEngine`.
2. `table_name` - Le nom de la table dans la base de données Oracle pour stocker les documents langchain.

```python
from langchain_core.documents import Document
from langchain_google_el_carro import ElCarroDocumentSaver

doc = Document(
    page_content="Banana",
    metadata={"type": "fruit", "weight": 100, "organic": 1},
)

saver = ElCarroDocumentSaver(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
)
saver.add_documents([doc])
```

### Charger des documents

Chargez des documents langchain avec `ElCarroLoader.load()` ou `ElCarroLoader.lazy_load()`.
`lazy_load` renvoie un générateur qui ne requête la base de données que pendant l'itération.
Pour initialiser la classe `ElCarroLoader`, vous devez fournir :

1. `elcarro_engine` - Une instance d'un moteur `ElCarroEngine`.
2. `table_name` - Le nom de la table dans la base de données Oracle pour stocker les documents langchain.

```python
from langchain_google_el_carro import ElCarroLoader

loader = ElCarroLoader(elcarro_engine=elcarro_engine, table_name=TABLE_NAME)
docs = loader.lazy_load()
for doc in docs:
    print("Loaded documents:", doc)
```

### Charger des documents via une requête

Outre le chargement de documents à partir d'une table, nous pouvons également choisir de charger des documents à partir d'une vue générée à partir d'une requête SQL. Par exemple :

```python
from langchain_google_el_carro import ElCarroLoader

loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    query=f"SELECT * FROM {TABLE_NAME} WHERE json_value(langchain_metadata, '$.organic') = '1'",
)
onedoc = loader.load()
print(onedoc)
```

La vue générée à partir de la requête SQL peut avoir un schéma différent du tableau par défaut.
Dans ces cas, le comportement d'ElCarroLoader est le même que le chargement à partir d'une table avec un schéma non par défaut. Veuillez vous référer à la section [Charger des documents avec un contenu de page de document et des métadonnées personnalisés](#charger-des-documents-avec-un-contenu-de-page-de-document-et-des-métadonnées-personnalisés).

### Supprimer des documents

Supprimez une liste de documents langchain d'une table Oracle avec `ElCarroDocumentSaver.delete(<documents>)`.

Pour une table avec un schéma par défaut (page_content, langchain_metadata), le critère de suppression est :

Une `ligne` doit être supprimée s'il existe un `document` dans la liste, tel que

- `document.page_content` est égal à `ligne[page_content]`
- `document.metadata` est égal à `ligne[langchain_metadata]`

```python
docs = loader.load()
print("Documents before delete:", docs)
saver.delete(onedoc)
print("Documents after delete:", loader.load())
```

## Utilisation avancée

### Charger des documents avec un contenu de page de document et des métadonnées personnalisés

Tout d'abord, nous préparons une table d'exemple avec un schéma non par défaut et la remplissons avec des données arbitraires.

```python
import sqlalchemy

create_table_query = f"""CREATE TABLE {TABLE_NAME} (
    fruit_id NUMBER GENERATED BY DEFAULT AS IDENTITY (START WITH 1),
    fruit_name VARCHAR2(100) NOT NULL,
    variety VARCHAR2(50),
    quantity_in_stock NUMBER(10) NOT NULL,
    price_per_unit NUMBER(6,2) NOT NULL,
    organic NUMBER(3) NOT NULL
)"""
elcarro_engine.drop_document_table(TABLE_NAME)

with elcarro_engine.connect() as conn:
    conn.execute(sqlalchemy.text(create_table_query))
    conn.commit()
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Apple', 'Granny Smith', 150, 0.99, 1)
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Banana', 'Cavendish', 200, 0.59, 0)
            """
        )
    )
    conn.execute(
        sqlalchemy.text(
            f"""
            INSERT INTO {TABLE_NAME} (fruit_name, variety, quantity_in_stock, price_per_unit, organic)
            VALUES ('Orange', 'Navel', 80, 1.29, 1)
            """
        )
    )
    conn.commit()
```

Si nous chargeons toujours des documents langchain avec les paramètres par défaut d'`ElCarroLoader` à partir de cette table d'exemple, le `page_content` des documents chargés sera la première colonne de la table et `metadata` consistera en paires clé-valeur de toutes les autres colonnes.

```python
loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
)
loaded_docs = loader.load()
print(f"Loaded Documents: [{loaded_docs}]")
```

Nous pouvons spécifier le contenu et les métadonnées que nous voulons charger en définissant `content_columns` et `metadata_columns` lors de l'initialisation d'`ElCarroLoader`.

1. `content_columns` : Les colonnes à écrire dans le `page_content` du document.
2. `metadata_columns` : Les colonnes à écrire dans les `metadata` du document.

Par exemple, ici, les valeurs des colonnes dans `content_columns` seront jointes ensemble dans une chaîne séparée par des espaces, comme `page_content` des documents chargés, et `metadata` des documents chargés ne contiendra que les paires clé-valeur des colonnes spécifiées dans `metadata_columns`.

```python
loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_columns=[
        "variety",
        "quantity_in_stock",
        "price_per_unit",
        "organic",
    ],
    metadata_columns=["fruit_id", "fruit_name"],
)
loaded_docs = loader.load()
print(f"Loaded Documents: [{loaded_docs}]")
```

### Enregistrer le document avec un contenu de page et des métadonnées personnalisés

Afin d'enregistrer le document langchain dans une table avec des champs de métadonnées personnalisés, nous devons d'abord créer une telle table via `ElCarroEngine.init_document_table()`, et spécifier la liste des `metadata_columns` que nous voulons qu'elle ait. Dans cet exemple, la table créée aura les colonnes suivantes :

- content (type : text) : pour stocker la description du fruit.
- type (type VARCHAR2(200)) : pour stocker le type de fruit.
- weight (type INT) : pour stocker le poids du fruit.
- extra_json_metadata (type : JSON) : pour stocker d'autres informations de métadonnées sur le fruit.

Nous pouvons utiliser les paramètres suivants avec `elcarro_engine.init_document_table()` pour créer la table :

1. `table_name` : Le nom de la table dans la base de données Oracle pour stocker les documents langchain.
2. `metadata_columns` : Une liste de `sqlalchemy.Column` indiquant la liste des colonnes de métadonnées dont nous avons besoin.
3. `content_column` : nom de colonne pour stocker le `page_content` du document langchain. Par défaut : `"page_content", "VARCHAR2(4000)"`.
4. `metadata_json_column` : nom de colonne pour stocker les `metadata` JSON supplémentaires du document langchain. Par défaut : `"langchain_metadata", "VARCHAR2(4000)"`.

```python
elcarro_engine.drop_document_table(TABLE_NAME)
elcarro_engine.init_document_table(
    table_name=TABLE_NAME,
    metadata_columns=[
        sqlalchemy.Column("type", sqlalchemy.dialects.oracle.VARCHAR2(200)),
        sqlalchemy.Column("weight", sqlalchemy.INT),
    ],
    content_column="content",
    metadata_json_column="extra_json_metadata",
)
```

Enregistrez les documents avec `ElCarroDocumentSaver.add_documents(<documents>)`. Comme vous pouvez le voir dans cet exemple :

- `document.page_content` sera enregistré dans la colonne `content`.
- `document.metadata.type` sera enregistré dans la colonne `type`.
- `document.metadata.weight` sera enregistré dans la colonne `weight`.
- `document.metadata.organic` sera enregistré dans la colonne `extra_json_metadata` au format JSON.

```python
doc = Document(
    page_content="Banana",
    metadata={"type": "fruit", "weight": 100, "organic": 1},
)

print(f"Original Document: [{doc}]")

saver = ElCarroDocumentSaver(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_column="content",
    metadata_json_column="extra_json_metadata",
)
saver.add_documents([doc])

loader = ElCarroLoader(
    elcarro_engine=elcarro_engine,
    table_name=TABLE_NAME,
    content_columns=["content"],
    metadata_columns=[
        "type",
        "weight",
    ],
    metadata_json_column="extra_json_metadata",
)

loaded_docs = loader.load()
print(f"Loaded Document: [{loaded_docs[0]}]")
```

### Supprimer les documents avec un contenu de page et des métadonnées personnalisés

Nous pouvons également supprimer des documents de la table avec des colonnes de métadonnées personnalisées via `ElCarroDocumentSaver.delete(<documents>)`. Le critère de suppression est :

Une `ligne` doit être supprimée s'il existe un `document` dans la liste, tel que :

- `document.page_content` est égal à `row[page_content]`
- Pour chaque champ de métadonnées `k` dans `document.metadata`
    - `document.metadata[k]` est égal à `row[k]` ou `document.metadata[k]` est égal à `row[langchain_metadata][k]`
- Il n'y a pas de champ de métadonnées supplémentaire présent dans `row` mais pas dans `document.metadata`.

```python
loader = ElCarroLoader(elcarro_engine=elcarro_engine, table_name=TABLE_NAME)
saver.delete(loader.load())
print(f"Documents left: {len(loader.load())}")
```

## Autres exemples

Veuillez consulter [demo_doc_loader_basic.py](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/samples/demo_doc_loader_basic.py) et [demo_doc_loader_advanced.py](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/samples/demo_doc_loader_advanced.py) pour des exemples de code complets.
