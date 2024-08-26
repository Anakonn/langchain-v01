---
translated: true
---

# TileDB

> [TileDB](https://github.com/TileDB-Inc/TileDB)는 밀집 및 희소 다차원 배열을 색인화하고 쿼리하는 강력한 엔진입니다.

> TileDB는 [TileDB-Vector-Search](https://github.com/TileDB-Inc/TileDB-Vector-Search) 모듈을 사용하여 ANN 검색 기능을 제공합니다. 로컬 디스크 및 클라우드 객체 저장소(예: AWS S3)에서 ANN 쿼리의 서버리스 실행과 벡터 인덱스 저장을 제공합니다.

자세한 내용은 다음을 참조하세요:
-  [Why TileDB as a Vector Database](https://tiledb.com/blog/why-tiledb-as-a-vector-database)
-  [TileDB 101: Vector Search](https://tiledb.com/blog/tiledb-101-vector-search)

이 노트북은 `TileDB` 벡터 데이터베이스 사용 방법을 보여줍니다.

```python
%pip install --upgrade --quiet  tiledb-vector-search
```

## Basic Example

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

### Similarity search by vector

```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector)
docs[0].page_content
```

### Similarity search with score

```python
docs_and_scores = db.similarity_search_with_score(query)
docs_and_scores[0]
```

## Maximal Marginal Relevance Search (MMR)

검색기 객체에서 유사도 검색 외에도 `mmr`을 사용할 수 있습니다.

```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)
```

또는 `max_marginal_relevance_search`를 직접 사용할 수 있습니다:

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10)
```
