---
translated: true
---

# Vald

> [Vald](https://github.com/vdaas/vald) est un moteur de recherche de vecteurs denses à approximation rapide (ANN) hautement évolutif et distribué.

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données `Vald`.

Pour exécuter ce notebook, vous avez besoin d'un cluster Vald en cours d'exécution.
Consultez [Démarrer](https://github.com/vdaas/vald#get-started) pour plus d'informations.

Voir les [instructions d'installation](https://github.com/vdaas/vald-client-python#install).

```python
%pip install --upgrade --quiet  vald-client-python
```

## Exemple de base

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

### Recherche de similarité par vecteur

```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector)
docs[0].page_content
```

### Recherche de similarité avec score

```python
docs_and_scores = db.similarity_search_with_score(query)
docs_and_scores[0]
```

## Recherche de Pertinence Marginale Maximale (MMR)

En plus d'utiliser la recherche de similarité dans l'objet de récupération, vous pouvez également utiliser `mmr` comme récupérateur.

```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)
```

Ou utilisez `max_marginal_relevance_search` directement :

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10)
```

## Exemple d'utilisation d'une connexion sécurisée

Pour exécuter ce notebook, il est nécessaire d'exécuter un cluster Vald avec une connexion sécurisée.

Voici un exemple d'un cluster Vald avec la configuration suivante utilisant l'authentification [Athenz](https://github.com/AthenZ/athenz).

ingress(TLS) -> [authorization-proxy](https://github.com/AthenZ/authorization-proxy)(Vérifier athenz-role-auth dans les métadonnées grpc) -> vald-lb-gateway

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

### Recherche de similarité par vecteur

```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector, grpc_metadata=metadata)
docs[0].page_content
```

### Recherche de similarité avec score

```python
docs_and_scores = db.similarity_search_with_score(query, grpc_metadata=metadata)
docs_and_scores[0]
```

### Recherche de Pertinence Marginale Maximale (MMR)

```python
retriever = db.as_retriever(
    search_kwargs={"search_type": "mmr", "grpc_metadata": metadata}
)
retriever.invoke(query, grpc_metadata=metadata)
```

Ou :

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10, grpc_metadata=metadata)
```
