---
translated: true
---

# SurrealDB

>[SurrealDB](https://surrealdb.com/)は、Web、モバイル、サーバーレス、Jamstack、バックエンド、従来のアプリケーションを含む、モダンなアプリケーション向けに設計されたエンド・ツー・エンドのクラウドネイティブデータベースです。SurrealDBを使うことで、データベースとAPIのインフラストラクチャを簡素化し、開発時間を短縮し、セキュアで高パフォーマンスなアプリを迅速かつコスト効率的に構築できます。

>**SurrealDBの主な機能は以下の通りです:**

>* **開発時間の短縮:** SurrealDBはデータベースとAPIのスタックを簡素化し、ほとんどのサーバーサイドコンポーネントが不要になるため、セキュアで高パフォーマンスなアプリをより速く、より安価に構築できます。
>* **リアルタイムのコラボレーションAPIバックエンドサービス:** SurrealDBはデータベースとAPIバックエンドサービスの両方の機能を持ち、リアルタイムのコラボレーションを可能にします。
>* **複数のクエリ言語のサポート:** SurrealDBはクライアントデバイスからのSQL クエリ、GraphQL、ACID トランザクション、WebSocket接続、構造化/非構造化データ、グラフクエリ、全文検索、地理空間クエリをサポートしています。
>* **きめ細かなアクセス制御:** SurrealDBは行レベルのパーミッションベースのアクセス制御を提供し、データアクセスを細かく管理できます。

[機能](https://surrealdb.com/features)、最新の[リリース](https://surrealdb.com/releases)、[ドキュメンテーション](https://surrealdb.com/docs)をご覧ください。

このノートブックでは、`SurrealDBStore`に関連する機能の使用方法を示します。

## セットアップ

以下のセルをアンコメントしてsurrealdbをインストールします。

```python
# %pip install --upgrade --quiet  surrealdb langchain langchain-community
```

## SurrealDBStoreの使用

```python
# add this import for running in jupyter notebook
import nest_asyncio

nest_asyncio.apply()
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import SurrealDBStore
from langchain_text_splitters import CharacterTextSplitter
```

```python
documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = HuggingFaceEmbeddings()
```

### SurrealDBStoreオブジェクトの作成

```python
db = SurrealDBStore(
    dburl="ws://localhost:8000/rpc",  # url for the hosted SurrealDB database
    embedding_function=embeddings,
    db_user="root",  # SurrealDB credentials if needed: db username
    db_pass="root",  # SurrealDB credentials if needed: db password
    # ns="langchain", # namespace to use for vectorstore
    # db="database",  # database to use for vectorstore
    # collection="documents", #collection to use for vectorstore
)

# this is needed to initialize the underlying async library for SurrealDB
await db.initialize()

# delete all existing documents from the vectorstore collection
await db.adelete()

# add documents to the vectorstore
ids = await db.aadd_documents(docs)

# document ids of the added documents
ids[:5]
```

```output
['documents:38hz49bv1p58f5lrvrdc',
 'documents:niayw63vzwm2vcbh6w2s',
 'documents:it1fa3ktplbuye43n0ch',
 'documents:il8f7vgbbp9tywmsn98c',
 'documents:vza4c6cqje0avqd58gal']
```

### (別の方法) SurrealDBStoreオブジェクトを作成し、ドキュメントを追加する

```python
await db.adelete()

db = await SurrealDBStore.afrom_documents(
    dburl="ws://localhost:8000/rpc",  # url for the hosted SurrealDB database
    embedding=embeddings,
    documents=docs,
    db_user="root",  # SurrealDB credentials if needed: db username
    db_pass="root",  # SurrealDB credentials if needed: db password
    # ns="langchain", # namespace to use for vectorstore
    # db="database",  # database to use for vectorstore
    # collection="documents", #collection to use for vectorstore
)
```

### 類似検索

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = await db.asimilarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

### 類似検索とスコア

返されるdistance scoreはコサイン距離です。スコアが低いほど良い結果です。

```python
docs = await db.asimilarity_search_with_score(query)
```

```python
docs[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'id': 'documents:slgdlhjkfknhqo15xz0w', 'source': '../../modules/state_of_the_union.txt'}),
 0.39839531721941895)
```
