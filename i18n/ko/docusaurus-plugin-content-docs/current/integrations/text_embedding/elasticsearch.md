---
translated: true
---

# Elasticsearch

Elasticsearch에서 호스팅된 임베딩 모델을 사용하여 임베딩을 생성하는 방법

`ElasticsearchEmbeddings` 클래스를 인스턴스화하는 가장 쉬운 방법은 다음과 같습니다.
- Elastic Cloud를 사용하는 경우 `from_credentials` 생성자 사용
- 또는 `from_es_connection` 생성자를 사용하여 Elasticsearch 클러스터 연결

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

## `from_credentials`를 사용한 테스트

이 방법은 Elastic Cloud `cloud_id`가 필요합니다.

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

## 기존 Elasticsearch 클라이언트 연결을 사용한 테스트

이 방법은 모든 Elasticsearch 배포에 사용할 수 있습니다.

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
