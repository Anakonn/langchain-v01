---
translated: true
---

# TiDB

> [TiDB Cloud](https://tidbcloud.com/) est une solution complète de base de données en tant que service (DBaaS) qui propose des options dédiées et sans serveur. TiDB Serverless intègre désormais une recherche vectorielle intégrée dans le paysage MySQL. Avec cette amélioration, vous pouvez développer des applications IA en utilisant TiDB Serverless sans avoir besoin d'une nouvelle base de données ou de piles techniques supplémentaires. Soyez parmi les premiers à en faire l'expérience en rejoignant la liste d'attente pour la version bêta privée sur https://tidb.cloud/ai.

Ce notebook présente comment utiliser `TiDBLoader` pour charger des données depuis TiDB dans langchain.

## Prérequis

Avant d'utiliser `TiDBLoader`, nous allons installer les dépendances suivantes :

```python
%pip install --upgrade --quiet langchain
```

Ensuite, nous configurerons la connexion à un TiDB. Dans ce notebook, nous suivrons la méthode de connexion standard fournie par TiDB Cloud pour établir une connexion de base de données sécurisée et efficace.

```python
import getpass

# copy from tidb cloud console，replace it with your own
tidb_connection_string_template = "mysql+pymysql://<USER>:<PASSWORD>@<HOST>:4000/<DB>?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"
tidb_password = getpass.getpass("Input your TiDB password:")
tidb_connection_string = tidb_connection_string_template.replace(
    "<PASSWORD>", tidb_password
)
```

## Charger des données depuis TiDB

Voici une ventilation de quelques arguments clés que vous pouvez utiliser pour personnaliser le comportement de `TiDBLoader` :

- `query` (str) : Il s'agit de la requête SQL à exécuter sur la base de données TiDB. La requête doit sélectionner les données que vous voulez charger dans vos objets `Document`.
    Par exemple, vous pourriez utiliser une requête comme `"SELECT * FROM my_table"` pour récupérer toutes les données de `my_table`.

- `page_content_columns` (Optional[List[str]]) : Spécifie la liste des noms de colonnes dont les valeurs doivent être incluses dans le `page_content` de chaque objet `Document`.
    S'il est défini sur `None` (par défaut), toutes les colonnes renvoyées par la requête sont incluses dans `page_content`. Cela vous permet d'adapter le contenu de chaque document en fonction de colonnes spécifiques de vos données.

- `metadata_columns` (Optional[List[str]]) : Spécifie la liste des noms de colonnes dont les valeurs doivent être incluses dans les `metadata` de chaque objet `Document`.
    Par défaut, cette liste est vide, ce qui signifie qu'aucune métadonnée ne sera incluse, sauf si elle est explicitement spécifiée. Cela est utile pour inclure des informations supplémentaires sur chaque document qui ne font pas partie du contenu principal mais qui restent précieuses pour le traitement ou l'analyse.

```python
from sqlalchemy import Column, Integer, MetaData, String, Table, create_engine

# Connect to the database
engine = create_engine(tidb_connection_string)
metadata = MetaData()
table_name = "test_tidb_loader"

# Create a table
test_table = Table(
    table_name,
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(255)),
    Column("description", String(255)),
)
metadata.create_all(engine)


with engine.connect() as connection:
    transaction = connection.begin()
    try:
        connection.execute(
            test_table.insert(),
            [
                {"name": "Item 1", "description": "Description of Item 1"},
                {"name": "Item 2", "description": "Description of Item 2"},
                {"name": "Item 3", "description": "Description of Item 3"},
            ],
        )
        transaction.commit()
    except:
        transaction.rollback()
        raise
```

```python
from langchain_community.document_loaders import TiDBLoader

# Setup TiDBLoader to retrieve data
loader = TiDBLoader(
    connection_string=tidb_connection_string,
    query=f"SELECT * FROM {table_name};",
    page_content_columns=["name", "description"],
    metadata_columns=["id"],
)

# Load data
documents = loader.load()

# Display the loaded documents
for doc in documents:
    print("-" * 30)
    print(f"content: {doc.page_content}\nmetada: {doc.metadata}")
```

```output
------------------------------
content: name: Item 1
description: Description of Item 1
metada: {'id': 1}
------------------------------
content: name: Item 2
description: Description of Item 2
metada: {'id': 2}
------------------------------
content: name: Item 3
description: Description of Item 3
metada: {'id': 3}
```

```python
test_table.drop(bind=engine)
```
