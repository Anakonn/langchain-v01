---
translated: true
---

# Base de datos autónoma de Oracle

La base de datos autónoma de Oracle es una base de datos en la nube que utiliza aprendizaje automático para automatizar la sintonización, la seguridad, las copias de seguridad, las actualizaciones y otras tareas de gestión de rutina que tradicionalmente realizaban los DBA.

Este cuaderno cubre cómo cargar documentos desde la base de datos autónoma de Oracle, el cargador admite la conexión con la cadena de conexión o la configuración de TNS.

## Requisitos previos

1. La base de datos se ejecuta en modo 'Thin':
   https://python-oracledb.readthedocs.io/en/latest/user_guide/appendix_b.html
2. `pip install oracledb`:
   https://python-oracledb.readthedocs.io/en/latest/user_guide/installation.html

## Instrucciones

```python
pip install oracledb
```

```python
from langchain_community.document_loaders import OracleAutonomousDatabaseLoader
from settings import s
```

Con autenticación TLS mutua (mTLS), se requieren wallet_location y wallet_password para crear la conexión, el usuario puede crear la conexión proporcionando la cadena de conexión o los detalles de configuración de TNS.

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

Con autenticación TLS, no se requieren wallet_location y wallet_password.

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
