---
translated: true
---

# Elasticsearch

Aperçu de la façon de générer des embeddings à l'aide d'un modèle d'embedding hébergé dans Elasticsearch

Le moyen le plus simple d'instancier la classe `ElasticsearchEmbeddings` est soit
- en utilisant le constructeur `from_credentials` si vous utilisez Elastic Cloud
- ou en utilisant le constructeur `from_es_connection` avec n'importe quel cluster Elasticsearch

```python
!pip -q install langchain-elasticsearch
```

```python
from langchain_elasticsearch import ElasticsearchEmbeddings
```

```python
# Define the model ID
model_id = "your_model_id"
```

## Test avec `from_credentials`

Cela nécessite un `cloud_id` Elastic Cloud

```python
# Instantiate ElasticsearchEmbeddings using credentials
embeddings = ElasticsearchEmbeddings.from_credentials(
    model_id,
    es_cloud_id="your_cloud_id",
    es_user="your_user",
    es_password="your_password",
)
```

```python
# Create embeddings for multiple documents
documents = [
    "This is an example document.",
    "Another example document to generate embeddings for.",
]
document_embeddings = embeddings.embed_documents(documents)
```

```python
# Print document embeddings
for i, embedding in enumerate(document_embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```

```python
# Create an embedding for a single query
query = "This is a single query."
query_embedding = embeddings.embed_query(query)
```

```python
# Print query embedding
print(f"Embedding for query: {query_embedding}")
```

## Test avec une connexion client Elasticsearch existante

Cela peut être utilisé avec n'importe quel déploiement Elasticsearch

```python
# Create Elasticsearch connection
from elasticsearch import Elasticsearch

es_connection = Elasticsearch(
    hosts=["https://es_cluster_url:port"], basic_auth=("user", "password")
)
```

```python
# Instantiate ElasticsearchEmbeddings using es_connection
embeddings = ElasticsearchEmbeddings.from_es_connection(
    model_id,
    es_connection,
)
```

```python
# Create embeddings for multiple documents
documents = [
    "This is an example document.",
    "Another example document to generate embeddings for.",
]
document_embeddings = embeddings.embed_documents(documents)
```

```python
# Print document embeddings
for i, embedding in enumerate(document_embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```

```python
# Create an embedding for a single query
query = "This is a single query."
query_embedding = embeddings.embed_query(query)
```

```python
# Print query embedding
print(f"Embedding for query: {query_embedding}")
```
