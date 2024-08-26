---
translated: true
---

# Catalogue Glue

Le [Catalogue de données AWS Glue](https://docs.aws.amazon.com/en_en/glue/latest/dg/catalog-and-crawler.html) est un référentiel centralisé de métadonnées qui vous permet de gérer, d'accéder et de partager les métadonnées de vos données stockées sur AWS. Il agit comme un magasin de métadonnées pour vos actifs de données, permettant à divers services AWS et à vos applications de requêter et de se connecter efficacement aux données dont ils ont besoin.

Lorsque vous définissez des sources de données, des transformations et des cibles dans AWS Glue, les métadonnées de ces éléments sont stockées dans le Catalogue de données. Cela inclut des informations sur les emplacements des données, les définitions de schéma, les métriques d'exécution et plus encore. Il prend en charge différents types de magasins de données, tels qu'Amazon S3, Amazon RDS, Amazon Redshift et les bases de données externes compatibles avec JDBC. Il est également directement intégré à Amazon Athena, Amazon Redshift Spectrum et Amazon EMR, permettant à ces services d'accéder directement et de requêter les données.

Le Langchain GlueCatalogLoader récupérera le schéma de toutes les tables dans la base de données Glue donnée dans le même format que le type de données Pandas.

## Configuration

- Suivez les [instructions pour configurer un compte AWS](https://docs.aws.amazon.com/athena/latest/ug/setting-up.html).
- Installez la bibliothèque boto3 : `pip install boto3`

## Exemple

```python
from langchain_community.document_loaders.glue_catalog import GlueCatalogLoader
```

```python
database_name = "my_database"
profile_name = "my_profile"

loader = GlueCatalogLoader(
    database=database_name,
    profile_name=profile_name,
)

schemas = loader.load()
print(schemas)
```

## Exemple avec filtrage de table

Le filtrage de table vous permet de récupérer de manière sélective les informations de schéma pour un sous-ensemble spécifique de tables au sein d'une base de données Glue. Au lieu de charger les schémas de toutes les tables, vous pouvez utiliser l'argument `table_filter` pour spécifier exactement quelles tables vous intéressent.

```python
from langchain_community.document_loaders.glue_catalog import GlueCatalogLoader
```

```python
database_name = "my_database"
profile_name = "my_profile"
table_filter = ["table1", "table2", "table3"]

loader = GlueCatalogLoader(
    database=database_name, profile_name=profile_name, table_filter=table_filter
)

schemas = loader.load()
print(schemas)
```
