---
translated: true
---

# Elasticsearch

>[Elasticsearch](https://www.elastic.co/elasticsearch/) es un motor de búsqueda y análisis distribuido y RESTful, capaz de realizar búsquedas tanto vectoriales como léxicas. Está construido sobre la biblioteca Apache Lucene.

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos `Elasticsearch`.

```python
%pip install --upgrade --quiet langchain-elasticsearch langchain-openai tiktoken langchain
```

## Ejecutar y conectarse a Elasticsearch

Hay dos formas principales de configurar una instancia de Elasticsearch para su uso:

1. Elastic Cloud: Elastic Cloud es un servicio de Elasticsearch administrado. Regístrese para una [prueba gratuita](https://cloud.elastic.co/registration?utm_source=langchain&utm_content=documentation).

Para conectarse a una instancia de Elasticsearch que no requiere credenciales de inicio de sesión (iniciar la instancia de Docker con seguridad habilitada), pase la URL de Elasticsearch y el nombre del índice junto con el objeto de incrustación al constructor.

2. Instalar Elasticsearch localmente: Comience con Elasticsearch ejecutándolo localmente. La forma más sencilla es usar la imagen oficial de Docker de Elasticsearch. Consulte la [documentación de Docker de Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html) para obtener más información.

### Ejecutar Elasticsearch a través de Docker

Ejemplo: Ejecute una instancia de Elasticsearch de un solo nodo con la seguridad deshabilitada. Esto no se recomienda para uso en producción.

```bash
docker run -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "xpack.security.http.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.12.1
```

Una vez que la instancia de Elasticsearch se esté ejecutando, puede conectarse a ella usando la URL de Elasticsearch y el nombre del índice junto con el objeto de incrustación al constructor.

Ejemplo:

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    es_url="http://localhost:9200",
    index_name="test_index",
    embedding=embedding
)
```

### Autenticación

Para producción, le recomendamos que lo ejecute con la seguridad habilitada. Para conectarse con credenciales de inicio de sesión, puede usar los parámetros `es_api_key` o `es_user` y `es_password`.

Ejemplo:

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    es_url="http://localhost:9200",
    index_name="test_index",
    embedding=embedding,
    es_user="elastic",
    es_password="changeme"
)
```

También puede usar un objeto cliente `Elasticsearch` que le brinde más flexibilidad, por ejemplo, para configurar el número máximo de reintentos.

Ejemplo:

```python
import elasticsearch
from langchain_elasticsearch import ElasticsearchStore

es_client= elasticsearch.Elasticsearch(
    hosts=["http://localhost:9200"],
    es_user="elastic",
    es_password="changeme"
    max_retries=10,
)

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    index_name="test_index",
    es_connection=es_client,
    embedding=embedding,
)
```

#### ¿Cómo obtener una contraseña para el usuario "elastic" predeterminado?

Para obtener la contraseña de Elastic Cloud para el usuario "elastic" predeterminado:
1. Inicie sesión en la consola de Elastic Cloud en https://cloud.elastic.co
2. Vaya a "Seguridad" > "Usuarios"
3. Ubique al usuario "elastic" y haga clic en "Editar"
4. Haga clic en "Restablecer contraseña"
5. Siga las indicaciones para restablecer la contraseña

#### ¿Cómo obtener una clave API?

Para obtener una clave API:
1. Inicie sesión en la consola de Elastic Cloud en https://cloud.elastic.co
2. Abra Kibana y vaya a Administración del stack > Claves API
3. Haga clic en "Crear clave API"
4. Ingrese un nombre para la clave API y haga clic en "Crear"
5. Copie la clave API y péguela en el parámetro `api_key`

### Elastic Cloud

Para conectarse a una instancia de Elasticsearch en Elastic Cloud, puede usar el parámetro `es_cloud_id` o `es_url`.

Ejemplo:

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    es_cloud_id="<cloud_id>",
    index_name="test_index",
    embedding=embedding,
    es_user="elastic",
    es_password="changeme"
)
```

Para usar `OpenAIEmbeddings`, debemos configurar la clave API de OpenAI en el entorno.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## Ejemplo básico

En este ejemplo, vamos a cargar "state_of_the_union.txt" a través de TextLoader, dividir el texto en fragmentos de 500 palabras y luego indexar cada fragmento en Elasticsearch.

Una vez que se hayan indexado los datos, realizaremos una consulta simple para encontrar los 4 fragmentos más similares a la consulta "¿Qué dijo el presidente sobre Ketanji Brown Jackson?".

Elasticsearch se está ejecutando localmente en localhost:9200 con [docker](#ejecutar-elasticsearch-a-través-de-docker). Para obtener más detalles sobre cómo conectarse a Elasticsearch desde Elastic Cloud, consulte [conexión con autenticación](#autenticación) arriba.

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test-basic",
)

db.client.indices.refresh(index="test-basic")

query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)
print(results)
```

```output
[Document(page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'}), Document(page_content='As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. \n\nWhile it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.', metadata={'source': '../../modules/state_of_the_union.txt'}), Document(page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.', metadata={'source': '../../modules/state_of_the_union.txt'}), Document(page_content='This is personal to me and Jill, to Kamala, and to so many of you. \n\nCancer is the #2 cause of death in America–second only to heart disease. \n\nLast month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago. \n\nOur goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases.  \n\nMore support for patients and families.', metadata={'source': '../../modules/state_of_the_union.txt'})]
```

# Metadatos

`ElasticsearchStore` admite metadatos que se almacenan junto con el documento. Este objeto de diccionario de metadatos se almacena en un campo de objeto de metadatos en el documento de Elasticsearch. En función del valor de los metadatos, Elasticsearch configurará automáticamente la asignación infiriendo el tipo de datos del valor de los metadatos. Por ejemplo, si el valor de los metadatos es una cadena, Elasticsearch configurará la asignación del campo de objeto de metadatos como un tipo de cadena.

```python
# Adding metadata to documents
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"{range(2010, 2020)[i % 10]}-01-01"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["John Doe", "Jane Doe"][i % 2]

db = ElasticsearchStore.from_documents(
    docs, embeddings, es_url="http://localhost:9200", index_name="test-metadata"
)

query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2016-01-01', 'rating': 2, 'author': 'John Doe'}
```

## Filtrar metadatos

Con los metadatos agregados a los documentos, puede agregar el filtrado de metadatos en el momento de la consulta.

### Ejemplo: Filtrar por palabra clave exacta

Nota: Estamos usando el subcampo de palabra clave que no se analiza.

```python
docs = db.similarity_search(
    query, filter=[{"term": {"metadata.author.keyword": "John Doe"}}]
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2016-01-01', 'rating': 2, 'author': 'John Doe'}
```

### Ejemplo: Filtrar por coincidencia parcial

Este ejemplo muestra cómo filtrar por coincidencia parcial. Esto es útil cuando no conoce el valor exacto del campo de metadatos. Por ejemplo, si desea filtrar por el campo de metadatos `author` y no conoce el valor exacto del autor, puede usar una coincidencia parcial para filtrar por el apellido del autor. También se admite la coincidencia difusa.

"Jon" coincide con "John Doe" ya que "Jon" es una coincidencia cercana con el token "John".

```python
docs = db.similarity_search(
    query,
    filter=[{"match": {"metadata.author": {"query": "Jon", "fuzziness": "AUTO"}}}],
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2016-01-01', 'rating': 2, 'author': 'John Doe'}
```

### Ejemplo: Filtrar por rango de fechas

```python
docs = db.similarity_search(
    "Any mention about Fred?",
    filter=[{"range": {"metadata.date": {"gte": "2010-01-01"}}}],
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2012-01-01', 'rating': 3, 'author': 'John Doe', 'geo_location': {'lat': 40.12, 'lon': -71.34}}
```

### Ejemplo: Filtrar por rango numérico

```python
docs = db.similarity_search(
    "Any mention about Fred?", filter=[{"range": {"metadata.rating": {"gte": 2}}}]
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2012-01-01', 'rating': 3, 'author': 'John Doe', 'geo_location': {'lat': 40.12, 'lon': -71.34}}
```

### Ejemplo: Filtrar por distancia geográfica

Requiere un índice con una asignación de geo_point declarada para `metadata.geo_location`.

```python
docs = db.similarity_search(
    "Any mention about Fred?",
    filter=[
        {
            "geo_distance": {
                "distance": "200km",
                "metadata.geo_location": {"lat": 40, "lon": -70},
            }
        }
    ],
)
print(docs[0].metadata)
```

El filtro admite muchos más tipos de consultas que los anteriores.

Lea más sobre ellos en la [documentación](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html).

# Algoritmo de similitud de distancia

Elasticsearch admite los siguientes algoritmos de similitud de vector de distancia:

- coseno
- euclidiano
- dot_product

El algoritmo de similitud de coseno es el predeterminado.

Puede especificar el algoritmo de similitud necesario a través del parámetro de similitud.

**NOTA**
Dependiendo de la estrategia de recuperación, el algoritmo de similitud no se puede cambiar en el momento de la consulta. Debe establecerse al crear el mapeo de índice para el campo. Si necesita cambiar el algoritmo de similitud, debe eliminar el índice y volver a crearlo con la distance_strategy correcta.

```python

db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    distance_strategy="COSINE"
    # distance_strategy="EUCLIDEAN_DISTANCE"
    # distance_strategy="DOT_PRODUCT"
)

```

# Estrategias de recuperación

Elasticsearch tiene grandes ventajas sobre otras bases de datos de vectores únicamente por su capacidad para admitir una amplia gama de estrategias de recuperación. En este cuaderno, configuraremos `ElasticsearchStore` para admitir algunas de las estrategias de recuperación más comunes.

De forma predeterminada, `ElasticsearchStore` utiliza la `ApproxRetrievalStrategy`.

## ApproxRetrievalStrategy

Esto devolverá los `k` vectores más similares a la consulta. El parámetro `k` se establece cuando se inicializa `ElasticsearchStore`. El valor predeterminado es `10`.

```python
db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(),
)

docs = db.similarity_search(
    query="What did the president say about Ketanji Brown Jackson?", k=10
)
```

### Ejemplo: Approx con híbrido

Este ejemplo mostrará cómo configurar `ElasticsearchStore` para realizar una recuperación híbrida, utilizando una combinación de búsqueda semántica aproximada y búsqueda basada en palabras clave.

Utilizamos RRF para equilibrar los dos puntajes de diferentes métodos de recuperación.

Para habilitar la recuperación híbrida, debemos establecer `hybrid=True` en el constructor de `ApproxRetrievalStrategy` de `ElasticsearchStore`.

```python

db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(
        hybrid=True,
    )
)
```

Cuando se habilita `hybrid`, la consulta realizada será una combinación de búsqueda semántica aproximada y búsqueda basada en palabras clave.

Utilizará `rrf` (Reciprocal Rank Fusion) para equilibrar los dos puntajes de diferentes métodos de recuperación.

**Nota** RRF requiere Elasticsearch 8.9.0 o superior.

```json
{
    "knn": {
        "field": "vector",
        "filter": [],
        "k": 1,
        "num_candidates": 50,
        "query_vector": [1.0, ..., 0.0],
    },
    "query": {
        "bool": {
            "filter": [],
            "must": [{"match": {"text": {"query": "foo"}}}],
        }
    },
    "rank": {"rrf": {}},
}
```

### Ejemplo: Approx con modelo de incrustación en Elasticsearch

Este ejemplo mostrará cómo configurar `ElasticsearchStore` para usar el modelo de incrustación implementado en Elasticsearch para la recuperación aproximada.

Para usar esto, especifique el model_id en el constructor de `ApproxRetrievalStrategy` de `ElasticsearchStore` a través del argumento `query_model_id`.

**NOTA** Esto requiere que el modelo se implemente y se ejecute en el nodo ml de Elasticsearch. Consulte el [ejemplo de cuaderno](https://github.com/elastic/elasticsearch-labs/blob/main/notebooks/integrations/hugging-face/loading-model-from-hugging-face.md) sobre cómo implementar el modelo con eland.

```python
APPROX_SELF_DEPLOYED_INDEX_NAME = "test-approx-self-deployed"

# Note: This does not have an embedding function specified
# Instead, we will use the embedding model deployed in Elasticsearch
db = ElasticsearchStore(
    es_cloud_id="<your cloud id>",
    es_user="elastic",
    es_password="<your password>",
    index_name=APPROX_SELF_DEPLOYED_INDEX_NAME,
    query_field="text_field",
    vector_query_field="vector_query_field.predicted_value",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(
        query_model_id="sentence-transformers__all-minilm-l6-v2"
    ),
)

# Setup a Ingest Pipeline to perform the embedding
# of the text field
db.client.ingest.put_pipeline(
    id="test_pipeline",
    processors=[
        {
            "inference": {
                "model_id": "sentence-transformers__all-minilm-l6-v2",
                "field_map": {"query_field": "text_field"},
                "target_field": "vector_query_field",
            }
        }
    ],
)

# creating a new index with the pipeline,
# not relying on langchain to create the index
db.client.indices.create(
    index=APPROX_SELF_DEPLOYED_INDEX_NAME,
    mappings={
        "properties": {
            "text_field": {"type": "text"},
            "vector_query_field": {
                "properties": {
                    "predicted_value": {
                        "type": "dense_vector",
                        "dims": 384,
                        "index": True,
                        "similarity": "l2_norm",
                    }
                }
            },
        }
    },
    settings={"index": {"default_pipeline": "test_pipeline"}},
)

db.from_texts(
    ["hello world"],
    es_cloud_id="<cloud id>",
    es_user="elastic",
    es_password="<cloud password>",
    index_name=APPROX_SELF_DEPLOYED_INDEX_NAME,
    query_field="text_field",
    vector_query_field="vector_query_field.predicted_value",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(
        query_model_id="sentence-transformers__all-minilm-l6-v2"
    ),
)

# Perform search
db.similarity_search("hello world", k=10)
```

## Estrategia de recuperación de vectores dispersos (ELSER)

Esta estrategia utiliza la recuperación de vectores dispersos de Elasticsearch para recuperar los k resultados principales. Por ahora solo admitimos nuestro propio modelo de incrustación "ELSER".

**NOTA** Esto requiere que el modelo ELSER se implemente y se ejecute en el nodo ml de Elasticsearch.

Para usar esto, especifique `SparseVectorRetrievalStrategy` en el constructor de `ElasticsearchStore`.

```python
# Note that this example doesn't have an embedding function. This is because we infer the tokens at index time and at query time within Elasticsearch.
# This requires the ELSER model to be loaded and running in Elasticsearch.
db = ElasticsearchStore.from_documents(
    docs,
    es_cloud_id="My_deployment:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQ2OGJhMjhmNDc1M2Y0MWVjYTk2NzI2ZWNkMmE5YzRkNyQ3NWI4ODRjNWQ2OTU0MTYzODFjOTkxNmQ1YzYxMGI1Mw==",
    es_user="elastic",
    es_password="GgUPiWKwEzgHIYdHdgPk1Lwi",
    index_name="test-elser",
    strategy=ElasticsearchStore.SparseVectorRetrievalStrategy(),
)

db.client.indices.refresh(index="test-elser")

results = db.similarity_search(
    "What did the president say about Ketanji Brown Jackson", k=4
)
print(results[0])
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

## Estrategia de recuperación exacta

Esta estrategia utiliza la recuperación exacta (también conocida como fuerza bruta) de Elasticsearch para recuperar los k resultados principales.

Para usar esto, especifique `ExactRetrievalStrategy` en el constructor de `ElasticsearchStore`.

```python

db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    strategy=ElasticsearchStore.ExactRetrievalStrategy()
)
```

## Estrategia de recuperación BM25

Esta estrategia permite al usuario realizar búsquedas utilizando BM25 puro sin búsqueda de vectores.

Para usar esto, especifique `BM25RetrievalStrategy` en el constructor de `ElasticsearchStore`.

Tenga en cuenta que en el ejemplo a continuación, la opción de incrustación no se especifica, lo que indica que la búsqueda se realiza sin usar incrustaciones.

```python
from langchain_elasticsearch import ElasticsearchStore

db = ElasticsearchStore(
    es_url="http://localhost:9200",
    index_name="test_index",
    strategy=ElasticsearchStore.BM25RetrievalStrategy(),
)

db.add_texts(
    ["foo", "foo bar", "foo bar baz", "bar", "bar baz", "baz"],
)

results = db.similarity_search(query="foo", k=10)
print(results)
```

```output
[Document(page_content='foo'), Document(page_content='foo bar'), Document(page_content='foo bar baz')]
```

## Personalizar la consulta

Con el parámetro `custom_query` en la búsqueda, puede ajustar la consulta que se usa para recuperar documentos de Elasticsearch. Esto es útil si desea usar una consulta más compleja, para admitir el aumento lineal de campos.

```python
# Example of a custom query thats just doing a BM25 search on the text field.
def custom_query(query_body: dict, query: str):
    """Custom query to be used in Elasticsearch.
    Args:
        query_body (dict): Elasticsearch query body.
        query (str): Query string.
    Returns:
        dict: Elasticsearch query body.
    """
    print("Query Retriever created by the retrieval strategy:")
    print(query_body)
    print()

    new_query_body = {"query": {"match": {"text": query}}}

    print("Query thats actually used in Elasticsearch:")
    print(new_query_body)
    print()

    return new_query_body


results = db.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    k=4,
    custom_query=custom_query,
)
print("Results:")
print(results[0])
```

```output
Query Retriever created by the retrieval strategy:
{'query': {'bool': {'must': [{'text_expansion': {'vector.tokens': {'model_id': '.elser_model_1', 'model_text': 'What did the president say about Ketanji Brown Jackson'}}}], 'filter': []}}}

Query thats actually used in Elasticsearch:
{'query': {'match': {'text': 'What did the president say about Ketanji Brown Jackson'}}}

Results:
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

# Personalizar el constructor de documentos

Con el parámetro `doc_builder` en la búsqueda, puede ajustar cómo se construye un documento utilizando datos recuperados de Elasticsearch. Esto es especialmente útil si tiene índices que no se crearon utilizando Langchain.

```python
from typing import Dict

from langchain_core.documents import Document


def custom_document_builder(hit: Dict) -> Document:
    src = hit.get("_source", {})
    return Document(
        page_content=src.get("content", "Missing content!"),
        metadata={
            "page_number": src.get("page_number", -1),
            "original_filename": src.get("original_filename", "Missing filename!"),
        },
    )


results = db.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    k=4,
    doc_builder=custom_document_builder,
)
print("Results:")
print(results[0])
```

# Preguntas frecuentes

## Pregunta: Estoy recibiendo errores de tiempo de espera al indexar documentos en Elasticsearch. ¿Cómo lo soluciono?

Un posible problema es que sus documentos puedan tardar más en indexarse en Elasticsearch. ElasticsearchStore utiliza la API de bulk de Elasticsearch, que tiene algunos valores predeterminados que puede ajustar para reducir la posibilidad de errores de tiempo de espera.

También es una buena idea cuando se usa SparseVectorRetrievalStrategy.

Los valores predeterminados son:
- `chunk_size`: 500
- `max_chunk_bytes`: 100MB

Para ajustar estos, puede pasar los parámetros `chunk_size` y `max_chunk_bytes` al método `add_texts` de ElasticsearchStore.

```python
    vector_store.add_texts(
        texts,
        bulk_kwargs={
            "chunk_size": 50,
            "max_chunk_bytes": 200000000
        }
    )
```

# Actualización a ElasticsearchStore

Si ya está usando Elasticsearch en su proyecto basado en langchain, es posible que esté usando las implementaciones antiguas: `ElasticVectorSearch` y `ElasticKNNSearch` que ahora están en desuso. Hemos introducido una nueva implementación llamada `ElasticsearchStore` que es más flexible y fácil de usar. Este cuaderno lo guiará a través del proceso de actualización a la nueva implementación.

## ¿Qué hay de nuevo?

La nueva implementación ahora es una sola clase llamada `ElasticsearchStore` que se puede usar para la recuperación de búsqueda aproximada, exacta y ELSER, a través de estrategias.

## Estoy usando ElasticKNNSearch

Implementación antigua:

```python

from langchain_community.vectorstores.elastic_vector_search import ElasticKNNSearch

db = ElasticKNNSearch(
  elasticsearch_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding
)

```

Nueva implementación:

```python

from langchain_elasticsearch import ElasticsearchStore

db = ElasticsearchStore(
  es_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding,
  # if you use the model_id
  # strategy=ElasticsearchStore.ApproxRetrievalStrategy( query_model_id="test_model" )
  # if you use hybrid search
  # strategy=ElasticsearchStore.ApproxRetrievalStrategy( hybrid=True )
)

```

## Estoy usando ElasticVectorSearch

Implementación antigua:

```python

from langchain_community.vectorstores.elastic_vector_search import ElasticVectorSearch

db = ElasticVectorSearch(
  elasticsearch_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding
)

```

Nueva implementación:

```python

from langchain_elasticsearch import ElasticsearchStore

db = ElasticsearchStore(
  es_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding,
  strategy=ElasticsearchStore.ExactRetrievalStrategy()
)

```

```python
db.client.indices.delete(
    index="test-metadata, test-elser, test-basic",
    ignore_unavailable=True,
    allow_no_indices=True,
)
```

```output
ObjectApiResponse({'acknowledged': True})
```
