---
translated: true
---

# SurrealDB

>[SurrealDB](https://surrealdb.com/) es una base de datos nativa de la nube de extremo a extremo diseñada para aplicaciones modernas, incluidas web, móvil, sin servidor, Jamstack, backend y aplicaciones tradicionales. Con SurrealDB, puede simplificar su infraestructura de base de datos y API, reducir el tiempo de desarrollo y construir aplicaciones seguras y de alto rendimiento de manera rápida y rentable.

>**Las características clave de SurrealDB incluyen:**

>* **Reduce el tiempo de desarrollo:** SurrealDB simplifica su pila de base de datos y API al eliminar la necesidad de la mayoría de los componentes del lado del servidor, lo que le permite construir aplicaciones seguras y de alto rendimiento más rápido y más barato.
>* **Servicio de backend de API de colaboración en tiempo real:** SurrealDB funciona como una base de datos y un servicio de backend de API, lo que permite la colaboración en tiempo real.
>* **Soporte para múltiples lenguajes de consulta:** SurrealDB admite consultas SQL desde dispositivos cliente, GraphQL, transacciones ACID, conexiones WebSocket, datos estructurados y no estructurados, consultas de gráficos, indexación de texto completo y consultas geoespaciales.
>* **Control de acceso granular:** SurrealDB proporciona control de acceso basado en permisos a nivel de fila, lo que le permite administrar el acceso a los datos con precisión.

>Vea las [características](https://surrealdb.com/features), los [lanzamientos](https://surrealdb.com/releases) más recientes y la [documentación](https://surrealdb.com/docs).

Este cuaderno muestra cómo usar la funcionalidad relacionada con `SurrealDBLoader`.

## Resumen

El cargador de documentos SurrealDB devuelve una lista de documentos de Langchain de una base de datos SurrealDB.

El cargador de documentos toma los siguientes parámetros opcionales:

* `dburl`: cadena de conexión al punto final del websocket. predeterminado: `ws://localhost:8000/rpc`
* `ns`: nombre del espacio de nombres. predeterminado: `langchain`
* `db`: nombre de la base de datos. predeterminado: `database`
* `table`: nombre de la tabla. predeterminado: `documents`
* `db_user`: credenciales de SurrealDB si es necesario: nombre de usuario de la base de datos.
* `db_pass`: credenciales de SurrealDB si es necesario: contraseña de la base de datos.
* `filter_criteria`: diccionario para construir la cláusula `WHERE` para filtrar los resultados de la tabla.

El `Documento` de salida tiene la siguiente forma:

```output
Document(
    page_content=<json encoded string containing the result document>,
    metadata={
        'id': <document id>,
        'ns': <namespace name>,
        'db': <database_name>,
        'table': <table name>,
        ... <additional fields from metadata property of the document>
    }
)
```

## Configuración

Descomenta las celdas a continuación para instalar surrealdb y langchain.

```python
# %pip install --upgrade --quiet  surrealdb langchain langchain-community
```

```python
# add this import for running in jupyter notebook
import nest_asyncio

nest_asyncio.apply()
```

```python
import json

from langchain_community.document_loaders.surrealdb import SurrealDBLoader
```

```python
loader = SurrealDBLoader(
    dburl="ws://localhost:8000/rpc",
    ns="langchain",
    db="database",
    table="documents",
    db_user="root",
    db_pass="root",
    filter_criteria={},
)
docs = loader.load()
len(docs)
```

```output
42
```

```python
doc = docs[-1]
doc.metadata
```

```output
{'id': 'documents:zzz434sa584xl3b4ohvk',
 'source': '../../modules/state_of_the_union.txt',
 'ns': 'langchain',
 'db': 'database',
 'table': 'documents'}
```

```python
len(doc.page_content)
```

```output
18078
```

```python
page_content = json.loads(doc.page_content)
```

```python
page_content["text"]
```

```output
'When we use taxpayer dollars to rebuild America – we are going to Buy American: buy American products to support American jobs. \n\nThe federal government spends about $600 Billion a year to keep the country safe and secure. \n\nThere’s been a law on the books for almost a century \nto make sure taxpayers’ dollars support American jobs and businesses. \n\nEvery Administration says they’ll do it, but we are actually doing it. \n\nWe will buy American to make sure everything from the deck of an aircraft carrier to the steel on highway guardrails are made in America. \n\nBut to compete for the best jobs of the future, we also need to level the playing field with China and other competitors. \n\nThat’s why it is so important to pass the Bipartisan Innovation Act sitting in Congress that will make record investments in emerging technologies and American manufacturing. \n\nLet me give you one example of why it’s so important to pass it.'
```
