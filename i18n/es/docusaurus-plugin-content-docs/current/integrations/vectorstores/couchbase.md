---
translated: true
---

# Couchbase

[Couchbase](http://couchbase.com/) es una base de datos NoSQL distribuida galardonada que ofrece una versatilidad, rendimiento, escalabilidad y valor financiero inigualables para todas sus aplicaciones de computación en la nube, móviles, de IA y de borde. Couchbase abraza la IA con asistencia de codificación para desarrolladores y búsqueda vectorial para sus aplicaciones.

La búsqueda vectorial es parte del [Servicio de búsqueda de texto completo](https://docs.couchbase.com/server/current/learn/services-and-indexes/services/search-service.html) (Servicio de búsqueda) en Couchbase.

Este tutorial explica cómo usar la búsqueda vectorial en Couchbase. Puede trabajar tanto con [Couchbase Capella](https://www.couchbase.com/products/capella/) como con su propio Couchbase Server.

## Instalación

```python
%pip install --upgrade --quiet langchain langchain-openai couchbase
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## Importar el Vector Store y los Embeddings

```python
from langchain_community.vectorstores import CouchbaseVectorStore
from langchain_openai import OpenAIEmbeddings
```

## Crear objeto de conexión a Couchbase

Creamos una conexión al clúster de Couchbase inicialmente y luego pasamos el objeto del clúster al Vector Store.

Aquí, nos estamos conectando usando el nombre de usuario y la contraseña. También puede conectarse de cualquier otra manera compatible a su clúster.

Para obtener más información sobre cómo conectarse al clúster de Couchbase, consulte la [documentación del SDK de Python](https://docs.couchbase.com/python-sdk/current/hello-world/start-using-sdk.html#connect).

```python
COUCHBASE_CONNECTION_STRING = (
    "couchbase://localhost"  # or "couchbases://localhost" if using TLS
)
DB_USERNAME = "Administrator"
DB_PASSWORD = "Password"
```

```python
from datetime import timedelta

from couchbase.auth import PasswordAuthenticator
from couchbase.cluster import Cluster
from couchbase.options import ClusterOptions

auth = PasswordAuthenticator(DB_USERNAME, DB_PASSWORD)
options = ClusterOptions(auth)
cluster = Cluster(COUCHBASE_CONNECTION_STRING, options)

# Wait until the cluster is ready for use.
cluster.wait_until_ready(timedelta(seconds=5))
```

Ahora estableceremos los nombres de bucket, ámbito y colección en el clúster de Couchbase que queremos usar para la búsqueda vectorial.

Para este ejemplo, estamos usando el ámbito y las colecciones predeterminados.

```python
BUCKET_NAME = "testing"
SCOPE_NAME = "_default"
COLLECTION_NAME = "_default"
SEARCH_INDEX_NAME = "vector-index"
```

Para este tutorial, usaremos los embeddings de OpenAI

```python
embeddings = OpenAIEmbeddings()
```

## Crear el índice de búsqueda

Actualmente, el índice de búsqueda debe crearse desde la interfaz de usuario de Couchbase Capella o Server o usando la interfaz REST.

Definamos un índice de búsqueda con el nombre `vector-index` en el bucket de prueba

Para este ejemplo, usaremos la función Importar índice en el Servicio de búsqueda en la interfaz de usuario.

Estamos definiendo un índice en el bucket `testing` del ámbito `_default` en la colección `_default` con el campo vector establecido en `embedding` con 1536 dimensiones y el campo de texto establecido en `text`. También estamos indexando y almacenando todos los campos bajo `metadata` en el documento como una asignación dinámica para tener en cuenta las diferentes estructuras de documentos. La métrica de similitud se establece en `dot_product`.

### ¿Cómo importar un índice al servicio de búsqueda de texto completo?

 - [Couchbase Server](https://docs.couchbase.com/server/current/search/import-search-index.html)
     - Haga clic en Búsqueda -> Agregar índice -> Importar
     - Copie la siguiente definición de índice en la pantalla de importación
     - Haga clic en Crear índice para crear el índice.
 - [Couchbase Capella](https://docs.couchbase.com/cloud/search/import-search-index.html)
     - Copie la definición del índice a un nuevo archivo `index.json`
     - Importe el archivo en Capella siguiendo las instrucciones de la documentación.
     - Haga clic en Crear índice para crear el índice.

### Definición del índice

```json
{
 "name": "vector-index",
 "type": "fulltext-index",
 "params": {
  "doc_config": {
   "docid_prefix_delim": "",
   "docid_regexp": "",
   "mode": "type_field",
   "type_field": "type"
  },
  "mapping": {
   "default_analyzer": "standard",
   "default_datetime_parser": "dateTimeOptional",
   "default_field": "_all",
   "default_mapping": {
    "dynamic": true,
    "enabled": true,
    "properties": {
     "metadata": {
      "dynamic": true,
      "enabled": true
     },
     "embedding": {
      "enabled": true,
      "dynamic": false,
      "fields": [
       {
        "dims": 1536,
        "index": true,
        "name": "embedding",
        "similarity": "dot_product",
        "type": "vector",
        "vector_index_optimized_for": "recall"
       }
      ]
     },
     "text": {
      "enabled": true,
      "dynamic": false,
      "fields": [
       {
        "index": true,
        "name": "text",
        "store": true,
        "type": "text"
       }
      ]
     }
    }
   },
   "default_type": "_default",
   "docvalues_dynamic": false,
   "index_dynamic": true,
   "store_dynamic": true,
   "type_field": "_type"
  },
  "store": {
   "indexType": "scorch",
   "segmentVersion": 16
  }
 },
 "sourceType": "gocbcore",
 "sourceName": "testing",
 "sourceParams": {},
 "planParams": {
  "maxPartitionsPerPIndex": 103,
  "indexPartitions": 10,
  "numReplicas": 0
 }
}
```

Para obtener más detalles sobre cómo crear un índice de búsqueda con soporte para campos vectoriales, consulte la documentación.

- [Couchbase Capella](https://docs.couchbase.com/cloud/vector-search/create-vector-search-index-ui.html)

- [Couchbase Server](https://docs.couchbase.com/server/current/vector-search/create-vector-search-index-ui.html)

## Crear Vector Store

Creamos el objeto de vector store con la información del clúster y el nombre del índice de búsqueda.

```python
vector_store = CouchbaseVectorStore(
    cluster=cluster,
    bucket_name=BUCKET_NAME,
    scope_name=SCOPE_NAME,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
    index_name=SEARCH_INDEX_NAME,
)
```

### Especificar los campos de texto y embeddings

Puede especificar opcionalmente los campos de texto y embeddings del documento usando los campos `text_key` y `embedding_key`.

```python
vector_store = CouchbaseVectorStore(
    cluster=cluster,
    bucket_name=BUCKET_NAME,
    scope_name=SCOPE_NAME,
    collection_name=COLLECTION_NAME,
    embedding=embeddings,
    index_name=SEARCH_INDEX_NAME,
    text_key="text",
    embedding_key="embedding",
)
```

## Ejemplo básico de búsqueda vectorial

Para este ejemplo, vamos a cargar el archivo "state_of_the_union.txt" a través del TextLoader, dividir el texto en fragmentos de 500 caracteres sin solapamiento e indexar todos estos fragmentos en Couchbase.

Después de que se hayan indexado los datos, realizaremos una consulta simple para encontrar los 4 fragmentos más similares a la consulta "¿Qué dijo el presidente sobre Ketanji Brown Jackson?".

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
vector_store = CouchbaseVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    cluster=cluster,
    bucket_name=BUCKET_NAME,
    scope_name=SCOPE_NAME,
    collection_name=COLLECTION_NAME,
    index_name=SEARCH_INDEX_NAME,
)
```

```python
query = "What did president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(query)
print(results[0])
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

## Búsqueda de similitud con puntuación

Puede obtener las puntuaciones de los resultados llamando al método `similarity_search_with_score`.

```python
query = "What did president say about Ketanji Brown Jackson"
results = vector_store.similarity_search_with_score(query)
document, score = results[0]
print(document)
print(f"Score: {score}")
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
Score: 0.8211871385574341
```

## Especificar los campos a devolver

Puede especificar los campos a devolver del documento usando el parámetro `fields` en las búsquedas. Estos campos se devuelven como parte del objeto `metadata` en el Documento devuelto. Puede recuperar cualquier campo que esté almacenado en el índice de búsqueda. El `text_key` del documento se devuelve como parte del `page_content` del documento.

Si no especifica ningún campo para recuperar, se devuelven todos los campos almacenados en el índice.

Si desea recuperar uno de los campos de los metadatos, debe especificarlo usando `.`

Por ejemplo, para recuperar el campo `source` en los metadatos, debe especificar `metadata.source`.

```python
query = "What did president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(query, fields=["metadata.source"])
print(results[0])
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

## Búsqueda híbrida

Couchbase le permite realizar búsquedas híbridas combinando los resultados de la búsqueda vectorial con las búsquedas en campos no vectoriales del documento como el objeto `metadata`.

Los resultados se basarán en la combinación de los resultados de la búsqueda vectorial y las búsquedas compatibles con el Servicio de búsqueda. Las puntuaciones de cada una de las búsquedas componentes se suman para obtener la puntuación total del resultado.

Para realizar búsquedas híbridas, hay un parámetro opcional, `search_options`, que se puede pasar a todas las búsquedas de similitud.
Las diferentes posibilidades de búsqueda/consulta para `search_options` se pueden encontrar [aquí](https://docs.couchbase.com/server/current/search/search-request-params.html#query-object).

### Crear metadatos diversos para búsqueda híbrida

Para simular la búsqueda híbrida, creemos algunos metadatos aleatorios a partir de los documentos existentes.
Agregamos uniformemente tres campos a los metadatos, `date` entre 2010 y 2020, `rating` entre 1 y 5 y `author` establecido en John Doe o Jane Doe.

```python
# Adding metadata to documents
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"{range(2010, 2020)[i % 10]}-01-01"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["John Doe", "Jane Doe"][i % 2]

vector_store.add_documents(docs)

query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(query)
print(results[0].metadata)
```

```output
{'author': 'John Doe', 'date': '2016-01-01', 'rating': 2, 'source': '../../modules/state_of_the_union.txt'}
```

### Ejemplo: Buscar por valor exacto

Podemos buscar coincidencias exactas en un campo de texto como el autor en el objeto `metadata`.

```python
query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(
    query,
    search_options={"query": {"field": "metadata.author", "match": "John Doe"}},
    fields=["metadata.author"],
)
print(results[0])
```

```output
page_content='This is personal to me and Jill, to Kamala, and to so many of you. \n\nCancer is the #2 cause of death in America–second only to heart disease. \n\nLast month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago. \n\nOur goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases.  \n\nMore support for patients and families.' metadata={'author': 'John Doe'}
```

### Ejemplo: Buscar por coincidencia parcial

Podemos buscar coincidencias parciales especificando una imprecisión para la búsqueda. Esto es útil cuando desea buscar variaciones ligeras o errores ortográficos de una consulta de búsqueda.

Aquí, "Jae" está cerca (imprecisión de 1) de "Jane".

```python
query = "What did the president say about Ketanji Brown Jackson"
results = vector_store.similarity_search(
    query,
    search_options={
        "query": {"field": "metadata.author", "match": "Jae", "fuzziness": 1}
    },
    fields=["metadata.author"],
)
print(results[0])
```

```output
page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.' metadata={'author': 'Jane Doe'}
```

### Ejemplo: Buscar por consulta de rango de fechas

Podemos buscar documentos que se encuentren dentro de un rango de fechas en un campo de fecha como `metadata.date`.

```python
query = "Any mention about independence?"
results = vector_store.similarity_search(
    query,
    search_options={
        "query": {
            "start": "2016-12-31",
            "end": "2017-01-02",
            "inclusive_start": True,
            "inclusive_end": False,
            "field": "metadata.date",
        }
    },
)
print(results[0])
```

```output
page_content='He will never extinguish their love of freedom. He will never weaken the resolve of the free world. \n\nWe meet tonight in an America that has lived through two of the hardest years this nation has ever faced. \n\nThe pandemic has been punishing. \n\nAnd so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand.' metadata={'author': 'Jane Doe', 'date': '2017-01-01', 'rating': 3, 'source': '../../modules/state_of_the_union.txt'}
```

### Ejemplo: Buscar por consulta de rango numérico

Podemos buscar documentos que se encuentren dentro de un rango para un campo numérico como `metadata.rating`.

```python
query = "Any mention about independence?"
results = vector_store.similarity_search_with_score(
    query,
    search_options={
        "query": {
            "min": 3,
            "max": 5,
            "inclusive_min": True,
            "inclusive_max": True,
            "field": "metadata.rating",
        }
    },
)
print(results[0])
```

```output
(Document(page_content='He will never extinguish their love of freedom. He will never weaken the resolve of the free world. \n\nWe meet tonight in an America that has lived through two of the hardest years this nation has ever faced. \n\nThe pandemic has been punishing. \n\nAnd so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand.', metadata={'author': 'Jane Doe', 'date': '2017-01-01', 'rating': 3, 'source': '../../modules/state_of_the_union.txt'}), 0.9000703597577832)
```

### Ejemplo: Combinar varias consultas de búsqueda

Se pueden combinar diferentes consultas de búsqueda utilizando los operadores AND (conjuntos) u OR (disyuntos).

En este ejemplo, estamos verificando los documentos con una calificación entre 3 y 4 y con fecha entre 2015 y 2018.

```python
query = "Any mention about independence?"
results = vector_store.similarity_search_with_score(
    query,
    search_options={
        "query": {
            "conjuncts": [
                {"min": 3, "max": 4, "inclusive_max": True, "field": "metadata.rating"},
                {"start": "2016-12-31", "end": "2017-01-02", "field": "metadata.date"},
            ]
        }
    },
)
print(results[0])
```

```output
(Document(page_content='He will never extinguish their love of freedom. He will never weaken the resolve of the free world. \n\nWe meet tonight in an America that has lived through two of the hardest years this nation has ever faced. \n\nThe pandemic has been punishing. \n\nAnd so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand.', metadata={'author': 'Jane Doe', 'date': '2017-01-01', 'rating': 3, 'source': '../../modules/state_of_the_union.txt'}), 1.3598770370389914)
```

### Otras consultas

De manera similar, puede utilizar cualquiera de los métodos de consulta admitidos, como Distancia geográfica, Búsqueda de polígono, Comodín, Expresiones regulares, etc. en el parámetro `search_options`. Consulte la documentación para obtener más detalles sobre los métodos de consulta disponibles y su sintaxis.

- [Couchbase Capella](https://docs.couchbase.com/cloud/search/search-request-params.html#query-object)
- [Couchbase Server](https://docs.couchbase.com/server/current/search/search-request-params.html#query-object)

# Preguntas frecuentes

## Pregunta: ¿Debo crear el índice de búsqueda antes de crear el objeto CouchbaseVectorStore?

Sí, actualmente debe crear el índice de búsqueda antes de crear el objeto `CouchbaseVectorStore`.

## Pregunta: No veo todos los campos que especifiqué en mis resultados de búsqueda.

En Couchbase, solo podemos devolver los campos almacenados en el índice de búsqueda. Asegúrese de que el campo que está tratando de acceder en los resultados de búsqueda forme parte del índice de búsqueda.

Una forma de manejar esto es indexar y almacenar los campos de un documento de forma dinámica en el índice.

- En Capella, debe ir al "Modo avanzado" y luego, bajo el chevron "Configuración general", puede marcar "[X] Almacenar campos dinámicos" o "[X] Indexar campos dinámicos".
- En Couchbase Server, en el Editor de índices (no en el Editor rápido), bajo el chevron "Avanzado", puede marcar "[X] Almacenar campos dinámicos" o "[X] Indexar campos dinámicos".

Tenga en cuenta que estas opciones aumentarán el tamaño del índice.

Para obtener más detalles sobre los mapeos dinámicos, consulte la [documentación](https://docs.couchbase.com/cloud/search/customize-index.html).

## Pregunta: No puedo ver el objeto metadata en mis resultados de búsqueda.

Esto se debe más que probablemente a que el campo `metadata` en el documento no se ha indexado y/o almacenado por el índice de búsqueda de Couchbase. Para indexar el campo `metadata` en el documento, debe agregarlo al índice como un mapeo secundario.

Si selecciona mapear todos los campos del mapeo, podrá buscar por todos los campos de metadatos. Alternativamente, para optimizar el índice, puede seleccionar los campos específicos dentro del objeto `metadata` que se van a indexar. Puede consultar la [documentación](https://docs.couchbase.com/cloud/search/customize-index.html) para obtener más información sobre la indexación de mapeos secundarios.

Crear mapeos secundarios

* [Couchbase Capella](https://docs.couchbase.com/cloud/search/create-child-mapping.html)
* [Couchbase Server](https://docs.couchbase.com/server/current/search/create-child-mapping.html)
