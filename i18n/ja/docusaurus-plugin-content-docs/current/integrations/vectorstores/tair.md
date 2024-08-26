---
translated: true
---

# Tair

>[Tair](https://www.alibabacloud.com/help/en/tair/latest/what-is-tair)は、`Alibaba Cloud`が開発したクラウドネイティブのインメモリデータベースサービスです。
リアルタイムのオンラインシナリオをサポートしつつ、オープンソースの`Redis`との完全な互換性を維持しながら、豊富なデータモデルとエンタープライズグレードの機能を提供します。`Tair`はまた、新しい不揮発性メモリ(NVM)ストレージメディアに基づいた、パーシステントメモリ最適化インスタンスを導入しています。

このノートブックでは、`Tair`ベクトルデータベースに関連する機能の使用方法を示します。

実行するには、`Tair`インスタンスが稼働している必要があります。

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

`TAIR_URL`環境変数を使用して`Tair`に接続します。

```bash
export TAIR_URL="redis://{username}:{password}@{tair_address}:{tair_port}"
```

または、キーワード引数`tair_url`を使用します。

次に、Tairにドキュメントと埋め込みを格納します。

```python
tair_url = "redis://localhost:6379"

# drop first if index already exists
Tair.drop_index(tair_url=tair_url)

vector_store = Tair.from_documents(docs, embeddings, tair_url=tair_url)
```

類似ドキュメントを検索します。

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
docs[0]
```

Tair Hybrid Search Indexの構築

```python
# drop first if index already exists
Tair.drop_index(tair_url=tair_url)

vector_store = Tair.from_documents(
    docs, embeddings, tair_url=tair_url, index_params={"lexical_algorithm": "bm25"}
)
```

Tair Hybrid Search

```python
query = "What did the president say about Ketanji Brown Jackson"
# hybrid_ratio: 0.5 hybrid search, 0.9999 vector search, 0.0001 text search
kwargs = {"TEXT": query, "hybrid_ratio": 0.5}
docs = vector_store.similarity_search(query, **kwargs)
docs[0]
```
