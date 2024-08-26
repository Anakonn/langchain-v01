---
translated: true
---

# Tair

>[Tair](https://www.alibabacloud.com/help/en/tair/latest/what-is-tair) est un service de base de données en mémoire native du cloud développé par `Alibaba Cloud`.
Il fournit des modèles de données riches et des capacités de niveau entreprise pour prendre en charge vos scénarios en ligne en temps réel tout en maintenant une compatibilité complète avec l'open-source `Redis`. `Tair` introduit également des instances optimisées pour la mémoire persistante basées sur le nouveau support de stockage de mémoire non volatile (NVM).

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données vectorielle `Tair`.

Pour l'exécuter, vous devez avoir une instance `Tair` en cours d'exécution.

```python
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import Tair
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = FakeEmbeddings(size=128)
```

Connectez-vous à Tair à l'aide de la variable d'environnement `TAIR_URL`

```bash
export TAIR_URL="redis://{username}:{password}@{tair_address}:{tair_port}"
```

ou l'argument de mot-clé `tair_url`.

Ensuite, stockez des documents et des embeddings dans Tair.

```python
tair_url = "redis://localhost:6379"

# drop first if index already exists
Tair.drop_index(tair_url=tair_url)

vector_store = Tair.from_documents(docs, embeddings, tair_url=tair_url)
```

Recherchez des documents similaires.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
docs[0]
```

Création de l'index de recherche hybride Tair

```python
# drop first if index already exists
Tair.drop_index(tair_url=tair_url)

vector_store = Tair.from_documents(
    docs, embeddings, tair_url=tair_url, index_params={"lexical_algorithm": "bm25"}
)
```

Recherche hybride Tair

```python
query = "What did the president say about Ketanji Brown Jackson"
# hybrid_ratio: 0.5 hybrid search, 0.9999 vector search, 0.0001 text search
kwargs = {"TEXT": query, "hybrid_ratio": 0.5}
docs = vector_store.similarity_search(query, **kwargs)
docs[0]
```
