---
translated: true
---

# Redis

>[Introducción a la base de datos vectorial Redis](https://redis.io/docs/get-started/vector-database/) y guía de integración con langchain.

## ¿Qué es Redis?

La mayoría de los desarrolladores con experiencia en servicios web están familiarizados con `Redis`. En su núcleo, `Redis` es un almacén de clave-valor de código abierto que se utiliza como caché, intermediario de mensajes y base de datos. Los desarrolladores eligen `Redis` porque es rápido, tiene un gran ecosistema de bibliotecas cliente y ha sido implementado por grandes empresas durante años.

Además de estos casos de uso tradicionales, `Redis` ofrece capacidades adicionales como la capacidad de Búsqueda y Consulta que permite a los usuarios crear estructuras de índice secundarias dentro de `Redis`. Esto permite que `Redis` sea una Base de Datos Vectorial, a la velocidad de una caché.

## Redis como una Base de Datos Vectorial

`Redis` usa índices invertidos comprimidos para indexación rápida con una huella de memoria baja. También soporta una serie de características avanzadas como:

* Indexación de múltiples campos en hashes de Redis y `JSON`
* Búsqueda de similitud vectorial (con `HNSW` (ANN) o `FLAT` (KNN))
* Búsqueda de Rango Vectorial (por ejemplo, encontrar todos los vectores dentro de un radio de un vector de consulta)
* Indexación incremental sin pérdida de rendimiento
* Clasificación de documentos (usando [tf-idf](https://en.wikipedia.org/wiki/Tf%E2%80%93idf), con pesos proporcionados opcionalmente por el usuario)
* Ponderación de campos
* Consultas booleanas complejas con operadores `AND`, `OR` y `NOT`
* Coincidencia de prefijos, coincidencia difusa y consultas de frase exacta
* Soporte para [coincidencia fonética de doble metáfono](https://redis.io/docs/stack/search/reference/phonetic_matching/)
* Sugerencias de autocompletado (con sugerencias de prefijos difusos)
* Expansión de consultas basada en stemming en [muchos idiomas](https://redis.io/docs/stack/search/reference/stemming/) (usando [Snowball](http://snowballstem.org/)))
* Soporte para tokenización y consultas en idioma chino (usando [Friso](https://github.com/lionsoul2014/friso)))
* Filtros y rangos numéricos
* Búsquedas geoespaciales usando indexación geoespacial de Redis
* Un motor de agregaciones poderoso
* Soporte para todo texto codificado en `utf-8`
* Recuperar documentos completos, campos seleccionados o solo los IDs de documentos
* Ordenar resultados (por ejemplo, por fecha de creación)

## Clientes

Dado que `Redis` es mucho más que solo una base de datos vectorial, a menudo hay casos de uso que demandan el uso de un cliente `Redis` además de la integración con `LangChain`. Puedes usar cualquier biblioteca cliente estándar de `Redis` para ejecutar comandos de Búsqueda y Consulta, pero es más fácil usar una biblioteca que envuelva la API de Búsqueda y Consulta. A continuación se presentan algunos ejemplos, pero puedes encontrar más bibliotecas cliente [aquí](https://redis.io/resources/clients/).

| Proyecto | Lenguaje | Licencia | Autor | Estrellas |
|----------|---------|--------|---------|-------|
| [jedis][jedis-url] | Java | MIT | [Redis][redis-url] | ![Stars][jedis-stars] |
| [redisvl][redisvl-url] | Python | MIT | [Redis][redis-url] | ![Stars][redisvl-stars] |
| [redis-py][redis-py-url] | Python | MIT | [Redis][redis-url] | ![Stars][redis-py-stars] |
| [node-redis][node-redis-url] | Node.js | MIT | [Redis][redis-url] | ![Stars][node-redis-stars] |
| [nredisstack][nredisstack-url] | .NET | MIT | [Redis][redis-url] | ![Stars][nredisstack-stars] |

[redis-url]: https://redis.com

[redisvl-url]: https://github.com/RedisVentures/redisvl
[redisvl-stars]: https://img.shields.io/github/stars/RedisVentures/redisvl.svg?style=social&amp;label=Star&amp;maxAge=2592000
[redisvl-package]: https://pypi.python.org/pypi/redisvl

[redis-py-url]: https://github.com/redis/redis-py
[redis-py-stars]: https://img.shields.io/github/stars/redis/redis-py.svg?style=social&amp;label=Star&amp;maxAge=2592000
[redis-py-package]: https://pypi.python.org/pypi/redis

[jedis-url]: https://github.com/redis/jedis
[jedis-stars]: https://img.shields.io/github/stars/redis/jedis.svg?style=social&amp;label=Star&amp;maxAge=2592000
[Jedis-package]: https://search.maven.org/artifact/redis.clients/jedis

[nredisstack-url]: https://github.com/redis/nredisstack
[nredisstack-stars]: https://img.shields.io/github/stars/redis/nredisstack.svg?style=social&amp;label=Star&amp;maxAge=2592000
[nredisstack-package]: https://www.nuget.org/packages/nredisstack/

[node-redis-url]: https://github.com/redis/node-redis
[node-redis-stars]: https://img.shields.io/github/stars/redis/node-redis.svg?style=social&amp;label=Star&amp;maxAge=2592000
[node-redis-package]: https://www.npmjs.com/package/redis

[redis-om-python-url]: https://github.com/redis/redis-om-python
[redis-om-python-author]: https://redis.com
[redis-om-python-stars]: https://img.shields.io/github/stars/redis/redis-om-python.svg?style=social&amp;label=Star&amp;maxAge=2592000

[redisearch-go-url]: https://github.com/RediSearch/redisearch-go
[redisearch-go-author]: https://redis.com
[redisearch-go-stars]: https://img.shields.io/github/stars/RediSearch/redisearch-go.svg?style=social&amp;label=Star&amp;maxAge=2592000

[redisearch-api-rs-url]: https://github.com/RediSearch/redisearch-api-rs
[redisearch-api-rs-author]: https://redis.com
[redisearch-api-rs-stars]: https://img.shields.io/github/stars/RediSearch/redisearch-api-rs.svg?style=social&amp;label=Star&amp;maxAge=2592000

## Opciones de implementación

Hay muchas maneras de desplegar Redis con RediSearch. La forma más fácil de comenzar es usar Docker, pero hay muchas opciones potenciales de implementación como

- [Redis Cloud](https://redis.com/redis-enterprise-cloud/overview/)
- [Docker (Redis Stack)](https://hub.docker.com/r/redis/redis-stack)
- Marketplaces en la nube: [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-e6y7ork67pjwg?sr=0-2&ref_=beagle&applicationId=AWSMPContessa), [Google Marketplace](https://console.cloud.google.com/marketplace/details/redislabs-public/redis-enterprise?pli=1) o [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/garantiadata.redis_enterprise_1sp_public_preview?tab=Overview)
- On-premise: [Redis Enterprise Software](https://redis.com/redis-enterprise-software/overview/)
- Kubernetes: [Redis Enterprise Software en Kubernetes](https://docs.redis.com/latest/kubernetes/)

## Ejemplos adicionales

Se pueden encontrar muchos ejemplos en el [GitHub del equipo de Redis AI](https://github.com/RedisVentures/)

- [Recursos Awesome Redis AI](https://github.com/RedisVentures/redis-ai-resources) - Lista de ejemplos de uso de Redis en cargas de trabajo de IA
- [Embeddings Q&A de Azure OpenAI](https://github.com/ruoccofabrizio/azure-open-ai-embeddings-qna) - OpenAI y Redis como un servicio de preguntas y respuestas en Azure.
- [Búsqueda de Papers en ArXiv](https://github.com/RedisVentures/redis-arXiv-search) - Búsqueda semántica sobre papers académicos de ArXiv
- [Búsqueda Vectorial en Azure](https://learn.microsoft.com/azure/azure-cache-for-redis/cache-tutorial-vector-similarity) - Búsqueda vectorial en Azure usando Azure Cache para Redis y Azure OpenAI

## Más recursos

Para más información sobre cómo usar Redis como una base de datos vectorial, consulta los siguientes recursos:

- [Documentación de RedisVL](https://redisvl.com) - Documentación para el cliente de la Biblioteca Vectorial Redis
- [Documentos de Similaridad Vectorial de Redis](https://redis.io/docs/stack/search/reference/vectors/) - Documentos oficiales de Redis para Búsqueda Vectorial.
- [Documentos de Búsqueda de redis-py](https://redis.readthedocs.io/en/latest/redismodules.html#redisearch-commands) - Documentación para la biblioteca cliente redis-py
- [Búsqueda de Similitud Vectorial: De lo Básico a la Producción](https://mlops.community/vector-similarity-search-from-basics-to-production/) - Post introductorio a VSS y Redis como VectorDB.

## Configuración

### Instalar el cliente Python de Redis

`Redis-py` es el cliente oficialmente soportado por Redis. Recientemente se lanzó el cliente `RedisVL` que está diseñado específicamente para los casos de uso de la Base de Datos Vectorial. Ambos se pueden instalar con pip.

```python
%pip install --upgrade --quiet  redis redisvl langchain-openai tiktoken
```

Queremos usar `OpenAIEmbeddings` así que tenemos que obtener la clave API de OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

### Desplegar Redis localmente

Para desplegar Redis localmente, ejecuta:

```console
docker run -d -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

Si todo está funcionando correctamente, deberías ver una bonita interfaz de Redis en `http://localhost:8001`. Consulta la sección [Opciones de implementación](#deployment-options) anteriormente para otras formas de desplegar.

### Esquemas de URL de conexión de Redis

Los esquemas de URL de Redis válidos son:
1. `redis://`  - Conexión a Redis autónomo, no cifrado
2. `rediss://` - Conexión a Redis autónomo, con cifrado TLS
3. `redis+sentinel://`  - Conexión al servidor Redis a través de Redis Sentinel, no cifrado
4. `rediss+sentinel://` - Conexión al servidor Redis a través de Redis Sentinel, ambas conexiones con cifrado TLS

Más información sobre parámetros adicionales de conexión se puede encontrar en la [documentación de redis-py](https://redis-py.readthedocs.io/en/stable/connections.html).

```python
# connection to redis standalone at localhost, db 0, no password
redis_url = "redis://localhost:6379"
# connection to host "redis" port 7379 with db 2 and password "secret" (old style authentication scheme without username / pre 6.x)
redis_url = "redis://:secret@redis:7379/2"
# connection to host redis on default port with user "joe", pass "secret" using redis version 6+ ACLs
redis_url = "redis://joe:secret@redis/0"

# connection to sentinel at localhost with default group mymaster and db 0, no password
redis_url = "redis+sentinel://localhost:26379"
# connection to sentinel at host redis with default port 26379 and user "joe" with password "secret" with default group mymaster and db 0
redis_url = "redis+sentinel://joe:secret@redis"
# connection to sentinel, no auth with sentinel monitoring group "zone-1" and database 2
redis_url = "redis+sentinel://redis:26379/zone-1/2"

# connection to redis standalone at localhost, db 0, no password but with TLS support
redis_url = "rediss://localhost:6379"
# connection to redis sentinel at localhost and default port, db 0, no password
# but with TLS support for booth Sentinel and Redis server
redis_url = "rediss+sentinel://localhost"
```

### Datos de muestra

Primero describiremos algunos datos de muestra para que se puedan demostrar los diversos atributos del almacén vectorial de Redis.

```python
metadata = [
    {
        "user": "john",
        "age": 18,
        "job": "engineer",
        "credit_score": "high",
    },
    {
        "user": "derrick",
        "age": 45,
        "job": "doctor",
        "credit_score": "low",
    },
    {
        "user": "nancy",
        "age": 94,
        "job": "doctor",
        "credit_score": "high",
    },
    {
        "user": "tyler",
        "age": 100,
        "job": "engineer",
        "credit_score": "high",
    },
    {
        "user": "joe",
        "age": 35,
        "job": "dentist",
        "credit_score": "medium",
    },
]
texts = ["foo", "foo", "foo", "bar", "bar"]
```

### Crear tienda de vectores Redis

La instancia de Redis VectorStore se puede inicializar de varias maneras. Hay múltiples métodos de clase que se pueden usar para inicializar una instancia de Redis VectorStore.

- ``Redis.__init__`` - Inicializar directamente
- ``Redis.from_documents`` - Inicializar desde una lista de objetos ``Langchain.docstore.Document``
- ``Redis.from_texts`` - Inicializar desde una lista de textos (opcionalmente con metadatos)
- ``Redis.from_texts_return_keys`` - Inicializar desde una lista de textos (opcionalmente con metadatos) y devolver las claves
- ``Redis.from_existing_index`` - Inicializar desde un índice de Redis existente

A continuación, utilizaremos el método ``Redis.from_texts``.

```python
from langchain_community.vectorstores.redis import Redis

rds = Redis.from_texts(
    texts,
    embeddings,
    metadatas=metadata,
    redis_url="redis://localhost:6379",
    index_name="users",
)
```

```python
rds.index_name
```

```output
'users'
```

## Inspeccionando el índice creado

Una vez que el objeto ``Redis`` VectorStore ha sido construido, se habrá creado un índice en Redis si no existía previamente. El índice se puede inspeccionar con ambas herramientas de línea de comandos, ``rvl`` y ``redis-cli``. Si instalaste ``redisvl`` arriba, puedes usar la herramienta de línea de comandos ``rvl`` para inspeccionar el índice.

```python
# assumes you're running Redis locally (use --host, --port, --password, --username, to change this)
!rvl index listall
```

```output
[32m16:58:26[0m [34m[RedisVL][0m [1;30mINFO[0m   Indices:
[32m16:58:26[0m [34m[RedisVL][0m [1;30mINFO[0m   1. users
```

La implementación de ``Redis`` VectorStore intentará generar un esquema de índice (campos para filtrar) para cualquier metadato pasado a través de los métodos ``from_texts``, ``from_texts_return_keys``, y ``from_documents``. De esta manera, cualquier metadato pasado se indexará en el índice de búsqueda de Redis permitiendo filtrar en esos campos.

A continuación, mostramos qué campos se crearon a partir de los metadatos que definimos anteriormente

```python
!rvl index info -i users
```

```output


Index Information:
╭──────────────┬────────────────┬───────────────┬─────────────────┬────────────╮
│ Index Name   │ Storage Type   │ Prefixes      │ Index Options   │   Indexing │
├──────────────┼────────────────┼───────────────┼─────────────────┼────────────┤
│ users        │ HASH           │ ['doc:users'] │ []              │          0 │
╰──────────────┴────────────────┴───────────────┴─────────────────┴────────────╯
Index Fields:
╭────────────────┬────────────────┬─────────┬────────────────┬────────────────╮
│ Name           │ Attribute      │ Type    │ Field Option   │   Option Value │
├────────────────┼────────────────┼─────────┼────────────────┼────────────────┤
│ user           │ user           │ TEXT    │ WEIGHT         │              1 │
│ job            │ job            │ TEXT    │ WEIGHT         │              1 │
│ credit_score   │ credit_score   │ TEXT    │ WEIGHT         │              1 │
│ content        │ content        │ TEXT    │ WEIGHT         │              1 │
│ age            │ age            │ NUMERIC │                │                │
│ content_vector │ content_vector │ VECTOR  │                │                │
╰────────────────┴────────────────┴─────────┴────────────────┴────────────────╯
```

```python
!rvl stats -i users
```

```output

Statistics:
╭─────────────────────────────┬─────────────╮
│ Stat Key                    │ Value       │
├─────────────────────────────┼─────────────┤
│ num_docs                    │ 5           │
│ num_terms                   │ 15          │
│ max_doc_id                  │ 5           │
│ num_records                 │ 33          │
│ percent_indexed             │ 1           │
│ hash_indexing_failures      │ 0           │
│ number_of_uses              │ 4           │
│ bytes_per_record_avg        │ 4.60606     │
│ doc_table_size_mb           │ 0.000524521 │
│ inverted_sz_mb              │ 0.000144958 │
│ key_table_size_mb           │ 0.000193596 │
│ offset_bits_per_record_avg  │ 8           │
│ offset_vectors_sz_mb        │ 2.19345e-05 │
│ offsets_per_term_avg        │ 0.69697     │
│ records_per_doc_avg         │ 6.6         │
│ sortable_values_size_mb     │ 0           │
│ total_indexing_time         │ 0.32        │
│ total_inverted_index_blocks │ 16          │
│ vector_index_sz_mb          │ 6.0126      │
╰─────────────────────────────┴─────────────╯
```

Es importante notar que no hemos especificado que los metadatos ``user``, ``job``, ``credit_score`` y ``age`` deben ser campos dentro del índice, esto se debe a que el objeto ``Redis`` VectorStore genera automáticamente el esquema de índice a partir de los metadatos pasados. Para más información sobre la generación de campos de índice, consulta la documentación de la API.

## Consultas

Hay múltiples formas de consultar la implementación de ``Redis`` VectorStore según el caso de uso que tengas:

- ``similarity_search``: Encontrar los vectores más similares a un vector dado.
- ``similarity_search_with_score``: Encontrar los vectores más similares a un vector dado y devolver la distancia del vector
- ``similarity_search_limit_score``: Encontrar los vectores más similares a un vector dado y limitar el número de resultados al ``score_threshold``
- ``similarity_search_with_relevance_scores``: Encontrar los vectores más similares a un vector dado y devolver las similitudes del vector
- ``max_marginal_relevance_search``: Encontrar los vectores más similares a un vector dado mientras también se optimiza para la diversidad

```python
results = rds.similarity_search("foo")
print(results[0].page_content)
```

```output
foo
```

```python
# return metadata
results = rds.similarity_search("foo", k=3)
meta = results[1].metadata
print("Key of the document in Redis: ", meta.pop("id"))
print("Metadata of the document: ", meta)
```

```output
Key of the document in Redis:  doc:users:a70ca43b3a4e4168bae57c78753a200f
Metadata of the document:  {'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}
```

```python
# with scores (distances)
results = rds.similarity_search_with_score("foo", k=5)
for result in results:
    print(f"Content: {result[0].page_content} --- Score: {result[1]}")
```

```output
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: bar --- Score: 0.1566
Content: bar --- Score: 0.1566
```

```python
# limit the vector distance that can be returned
results = rds.similarity_search_with_score("foo", k=5, distance_threshold=0.1)
for result in results:
    print(f"Content: {result[0].page_content} --- Score: {result[1]}")
```

```output
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
```

```python
# with scores
results = rds.similarity_search_with_relevance_scores("foo", k=5)
for result in results:
    print(f"Content: {result[0].page_content} --- Similiarity: {result[1]}")
```

```output
Content: foo --- Similiarity: 1.0
Content: foo --- Similiarity: 1.0
Content: foo --- Similiarity: 1.0
Content: bar --- Similiarity: 0.8434
Content: bar --- Similiarity: 0.8434
```

```python
# limit scores (similarities have to be over .9)
results = rds.similarity_search_with_relevance_scores("foo", k=5, score_threshold=0.9)
for result in results:
    print(f"Content: {result[0].page_content} --- Similarity: {result[1]}")
```

```output
Content: foo --- Similarity: 1.0
Content: foo --- Similarity: 1.0
Content: foo --- Similarity: 1.0
```

```python
# you can also add new documents as follows
new_document = ["baz"]
new_metadata = [{"user": "sam", "age": 50, "job": "janitor", "credit_score": "high"}]
# both the document and metadata must be lists
rds.add_texts(new_document, new_metadata)
```

```output
['doc:users:b9c71d62a0a34241a37950b448dafd38']
```

```python
# now query the new document
results = rds.similarity_search("baz", k=3)
print(results[0].metadata)
```

```output
{'id': 'doc:users:b9c71d62a0a34241a37950b448dafd38', 'user': 'sam', 'job': 'janitor', 'credit_score': 'high', 'age': '50'}
```

```python
# use maximal marginal relevance search to diversify results
results = rds.max_marginal_relevance_search("foo")
```

```python
# the lambda_mult parameter controls the diversity of the results, the lower the more diverse
results = rds.max_marginal_relevance_search("foo", lambda_mult=0.1)
```

## Conectarse a un índice existente

Para tener los mismos metadatos indexados cuando se usa el ``Redis`` VectorStore. Necesitarás tener el mismo ``index_schema`` pasado ya sea como una ruta a un archivo yaml o como un diccionario. Lo siguiente muestra cómo obtener el esquema de un índice y conectarse a un índice existente.

```python
# write the schema to a yaml file
rds.write_schema("redis_schema.yaml")
```

El archivo de esquema para este ejemplo debería verse así:

```yaml
numeric:
- name: age
  no_index: false
  sortable: false
text:
- name: user
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: job
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: credit_score
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: content
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
vector:
- algorithm: FLAT
  block_size: 1000
  datatype: FLOAT32
  dims: 1536
  distance_metric: COSINE
  initial_cap: 20000
  name: content_vector
```

**Nota**, esto incluye **todos** los campos posibles para el esquema. Puedes eliminar cualquier campo que no necesites.

```python
# now we can connect to our existing index as follows

new_rds = Redis.from_existing_index(
    embeddings,
    index_name="users",
    redis_url="redis://localhost:6379",
    schema="redis_schema.yaml",
)
results = new_rds.similarity_search("foo", k=3)
print(results[0].metadata)
```

```output
{'id': 'doc:users:8484c48a032d4c4cbe3cc2ed6845fabb', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}
```

```python
# see the schemas are the same
new_rds.schema == rds.schema
```

```output
True
```

## Indexación de metadatos personalizados

En algunos casos, puede que quieras controlar a qué campos se asignan los metadatos. Por ejemplo, puede que quieras que el campo ``credit_score`` sea un campo categórico en lugar de un campo de texto (que es el comportamiento predeterminado para todos los campos de cadena). En este caso, puedes usar el parámetro ``index_schema`` en cada uno de los métodos de inicialización anteriores para especificar el esquema para el índice. El esquema de índice personalizado se puede pasar como un diccionario o como una ruta a un archivo YAML.

Todos los argumentos en el esquema tienen valores predeterminados además del nombre, por lo que puedes especificar solo los campos que deseas cambiar. Todos los nombres corresponden a las versiones en minúsculas y con guiones bajos de los argumentos que usarías en la línea de comandos con ``redis-cli`` o en ``redis-py``. Para más información sobre los argumentos para cada campo, consulta la [documentación](https://redis.io/docs/interact/search-and-query/basic-constructs/field-and-type-options/)

El siguiente ejemplo muestra cómo especificar el esquema para el campo ``credit_score`` como un campo de etiqueta (categórico) en lugar de un campo de texto.

```yaml
# index_schema.yml
tag:
    - name: credit_score
text:
    - name: user
    - name: job
numeric:
    - name: age
```

En Python, esto se vería así:

```python

index_schema = {
    "tag": [{"name": "credit_score"}],
    "text": [{"name": "user"}, {"name": "job"}],
    "numeric": [{"name": "age"}],
}

```

Nota que solo se necesita especificar el campo ``name``. Todos los demás campos tienen valores predeterminados.

```python
# create a new index with the new schema defined above
index_schema = {
    "tag": [{"name": "credit_score"}],
    "text": [{"name": "user"}, {"name": "job"}],
    "numeric": [{"name": "age"}],
}

rds, keys = Redis.from_texts_return_keys(
    texts,
    embeddings,
    metadatas=metadata,
    redis_url="redis://localhost:6379",
    index_name="users_modified",
    index_schema=index_schema,  # pass in the new index schema
)
```

```output
`index_schema` does not match generated metadata schema.
If you meant to manually override the schema, please ignore this message.
index_schema: {'tag': [{'name': 'credit_score'}], 'text': [{'name': 'user'}, {'name': 'job'}], 'numeric': [{'name': 'age'}]}
generated_schema: {'text': [{'name': 'user'}, {'name': 'job'}, {'name': 'credit_score'}], 'numeric': [{'name': 'age'}], 'tag': []}
```

La advertencia anterior está destinada a notificar a los usuarios cuando están sobrescribiendo el comportamiento predeterminado. Ignórala si estás sobrescribiendo el comportamiento intencionalmente.

## Filtrado híbrido

Con el lenguaje de expresión de filtro de Redis incorporado en LangChain, puedes crear cadenas arbitrariamente largas de filtros híbridos que se pueden usar para filtrar tus resultados de búsqueda. El lenguaje de expresión se deriva de la [RedisVL Expression Syntax](https://redisvl.com) y está diseñado para ser fácil de usar y entender.

Los siguientes son los tipos de filtros disponibles:
- ``RedisText``: Filtrar por búsqueda de texto completo contra campos de metadatos. Soporta coincidencia exacta, difusa y comodín.
- ``RedisNum``: Filtrar por rango numérico contra campos de metadatos.
- ``RedisTag``: Filtrar por coincidencia exacta contra campos de metadatos categóricos basados en cadenas. Se pueden especificar múltiples etiquetas como "tag1,tag2,tag3".

Los siguientes son ejemplos de utilización de estos filtros.

```python

from langchain_community.vectorstores.redis import RedisText, RedisNum, RedisTag

# exact matching
has_high_credit = RedisTag("credit_score") == "high"
does_not_have_high_credit = RedisTag("credit_score") != "low"

# fuzzy matching
job_starts_with_eng = RedisText("job") % "eng*"
job_is_engineer = RedisText("job") == "engineer"
job_is_not_engineer = RedisText("job") != "engineer"

# numeric filtering
age_is_18 = RedisNum("age") == 18
age_is_not_18 = RedisNum("age") != 18
age_is_greater_than_18 = RedisNum("age") > 18
age_is_less_than_18 = RedisNum("age") < 18
age_is_greater_than_or_equal_to_18 = RedisNum("age") >= 18
age_is_less_than_or_equal_to_18 = RedisNum("age") <= 18

```

La clase ``RedisFilter`` se puede usar para simplificar la importación de estos filtros de la siguiente manera

```python

from langchain_community.vectorstores.redis import RedisFilter

# same examples as above
has_high_credit = RedisFilter.tag("credit_score") == "high"
does_not_have_high_credit = RedisFilter.num("age") > 8
job_starts_with_eng = RedisFilter.text("job") % "eng*"
```

Los siguientes son ejemplos de uso de un filtro híbrido para la búsqueda

```python
from langchain_community.vectorstores.redis import RedisText

is_engineer = RedisText("job") == "engineer"
results = rds.similarity_search("foo", k=3, filter=is_engineer)

print("Job:", results[0].metadata["job"])
print("Engineers in the dataset:", len(results))
```

```output
Job: engineer
Engineers in the dataset: 2
```

```python
# fuzzy match
starts_with_doc = RedisText("job") % "doc*"
results = rds.similarity_search("foo", k=3, filter=starts_with_doc)

for result in results:
    print("Job:", result.metadata["job"])
print("Jobs in dataset that start with 'doc':", len(results))
```

```output
Job: doctor
Job: doctor
Jobs in dataset that start with 'doc': 2
```

```python
from langchain_community.vectorstores.redis import RedisNum

is_over_18 = RedisNum("age") > 18
is_under_99 = RedisNum("age") < 99
age_range = is_over_18 & is_under_99
results = rds.similarity_search("foo", filter=age_range)

for result in results:
    print("User:", result.metadata["user"], "is", result.metadata["age"])
```

```output
User: derrick is 45
User: nancy is 94
User: joe is 35
```

```python
# make sure to use parenthesis around FilterExpressions
# if initializing them while constructing them
age_range = (RedisNum("age") > 18) & (RedisNum("age") < 99)
results = rds.similarity_search("foo", filter=age_range)

for result in results:
    print("User:", result.metadata["user"], "is", result.metadata["age"])
```

```output
User: derrick is 45
User: nancy is 94
User: joe is 35
```

## Redis como Recuperador

Aquí repasamos diferentes opciones para usar la tienda de vectores como un recuperador.

Hay tres métodos de búsqueda diferentes que podemos usar para realizar la recuperación. Por defecto, usará la similitud semántica.

```python
query = "foo"
results = rds.similarity_search_with_score(query, k=3, return_metadata=True)

for result in results:
    print("Content:", result[0].page_content, " --- Score: ", result[1])
```

```output
Content: foo  --- Score:  0.0
Content: foo  --- Score:  0.0
Content: foo  --- Score:  0.0
```

```python
retriever = rds.as_retriever(search_type="similarity", search_kwargs={"k": 4})
```

```python
docs = retriever.invoke(query)
docs
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'}),
 Document(page_content='bar', metadata={'id': 'doc:users_modified:01ef6caac12b42c28ad870aefe574253', 'user': 'tyler', 'job': 'engineer', 'credit_score': 'high', 'age': '100'})]
```

También existe el recuperador `similarity_distance_threshold` que permite al usuario especificar la distancia del vector

```python
retriever = rds.as_retriever(
    search_type="similarity_distance_threshold",
    search_kwargs={"k": 4, "distance_threshold": 0.1},
)
```

```python
docs = retriever.invoke(query)
docs
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'})]
```

Por último, el ``similarity_score_threshold`` permite al usuario definir la puntuación mínima para documentos similares

```python
retriever = rds.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.9, "k": 10},
)
```

```python
retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'})]
```

```python
retriever = rds.as_retriever(
    search_type="mmr", search_kwargs={"fetch_k": 20, "k": 4, "lambda_mult": 0.1}
)
```

```python
retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users:8f6b673b390647809d510112cde01a27', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='bar', metadata={'id': 'doc:users:93521560735d42328b48c9c6f6418d6a', 'user': 'tyler', 'job': 'engineer', 'credit_score': 'high', 'age': '100'}),
 Document(page_content='foo', metadata={'id': 'doc:users:125ecd39d07845eabf1a699d44134a5b', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'}),
 Document(page_content='foo', metadata={'id': 'doc:users:d6200ab3764c466082fde3eaab972a2a', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'})]
```

## Eliminar claves e índices

Para eliminar tus entradas tienes que dirigirte a ellas por sus claves.

```python
Redis.delete(keys, redis_url="redis://localhost:6379")
```

```output
True
```

```python
# delete the indices too
Redis.drop_index(
    index_name="users", delete_documents=True, redis_url="redis://localhost:6379"
)
Redis.drop_index(
    index_name="users_modified",
    delete_documents=True,
    redis_url="redis://localhost:6379",
)
```

```output
True
```
