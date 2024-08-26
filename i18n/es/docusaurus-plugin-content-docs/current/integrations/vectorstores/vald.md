---
translated: true
---

# Vald

> [Vald](https://github.com/vdaas/vald) es un motor de búsqueda de vectores densos aproximados de vecinos más cercanos (ANN) altamente escalable y distribuido.

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos `Vald`.

Para ejecutar este cuaderno, necesitas un clúster Vald en ejecución.
Consulta [Primeros pasos](https://github.com/vdaas/vald#get-started) para obtener más información.

Consulta las [instrucciones de instalación](https://github.com/vdaas/vald-client-python#install).

```python
%pip install --upgrade --quiet  vald-client-python
```

## Ejemplo básico

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Vald
from langchain_text_splitters import CharacterTextSplitter

raw_documents = TextLoader("state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
embeddings = HuggingFaceEmbeddings()
db = Vald.from_documents(documents, embeddings, host="localhost", port=8080)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
docs[0].page_content
```

### Búsqueda de similitud por vector

```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector)
docs[0].page_content
```

### Búsqueda de similitud con puntuación

```python
docs_and_scores = db.similarity_search_with_score(query)
docs_and_scores[0]
```

## Búsqueda de relevancia marginal máxima (MMR)

Además de usar la búsqueda de similitud en el objeto del recuperador, también puedes usar `mmr` como recuperador.

```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)
```

O usar `max_marginal_relevance_search` directamente:

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10)
```

## Ejemplo de uso de conexión segura

Para ejecutar este cuaderno, es necesario ejecutar un clúster Vald con conexión segura.

Aquí hay un ejemplo de un clúster Vald con la siguiente configuración utilizando la autenticación [Athenz](https://github.com/AthenZ/athenz).

ingress(TLS) -> [authorization-proxy](https://github.com/AthenZ/authorization-proxy)(Comprueba athenz-role-auth en los metadatos de grpc) -> vald-lb-gateway

```python
import grpc

with open("test_root_cacert.crt", "rb") as root:
    credentials = grpc.ssl_channel_credentials(root_certificates=root.read())

# Refresh is required for server use
with open(".ztoken", "rb") as ztoken:
    token = ztoken.read().strip()

metadata = [(b"athenz-role-auth", token)]
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Vald
from langchain_text_splitters import CharacterTextSplitter

raw_documents = TextLoader("state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
embeddings = HuggingFaceEmbeddings()

db = Vald.from_documents(
    documents,
    embeddings,
    host="localhost",
    port=443,
    grpc_use_secure=True,
    grpc_credentials=credentials,
    grpc_metadata=metadata,
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query, grpc_metadata=metadata)
docs[0].page_content
```

### Búsqueda de similitud por vector

```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector, grpc_metadata=metadata)
docs[0].page_content
```

### Búsqueda de similitud con puntuación

```python
docs_and_scores = db.similarity_search_with_score(query, grpc_metadata=metadata)
docs_and_scores[0]
```

### Búsqueda de relevancia marginal máxima (MMR)

```python
retriever = db.as_retriever(
    search_kwargs={"search_type": "mmr", "grpc_metadata": metadata}
)
retriever.invoke(query, grpc_metadata=metadata)
```

O:

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10, grpc_metadata=metadata)
```
