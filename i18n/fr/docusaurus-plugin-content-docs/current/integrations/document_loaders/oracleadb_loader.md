---
translated: true
---

# Oracle Autonomous Database

Oracle base de données autonome est une base de données cloud qui utilise l'apprentissage automatique pour automatiser le réglage de la base de données, la sécurité, les sauvegardes, les mises à jour et d'autres tâches de gestion de routine traditionnellement effectuées par les DBA.

Ce notebook couvre comment charger des documents à partir de la base de données autonome d'Oracle, le chargeur prend en charge la connexion avec une chaîne de connexion ou une configuration TNS.

## Prérequis

1. La base de données fonctionne en mode 'Thin' :
   https://python-oracledb.readthedocs.io/en/latest/user_guide/appendix_b.html
2. `pip install oracledb` :
   https://python-oracledb.readthedocs.io/en/latest/user_guide/installation.html

## Instructions

```python
pip install oracledb
```

```python
from langchain_community.document_loaders import OracleAutonomousDatabaseLoader
from settings import s
```

Avec l'authentification TLS mutuelle (mTLS), wallet_location et wallet_password sont requis pour créer la connexion, l'utilisateur peut créer une connexion en fournissant soit la chaîne de connexion, soit les détails de configuration TNS.

```python
SQL_QUERY = "select prod_id, time_id from sh.costs fetch first 5 rows only"

doc_loader_1 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    config_dir=s.CONFIG_DIR,
    wallet_location=s.WALLET_LOCATION,
    wallet_password=s.PASSWORD,
    tns_name=s.TNS_NAME,
)
doc_1 = doc_loader_1.load()

doc_loader_2 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    connection_string=s.CONNECTION_STRING,
    wallet_location=s.WALLET_LOCATION,
    wallet_password=s.PASSWORD,
)
doc_2 = doc_loader_2.load()
```

Avec l'authentification TLS, wallet_location et wallet_password ne sont pas requis.

```python
doc_loader_3 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    config_dir=s.CONFIG_DIR,
    tns_name=s.TNS_NAME,
)
doc_3 = doc_loader_3.load()

doc_loader_4 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    connection_string=s.CONNECTION_STRING,
)
doc_4 = doc_loader_4.load()
```
