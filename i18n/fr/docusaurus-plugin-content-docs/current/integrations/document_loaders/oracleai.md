---
translated: true
---

# Recherche vectorielle IA d'Oracle : Traitement de documents

La recherche vectorielle IA d'Oracle est conçue pour les charges de travail d'Intelligence Artificielle (IA) qui vous permettent d'interroger les données en fonction de la sémantique, plutôt que des mots-clés. L'un des plus grands avantages de la recherche vectorielle IA d'Oracle est que la recherche sémantique sur les données non structurées peut être combinée avec la recherche relationnelle sur les données d'entreprise dans un seul et même système. Cela n'est pas seulement puissant, mais aussi beaucoup plus efficace car vous n'avez pas besoin d'ajouter une base de données vectorielle spécialisée, éliminant ainsi les problèmes de fragmentation des données entre plusieurs systèmes.

Le guide montre comment utiliser les capacités de traitement de documents dans la recherche vectorielle IA d'Oracle pour charger et découper des documents à l'aide d'OracleDocLoader et d'OracleTextSplitter respectivement.

### Prérequis

Veuillez installer le pilote client Python d'Oracle pour utiliser Langchain avec la recherche vectorielle IA d'Oracle.

```python
# pip install oracledb
```

### Se connecter à la base de données Oracle

Le code d'exemple suivant montrera comment se connecter à la base de données Oracle.

```python
import sys

import oracledb

# please update with your username, password, hostname and service_name
username = "<username>"
password = "<password>"
dsn = "<hostname>/<service_name>"

try:
    conn = oracledb.connect(user=username, password=password, dsn=dsn)
    print("Connection successful!")
except Exception as e:
    print("Connection failed!")
    sys.exit(1)
```

Maintenant, créons une table et insérons quelques documents d'exemple pour les tester.

```python
try:
    cursor = conn.cursor()

    drop_table_sql = """drop table if exists demo_tab"""
    cursor.execute(drop_table_sql)

    create_table_sql = """create table demo_tab (id number, data clob)"""
    cursor.execute(create_table_sql)

    insert_row_sql = """insert into demo_tab values (:1, :2)"""
    rows_to_insert = [
        (
            1,
            "If the answer to any preceding questions is yes, then the database stops the search and allocates space from the specified tablespace; otherwise, space is allocated from the database default shared temporary tablespace.",
        ),
        (
            2,
            "A tablespace can be online (accessible) or offline (not accessible) whenever the database is open.\nA tablespace is usually online so that its data is available to users. The SYSTEM tablespace and temporary tablespaces cannot be taken offline.",
        ),
        (
            3,
            "The database stores LOBs differently from other data types. Creating a LOB column implicitly creates a LOB segment and a LOB index. The tablespace containing the LOB segment and LOB index, which are always stored together, may be different from the tablespace containing the table.\nSometimes the database can store small amounts of LOB data in the table itself rather than in a separate LOB segment.",
        ),
    ]
    cursor.executemany(insert_row_sql, rows_to_insert)

    conn.commit()

    print("Table created and populated.")
    cursor.close()
except Exception as e:
    print("Table creation failed.")
    cursor.close()
    conn.close()
    sys.exit(1)
```

### Charger les documents

Les utilisateurs peuvent charger les documents à partir de la base de données Oracle, d'un système de fichiers ou des deux. Ils n'ont qu'à définir les paramètres du chargeur en conséquence. Veuillez vous référer au guide de la recherche vectorielle IA d'Oracle pour obtenir des informations complètes sur ces paramètres.

Le principal avantage d'utiliser OracleDocLoader est qu'il peut gérer plus de 150 formats de fichiers différents. Vous n'avez pas besoin d'utiliser différents types de chargeurs pour différents formats de fichiers. Voici la liste des formats que nous prenons en charge : [Formats de documents pris en charge par Oracle Text](https://docs.oracle.com/en/database/oracle/oracle-database/23/ccref/oracle-text-supported-document-formats.html)

Le code d'exemple suivant montrera comment procéder :

```python
from langchain_community.document_loaders.oracleai import OracleDocLoader
from langchain_core.documents import Document

"""
# loading a local file
loader_params = {}
loader_params["file"] = "<file>"

# loading from a local directory
loader_params = {}
loader_params["dir"] = "<directory>"
"""

# loading from Oracle Database table
loader_params = {
    "owner": "<owner>",
    "tablename": "demo_tab",
    "colname": "data",
}

""" load the docs """
loader = OracleDocLoader(conn=conn, params=loader_params)
docs = loader.load()

""" verify """
print(f"Number of docs loaded: {len(docs)}")
# print(f"Document-0: {docs[0].page_content}") # content
```

### Diviser les documents

Les documents peuvent avoir différentes tailles : petits, moyens, grands ou très grands. Les utilisateurs souhaitent diviser/découper leurs documents en plus petits morceaux pour générer des embeddings. Il existe de nombreuses personnalisations de fractionnement différentes que les utilisateurs peuvent effectuer. Veuillez vous référer au guide de la recherche vectorielle IA d'Oracle pour obtenir des informations complètes sur ces paramètres.

Le code d'exemple suivant montrera comment procéder :

```python
from langchain_community.document_loaders.oracleai import OracleTextSplitter
from langchain_core.documents import Document

"""
# Some examples
# split by chars, max 500 chars
splitter_params = {"split": "chars", "max": 500, "normalize": "all"}

# split by words, max 100 words
splitter_params = {"split": "words", "max": 100, "normalize": "all"}

# split by sentence, max 20 sentences
splitter_params = {"split": "sentence", "max": 20, "normalize": "all"}
"""

# split by default parameters
splitter_params = {"normalize": "all"}

# get the splitter instance
splitter = OracleTextSplitter(conn=conn, params=splitter_params)

list_chunks = []
for doc in docs:
    chunks = splitter.split_text(doc.page_content)
    list_chunks.extend(chunks)

""" verify """
print(f"Number of Chunks: {len(list_chunks)}")
# print(f"Chunk-0: {list_chunks[0]}") # content
```

### Démonstration de bout en bout

Veuillez vous référer à notre guide de démonstration complet [Guide de démonstration de bout en bout de la recherche vectorielle IA d'Oracle](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.md) pour construire un pipeline RAG de bout en bout avec l'aide de la recherche vectorielle IA d'Oracle.
