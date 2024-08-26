---
translated: true
---

# Elasticsearch

Elasticsearch का उपयोग करके एम्बेडिंग जनरेट करने का तरीका

`ElasticsearchEmbeddings` क्लास को इंस्टैंशिएट करने का सबसे आसान तरीका है
- यदि आप Elastic Cloud का उपयोग कर रहे हैं तो `from_credentials` कंस्ट्रक्टर का उपयोग करें
- या किसी भी Elasticsearch क्लस्टर के साथ `from_es_connection` कंस्ट्रक्टर का उपयोग करें

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

## `from_credentials` के साथ परीक्षण करना

इसके लिए Elastic Cloud `cloud_id` की आवश्यकता है

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

## मौजूदा Elasticsearch क्लाइंट कनेक्शन के साथ परीक्षण करना

इसका उपयोग किसी भी Elasticsearch तैनाती के साथ किया जा सकता है

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
