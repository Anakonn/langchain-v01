---
translated: true
---

# TileDB

> [TileDB](https://github.com/TileDB-Inc/TileDB) es un motor poderoso para indexar y consultar matrices multidimensionales densas y dispersas.

> TileDB ofrece capacidades de búsqueda ANN utilizando el módulo [TileDB-Vector-Search](https://github.com/TileDB-Inc/TileDB-Vector-Search). Proporciona ejecución sin servidor de consultas ANN y almacenamiento de índices de vectores tanto en disco local como en almacenes de objetos en la nube (es decir, AWS S3).

Más detalles en:
-  [Por qué TileDB como base de datos de vectores](https://tiledb.com/blog/why-tiledb-as-a-vector-database)
-  [TileDB 101: Búsqueda de vectores](https://tiledb.com/blog/tiledb-101-vector-search)

Este cuaderno muestra cómo usar la base de datos de vectores `TileDB`.

```python
%pip install --upgrade --quiet  tiledb-vector-search
```

## Ejemplo básico

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

Además de usar la búsqueda de similitud en el objeto del buscador, también puedes usar `mmr` como buscador.

```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)
```

O usar `max_marginal_relevance_search` directamente:

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10)
```
