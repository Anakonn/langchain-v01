---
translated: true
---

# TileDB

> [TileDB](https://github.com/TileDB-Inc/TileDB) est un moteur puissant pour l'indexation et l'interrogation de tableaux multi-dimensionnels denses et épars.

> TileDB offre des capacités de recherche ANN à l'aide du module [TileDB-Vector-Search](https://github.com/TileDB-Inc/TileDB-Vector-Search). Il fournit une exécution sans serveur des requêtes ANN et le stockage des index de vecteurs à la fois sur le disque local et les magasins d'objets cloud (c'est-à-dire AWS S3).

Plus de détails dans :
-  [Pourquoi TileDB en tant que base de données de vecteurs](https://tiledb.com/blog/why-tiledb-as-a-vector-database)
-  [TileDB 101 : Recherche de vecteurs](https://tiledb.com/blog/tiledb-101-vector-search)

Ce notebook montre comment utiliser la base de données de vecteurs `TileDB`.

```python
%pip install --upgrade --quiet  tiledb-vector-search
```

## Exemple de base

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import TileDB
from langchain_text_splitters import CharacterTextSplitter

raw_documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
embeddings = HuggingFaceEmbeddings()
db = TileDB.from_documents(
    documents, embeddings, index_uri="/tmp/tiledb_index", index_type="FLAT"
)
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

## Recherche de pertinence marginale maximale (MMR)

En plus d'utiliser la recherche de similarité dans l'objet de récupérateur, vous pouvez également utiliser `mmr` comme récupérateur.

```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)
```

Ou utilisez `max_marginal_relevance_search` directement :

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10)
```
