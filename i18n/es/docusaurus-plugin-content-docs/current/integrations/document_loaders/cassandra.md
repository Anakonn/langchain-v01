---
translated: true
---

# Cassandra

[Cassandra](https://cassandra.apache.org/) es una base de datos NoSQL, orientada a filas, altamente escalable y altamente disponible. A partir de la versión 5.0, la base de datos se envía con [capacidades de búsqueda vectorial](https://cassandra.apache.org/doc/trunk/cassandra/vector-search/overview.html).

## Resumen

El Cargador de Documentos de Cassandra devuelve una lista de Documentos de Langchain de una base de datos de Cassandra.

Debe proporcionar una consulta CQL o un nombre de tabla para recuperar los documentos.
El Cargador toma los siguientes parámetros:

* table: (Opcional) La tabla para cargar los datos.
* session: (Opcional) La sesión del controlador de Cassandra. Si no se proporciona, se utilizará la sesión resuelta de cassio.
* keyspace: (Opcional) El espacio de claves de la tabla. Si no se proporciona, se utilizará el espacio de claves resuelto de cassio.
* query: (Opcional) La consulta utilizada para cargar los datos.
* page_content_mapper: (Opcional) una función para convertir una fila en contenido de página de cadena. El valor predeterminado convierte la fila en JSON.
* metadata_mapper: (Opcional) una función para convertir una fila en un diccionario de metadatos.
* query_parameters: (Opcional) Los parámetros de consulta utilizados al llamar a session.execute.
* query_timeout: (Opcional) El tiempo de espera de la consulta utilizado al llamar a session.execute.
* query_custom_payload: (Opcional) El custom_payload de consulta utilizado al llamar a `session.execute`.
* query_execution_profile: (Opcional) El perfil de ejecución de consulta utilizado al llamar a `session.execute`.
* query_host: (Opcional) El host de consulta utilizado al llamar a `session.execute`.
* query_execute_as: (Opcional) El execute_as de consulta utilizado al llamar a `session.execute`.

## Cargar documentos con el Cargador de Documentos

```python
from langchain_community.document_loaders import CassandraLoader
```

### Inicializar desde una sesión del controlador de Cassandra

Debe crear un objeto `cassandra.cluster.Session`, como se describe en la [documentación del controlador de Cassandra](https://docs.datastax.com/en/developer/python-driver/latest/api/cassandra/cluster/#module-cassandra.cluster). Los detalles varían (por ejemplo, con la configuración de red y la autenticación), pero esto podría ser algo así:

```python
from cassandra.cluster import Cluster

cluster = Cluster()
session = cluster.connect()
```

Debe proporcionar el nombre de un espacio de claves existente de la instancia de Cassandra:

```python
CASSANDRA_KEYSPACE = input("CASSANDRA_KEYSPACE = ")
```

Creando el cargador de documentos:

```python
loader = CassandraLoader(
    table="movie_reviews",
    session=session,
    keyspace=CASSANDRA_KEYSPACE,
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

```output
Document(page_content='Row(_id=\'659bdffa16cbc4586b11a423\', title=\'Dangerous Men\', reviewtext=\'"Dangerous Men,"  the picture\\\'s production notes inform, took 26 years to reach the big screen. After having seen it, I wonder: What was the rush?\')', metadata={'table': 'movie_reviews', 'keyspace': 'default_keyspace'})
```

### Inicializar desde cassio

También es posible usar cassio para configurar la sesión y el espacio de claves.

```python
import cassio

cassio.init(contact_points="127.0.0.1", keyspace=CASSANDRA_KEYSPACE)

loader = CassandraLoader(
    table="movie_reviews",
)

docs = loader.load()
```

#### Declaración de atribución

> Apache Cassandra, Cassandra y Apache son marcas comerciales registradas o marcas comerciales de la [Apache Software Foundation](http://www.apache.org/) en los Estados Unidos y/o en otros países.
