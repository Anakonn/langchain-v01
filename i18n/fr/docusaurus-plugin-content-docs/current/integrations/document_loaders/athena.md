---
translated: true
---

# Athena

>[Amazon Athena](https://aws.amazon.com/athena/) est un service d'analyse interactif sans serveur, construit
>sur des frameworks open-source, prenant en charge les formats de table et de fichiers ouverts. `Athena` fournit un moyen simplifié et flexible d'analyser des pétaoctets de données là où elles se trouvent. Analysez des données ou construisez des applications
>à partir d'un lac de données Amazon Simple Storage Service (S3) et de 30 sources de données, y compris des sources de données sur site
>ou d'autres systèmes cloud en utilisant SQL ou Python. `Athena` est construit sur les moteurs open-source `Trino`
>et `Presto` et les frameworks `Apache Spark`, sans effort de provisionnement ou de configuration.

Ce notebook explique comment charger des documents à partir d'`AWS Athena`.

## Configuration

Suivez [les instructions pour configurer un compte AWS](https://docs.aws.amazon.com/athena/latest/ug/setting-up.html).

Installez une bibliothèque Python :

```python
! pip install boto3
```

## Exemple

```python
from langchain_community.document_loaders.athena import AthenaLoader
```

```python
database_name = "my_database"
s3_output_path = "s3://my_bucket/query_results/"
query = "SELECT * FROM my_table"
profile_name = "my_profile"

loader = AthenaLoader(
    query=query,
    database=database_name,
    s3_output_uri=s3_output_path,
    profile_name=profile_name,
)

documents = loader.load()
print(documents)
```

Exemple avec des colonnes de métadonnées

```python
database_name = "my_database"
s3_output_path = "s3://my_bucket/query_results/"
query = "SELECT * FROM my_table"
profile_name = "my_profile"
metadata_columns = ["_row", "_created_at"]

loader = AthenaLoader(
    query=query,
    database=database_name,
    s3_output_uri=s3_output_path,
    profile_name=profile_name,
    metadata_columns=metadata_columns,
)

documents = loader.load()
print(documents)
```
