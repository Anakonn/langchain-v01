---
translated: true
---

# SQLite-VSS

>[SQLite-VSS](https://alexgarcia.xyz/sqlite-vss/)は、外部サーバーを必要とせずにアプリケーションに簡単に統合できるようにデザインされた`SQLite`拡張機能です。`Faiss`ライブラリを活用し、効率的な類似検索とクラスタリング機能を提供しています。

このノートブックでは、`SQLiteVSS`ベクトルデータベースの使用方法を示します。

```python
# You need to install sqlite-vss as a dependency.
%pip install --upgrade --quiet  sqlite-vss
```

## クイックスタート

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain_community.vectorstores import SQLiteVSS
from langchain_text_splitters import CharacterTextSplitter

# load the document and split it into chunks
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()

# split it into chunks
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
texts = [doc.page_content for doc in docs]


# create the open-source embedding function
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")


# load it in sqlite-vss in a table named state_union.
# the db_file parameter is the name of the file you want
# as your sqlite database.
db = SQLiteVSS.from_texts(
    texts=texts,
    embedding=embedding_function,
    table="state_union",
    db_file="/tmp/vss.db",
)

# query it
query = "What did the president say about Ketanji Brown Jackson"
data = db.similarity_search(query)

# print results
data[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

## 既存のSQLite接続の使用

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain_community.vectorstores import SQLiteVSS
from langchain_text_splitters import CharacterTextSplitter

# load the document and split it into chunks
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()

# split it into chunks
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
texts = [doc.page_content for doc in docs]


# create the open-source embedding function
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
connection = SQLiteVSS.create_connection(db_file="/tmp/vss.db")

db1 = SQLiteVSS(
    table="state_union", embedding=embedding_function, connection=connection
)

db1.add_texts(["Ketanji Brown Jackson is awesome"])
# query it again
query = "What did the president say about Ketanji Brown Jackson"
data = db1.similarity_search(query)

# print results
data[0].page_content
```

```output
'Ketanji Brown Jackson is awesome'
```

```python
# Cleaning up
import os

os.remove("/tmp/vss.db")
```
