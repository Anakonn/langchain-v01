---
translated: true
---

# TileDB

> [TileDB](https://github.com/TileDB-Inc/TileDB)は、密な多次元配列と疎な多次元配列のインデックス化とクエリ処理に強力なエンジンです。

> TileDBは、[TileDB-Vector-Search](https://github.com/TileDB-Inc/TileDB-Vector-Search)モジュールを使ってANN検索機能を提供しています。サーバーレスでANNクエリの実行と、ローカルディスクやクラウドオブジェクトストア(AWS S3など)へのベクトルインデックスの保存が可能です。

詳細は以下をご覧ください:
-  [Why TileDB as a Vector Database](https://tiledb.com/blog/why-tiledb-as-a-vector-database)
-  [TileDB 101: Vector Search](https://tiledb.com/blog/tiledb-101-vector-search)

このノートブックでは、`TileDB`ベクトルデータベースの使用方法を示します。

```python
%pip install --upgrade --quiet  tiledb-vector-search
```

## 基本的な例

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

### ベクトルによる類似検索

```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector)
docs[0].page_content
```

### スコアを使った類似検索

```python
docs_and_scores = db.similarity_search_with_score(query)
docs_and_scores[0]
```

## 最大限の限界関連性検索(MMR)

retrieverオブジェクトで類似検索を使う以外に、`mmr`も retrieverとして使えます。

```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)
```

または、`max_marginal_relevance_search`を直接使うこともできます:

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10)
```
