---
translated: true
---

# Postgres 埋め込み

> [Postgres 埋め込み](https://github.com/neondatabase/pg_embedding) は、`Postgres` 用のオープンソースのベクトル類似性検索で、近似最近傍検索に `Hierarchical Navigable Small Worlds (HNSW)` を使用します。

>以下をサポートします:
>- HNSW を使用した正確および近似最近傍検索
>- L2 距離

このノートブックは、Postgres ベクトルデータベース (`PGEmbedding`) の使用方法を示しています。

> PGEmbedding 統合は pg_embedding 拡張機能を作成しますが、以下の Postgres クエリを実行して追加します:

```sql
CREATE EXTENSION embedding;
```

```python
# Pip install necessary package
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  psycopg2-binary
%pip install --upgrade --quiet  tiktoken
```

環境変数に OpenAI API キーを追加して `OpenAIEmbeddings` を使用します。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
## Loading Environment Variables
from typing import List, Tuple
```

```python
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import PGEmbedding
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
os.environ["DATABASE_URL"] = getpass.getpass("Database Url:")
```

```output
Database Url:········
```

```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
connection_string = os.environ.get("DATABASE_URL")
collection_name = "state_of_the_union"
```

```python
db = PGEmbedding.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=collection_name,
    connection_string=connection_string,
)

query = "What did the president say about Ketanji Brown Jackson"
docs_with_score: List[Tuple[Document, float]] = db.similarity_search_with_score(query)
```

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

## Postgres での vectorstore の操作

### PG への vectorstore のアップロード

```python
db = PGEmbedding.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=collection_name,
    connection_string=connection_string,
    pre_delete_collection=False,
)
```

### HNSW インデックスの作成

デフォルトでは、拡張機能は 100％リコールでの逐次スキャン検索を実行します。`similarity_search_with_score` の実行時間を短縮するために、近似最近傍 (ANN) 検索用の HNSW インデックスを作成することを検討してください。ベクトル列に HNSW インデックスを作成するには、`create_hnsw_index` 関数を使用します:

```python
PGEmbedding.create_hnsw_index(
    max_elements=10000, dims=1536, m=8, ef_construction=16, ef_search=16
)
```

上記の関数は、以下の SQL クエリを実行するのと同等です:

```sql
CREATE INDEX ON vectors USING hnsw(vec) WITH (maxelements=10000, dims=1536, m=3, efconstruction=16, efsearch=16);
```

上記のステートメントで使用される HNSW インデックスオプションには以下が含まれます:

- maxelements: インデックス化される要素の最大数を定義します。これは必須パラメータです。上記の例では値が3です。実際の例では 1000000 のようなはるかに大きな値になります。「要素」とはデータセット内のデータポイント（ベクトル）を指し、HNSW グラフのノードとして表されます。通常、このオプションはデータセット内の行数に対応できる値に設定します。
- dims: ベクトルデータの次元数を定義します。これは必須パラメータです。上記の例では小さい値が使用されています。OpenAI の text-embedding-ada-002 モデルを使用して生成されたデータを格納する場合、1536 次元をサポートするため、例えば 1536 の値を定義します。
- m: グラフ構築中に各ノードに対して作成される双方向リンク（「エッジ」とも呼ばれる）の最大数を定義します。
以下の追加インデックスオプションもサポートされています:

- efConstruction: インデックス構築中に考慮される最近傍の数を定義します。デフォルト値は 32 です。
- efsearch: インデックス検索中に考慮される最近傍の数を定義します。デフォルト値は 32 です。
これらのオプションをどのように設定して HNSW アルゴリズムに影響を与えるかについては、[HNSW アルゴリズムのチューニング](https://neon.tech/docs/extensions/pg_embedding#tuning-the-hnsw-algorithm) を参照してください。

### PG での vectorstore の取得

```python
store = PGEmbedding(
    connection_string=connection_string,
    embedding_function=embeddings,
    collection_name=collection_name,
)

retriever = store.as_retriever()
```

```python
retriever
```

```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.pghnsw.HNSWVectoreStore object at 0x121d3c8b0>, search_type='similarity', search_kwargs={})
```

```python
db1 = PGEmbedding.from_existing_index(
    embedding=embeddings,
    collection_name=collection_name,
    pre_delete_collection=False,
    connection_string=connection_string,
)

query = "What did the president say about Ketanji Brown Jackson"
docs_with_score: List[Tuple[Document, float]] = db1.similarity_search_with_score(query)
```

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```
