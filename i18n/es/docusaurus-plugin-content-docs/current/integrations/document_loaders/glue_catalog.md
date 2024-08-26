---
translated: true
---

# Catálogo de Pegamento

El [Catálogo de datos de AWS Glue](https://docs.aws.amazon.com/en_en/glue/latest/dg/catalog-and-crawler.html) es un repositorio de metadatos centralizado que le permite administrar, acceder y compartir metadatos sobre sus datos almacenados en AWS. Actúa como un almacén de metadatos para sus activos de datos, lo que permite que varios servicios de AWS y sus aplicaciones consulten y se conecten a los datos que necesitan de manera eficiente.

Cuando define orígenes de datos, transformaciones y destinos en AWS Glue, los metadatos sobre estos elementos se almacenan en el Catálogo de datos. Esto incluye información sobre ubicaciones de datos, definiciones de esquemas, métricas de tiempo de ejecución y más. Admite varios tipos de almacenes de datos, como Amazon S3, Amazon RDS, Amazon Redshift y bases de datos externas compatibles con JDBC. También está integrado directamente con Amazon Athena, Amazon Redshift Spectrum y Amazon EMR, lo que permite que estos servicios accedan y consulten directamente los datos.

El Langchain GlueCatalogLoader obtendrá el esquema de todas las tablas dentro de la base de datos de Glue dada en el mismo formato que el tipo de datos de Pandas.

## Configuración

- Siga [instrucciones para configurar una cuenta de AWS](https://docs.aws.amazon.com/athena/latest/ug/setting-up.html).
- Instale la biblioteca boto3: `pip install boto3`

## Ejemplo

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

## Ejemplo con filtrado de tablas

El filtrado de tablas le permite recuperar selectivamente información de esquema para un subconjunto específico de tablas dentro de una base de datos de Glue. En lugar de cargar los esquemas de todas las tablas, puede usar el argumento `table_filter` para especificar exactamente qué tablas le interesan.

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
