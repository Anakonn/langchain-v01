---
translated: true
---

# Elasticsearch

Recorrido de cómo generar incrustaciones utilizando un modelo de incrustación alojado en Elasticsearch

La forma más sencilla de instanciar la clase `ElasticsearchEmbeddings` es
- usando el constructor `from_credentials` si está utilizando Elastic Cloud
- o usando el constructor `from_es_connection` con cualquier clúster de Elasticsearch

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

## Prueba con `from_credentials`

Esto requiere un `cloud_id` de Elastic Cloud

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

## Prueba con una conexión de cliente de Elasticsearch existente

Esto se puede usar con cualquier despliegue de Elasticsearch

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
