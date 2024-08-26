---
translated: true
---

# OpenSearch

> [OpenSearch](https://opensearch.org/) es un conjunto de software de código abierto escalable, flexible y extensible para aplicaciones de búsqueda, análisis y observabilidad con licencia Apache 2.0. `OpenSearch` es un motor de búsqueda y análisis distribuido basado en `Apache Lucene`.

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos `OpenSearch`.

Para ejecutar, debe tener una instancia de OpenSearch en ejecución: [consulte aquí para una instalación fácil con Docker](https://hub.docker.com/r/opensearchproject/opensearch).

`similarity_search` por defecto realiza la Búsqueda Aproximada k-NN que utiliza uno de los varios algoritmos como lucene, nmslib, faiss recomendados para
conjuntos de datos grandes. Para realizar una búsqueda de fuerza bruta, tenemos otros métodos de búsqueda conocidos como Script Scoring y Painless Scripting.
Consulte [esto](https://opensearch.org/docs/latest/search-plugins/knn/index/) para más detalles.

## Instalación

Instale el cliente de Python.

```python
%pip install --upgrade --quiet  opensearch-py
```

Queremos usar OpenAIEmbeddings, así que tenemos que obtener la clave API de OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import OpenSearchVectorSearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

## `similarity_search` usando Aproximación k-NN

`similarity_search` usando Búsqueda `Aproximada k-NN` con Parámetros Personalizados

```python
docsearch = OpenSearchVectorSearch.from_documents(
    docs, embeddings, opensearch_url="http://localhost:9200"
)

# If using the default Docker installation, use this instantiation instead:
# docsearch = OpenSearchVectorSearch.from_documents(
#     docs,
#     embeddings,
#     opensearch_url="https://localhost:9200",
#     http_auth=("admin", "admin"),
#     use_ssl = False,
#     verify_certs = False,
#     ssl_assert_hostname = False,
#     ssl_show_warn = False,
# )
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query, k=10)
```

```python
print(docs[0].page_content)
```

```python
docsearch = OpenSearchVectorSearch.from_documents(
    docs,
    embeddings,
    opensearch_url="http://localhost:9200",
    engine="faiss",
    space_type="innerproduct",
    ef_construction=256,
    m=48,
)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```python
print(docs[0].page_content)
```

## `similarity_search` usando Script Scoring

`similarity_search` usando `Script Scoring` con Parámetros Personalizados

```python
docsearch = OpenSearchVectorSearch.from_documents(
    docs, embeddings, opensearch_url="http://localhost:9200", is_appx_search=False
)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    k=1,
    search_type="script_scoring",
)
```

```python
print(docs[0].page_content)
```

## `similarity_search` usando Painless Scripting

`similarity_search` usando `Painless Scripting` con Parámetros Personalizados

```python
docsearch = OpenSearchVectorSearch.from_documents(
    docs, embeddings, opensearch_url="http://localhost:9200", is_appx_search=False
)
filter = {"bool": {"filter": {"term": {"text": "smuggling"}}}}
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    search_type="painless_scripting",
    space_type="cosineSimilarity",
    pre_filter=filter,
)
```

```python
print(docs[0].page_content)
```

## Búsqueda de relevancia marginal máxima (MMR)

Si desea buscar algunos documentos similares, pero también le gustaría recibir resultados diversos, MMR es el método que debe considerar. La relevancia marginal máxima optimiza la similitud con la consulta Y la diversidad entre los documentos seleccionados.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.max_marginal_relevance_search(query, k=2, fetch_k=10, lambda_param=0.5)
```

## Uso de una instancia de OpenSearch preexistente

También es posible usar una instancia de OpenSearch preexistente con documentos que ya tienen vectores presentes.

```python
# this is just an example, you would need to change these values to point to another opensearch instance
docsearch = OpenSearchVectorSearch(
    index_name="index-*",
    embedding_function=embeddings,
    opensearch_url="http://localhost:9200",
)

# you can specify custom field names to match the fields you're using to store your embedding, document text value, and metadata
docs = docsearch.similarity_search(
    "Who was asking about getting lunch today?",
    search_type="script_scoring",
    space_type="cosinesimil",
    vector_field="message_embedding",
    text_field="message",
    metadata_field="message_metadata",
)
```

## Uso de AOSS (Amazon OpenSearch Service Serverless)

Es un ejemplo de `AOSS` con el motor `faiss` y `efficient_filter`.

Necesitamos instalar varios paquetes `python`.

```python
%pip install --upgrade --quiet  boto3 requests requests-aws4auth
```

```python
import boto3
from opensearchpy import RequestsHttpConnection
from requests_aws4auth import AWS4Auth

service = "aoss"  # must set the service as 'aoss'
region = "us-east-2"
credentials = boto3.Session(
    aws_access_key_id="xxxxxx", aws_secret_access_key="xxxxx"
).get_credentials()
awsauth = AWS4Auth("xxxxx", "xxxxxx", region, service, session_token=credentials.token)

docsearch = OpenSearchVectorSearch.from_documents(
    docs,
    embeddings,
    opensearch_url="host url",
    http_auth=awsauth,
    timeout=300,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection,
    index_name="test-index-using-aoss",
    engine="faiss",
)

docs = docsearch.similarity_search(
    "What is feature selection",
    efficient_filter=filter,
    k=200,
)
```

## Uso de AOS (Amazon OpenSearch Service)

```python
%pip install --upgrade --quiet  boto3
```

```python
# This is just an example to show how to use Amazon OpenSearch Service, you need to set proper values.
import boto3
from opensearchpy import RequestsHttpConnection

service = "es"  # must set the service as 'es'
region = "us-east-2"
credentials = boto3.Session(
    aws_access_key_id="xxxxxx", aws_secret_access_key="xxxxx"
).get_credentials()
awsauth = AWS4Auth("xxxxx", "xxxxxx", region, service, session_token=credentials.token)

docsearch = OpenSearchVectorSearch.from_documents(
    docs,
    embeddings,
    opensearch_url="host url",
    http_auth=awsauth,
    timeout=300,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection,
    index_name="test-index",
)

docs = docsearch.similarity_search(
    "What is feature selection",
    k=200,
)
```
