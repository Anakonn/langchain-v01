---
translated: true
---

# OpenSearch

> [OpenSearch](https://opensearch.org/) est une suite logicielle open-source évolutive, flexible et extensible pour les applications de recherche, d'analyse et d'observabilité, sous licence Apache 2.0. `OpenSearch` est un moteur de recherche et d'analyse distribué basé sur `Apache Lucene`.

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données `OpenSearch`.

Pour l'exécuter, vous devez avoir une instance OpenSearch en cours d'exécution : [voir ici pour une installation Docker facile](https://hub.docker.com/r/opensearchproject/opensearch).

`similarity_search` effectue par défaut la recherche approximative des k plus proches voisins (Approximate k-NN Search) qui utilise l'un des plusieurs algorithmes comme lucene, nmslib, faiss recommandés pour les grands ensembles de données. Pour effectuer une recherche par force brute, nous avons d'autres méthodes de recherche connues sous le nom de Script Scoring et Painless Scripting.
Consultez [ceci](https://opensearch.org/docs/latest/search-plugins/knn/index/) pour plus de détails.

## Installation

Installez le client Python.

```python
%pip install --upgrade --quiet  opensearch-py
```

Nous voulons utiliser OpenAIEmbeddings, donc nous devons obtenir la clé API OpenAI.

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

## similarity_search utilisant Approximate k-NN

`similarity_search` utilisant la recherche `Approximate k-NN` avec des paramètres personnalisés

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

## similarity_search utilisant Script Scoring

`similarity_search` utilisant `Script Scoring` avec des paramètres personnalisés

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

## similarity_search utilisant Painless Scripting

`similarity_search` utilisant `Painless Scripting` avec des paramètres personnalisés

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

## Recherche de pertinence marginale maximale (MMR)

Si vous souhaitez rechercher des documents similaires, mais que vous souhaitez également obtenir des résultats diversifiés, MMR est la méthode à envisager. La pertinence marginale maximale optimise à la fois la similarité avec la requête et la diversité parmi les documents sélectionnés.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.max_marginal_relevance_search(query, k=2, fetch_k=10, lambda_param=0.5)
```

## Utilisation d'une instance OpenSearch préexistante

Il est également possible d'utiliser une instance OpenSearch préexistante avec des documents qui ont déjà des vecteurs présents.

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

## Utilisation d'AOSS (Amazon OpenSearch Service Serverless)

Il s'agit d'un exemple d'`AOSS` avec le moteur `faiss` et le `filtre efficace`.

Nous devons installer plusieurs packages `python`.

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

## Utilisation d'AOS (Amazon OpenSearch Service)

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
