---
translated: true
---

# Athena

>[Amazon Athena](https://aws.amazon.com/athena/) es un servicio de análisis interactivo sin servidor construido
>sobre marcos de trabajo de código abierto, que admite formatos de tablas y archivos abiertos. `Athena` proporciona una forma simplificada y flexible de analizar petabytes de datos donde residen. Analice datos o cree aplicaciones
>desde un lago de datos de Amazon Simple Storage Service (S3) y 30 fuentes de datos, incluidas fuentes de datos locales
>o de otros sistemas en la nube utilizando SQL o Python. `Athena` se basa en los motores de código abierto `Trino`
>y `Presto` y los marcos `Apache Spark`, sin necesidad de aprovisionamiento o configuración.

Este cuaderno analiza cómo cargar documentos desde `AWS Athena`.

## Configuración

Siga [las instrucciones para configurar una cuenta de AWS](https://docs.aws.amazon.com/athena/latest/ug/setting-up.html).

Instalar una biblioteca de Python:

```python
! pip install boto3
```

## Ejemplo

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

Ejemplo con columnas de metadatos

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
