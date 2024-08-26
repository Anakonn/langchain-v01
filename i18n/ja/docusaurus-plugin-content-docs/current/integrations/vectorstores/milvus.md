---
translated: true
---

# Milvus

>[Milvus](https://milvus.io/docs/overview.md)は、深層ニューラルネットワークやその他のマシンラーニング(ML)モデルによって生成された大量の埋め込みベクトルを格納、インデックス化、管理するデータベースです。

このノートブックでは、Milvusベクトルデータベースに関連する機能の使用方法を示します。

実行するには、[Milvusインスタンスが起動している](https://milvus.io/docs/install_standalone-docker.md)必要があります。

```python
%pip install --upgrade --quiet  pymilvus
```

OpenAIEmbeddingsを使用したいので、OpenAI APIキーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Milvus
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
docs[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

### Milvusコレクションでデータを区分する

同じMilvusインスタンス内で、関連性のない異なるドキュメントを別のコレクションに格納することで、コンテキストを維持できます。

新しいコレクションを作成する方法は以下の通りです。

```python
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    collection_name="collection_1",
    connection_args={"host": "127.0.0.1", "port": "19530"},
)
```

そして、格納されたコレクションを取得する方法は以下の通りです。

```python
vector_db = Milvus(
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
    collection_name="collection_1",
)
```

取得後は、通常通りクエリを実行できます。

### ユーザー別の検索

検索アプリを構築する際は、複数のユーザーを考慮する必要があります。つまり、1人のユーザーだけでなく、さまざまなユーザーのデータを格納する必要があり、ユーザー間でデータを共有してはいけません。

Milvusでは、[partition_key](https://milvus.io/docs/multi_tenancy.md#Partition-key-based-multi-tenancy)を使ってマルチテナンシーを実装することをお勧めしています。以下に例を示します。

```python
from langchain_core.documents import Document

docs = [
    Document(page_content="i worked at kensho", metadata={"namespace": "harrison"}),
    Document(page_content="i worked at facebook", metadata={"namespace": "ankush"}),
]
vectorstore = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
    drop_old=True,
    partition_key_field="namespace",  # Use the "namespace" field as the partition key
)
```

パーティションキーを使って検索するには、検索リクエストのブール式に以下のいずれかを含める必要があります:

`search_kwargs={"expr": '<partition_key> == "xxxx"'}`

`search_kwargs={"expr": '<partition_key> == in ["xxx", "xxx"]'}`

`<partition_key>`は、パーティションキーとして指定されたフィールド名に置き換えてください。

Milvusは、指定されたパーティションキーに基づいてパーティションを切り替え、パーティションキーに従ってエンティティをフィルタリングし、フィルタリングされたエンティティの中で検索します。

```python
# This will only get documents for Ankush
vectorstore.as_retriever(search_kwargs={"expr": 'namespace == "ankush"'}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at facebook', metadata={'namespace': 'ankush'})]
```

```python
# This will only get documents for Harrison
vectorstore.as_retriever(search_kwargs={"expr": 'namespace == "harrison"'}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at kensho', metadata={'namespace': 'harrison'})]
```

**1つ以上のエンティティを削除またはアップサート(更新/挿入)するには:**

```python
from langchain_community.docstore.document import Document

# Insert data sample
docs = [
    Document(page_content="foo", metadata={"id": 1}),
    Document(page_content="bar", metadata={"id": 2}),
    Document(page_content="baz", metadata={"id": 3}),
]
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
)

# Search pks (primary keys) using expression
expr = "id in [1,2]"
pks = vector_db.get_pks(expr)

# Delete entities by pks
result = vector_db.delete(pks)

# Upsert (Update/Insert)
new_docs = [
    Document(page_content="new_foo", metadata={"id": 1}),
    Document(page_content="new_bar", metadata={"id": 2}),
    Document(page_content="upserted_bak", metadata={"id": 3}),
]
upserted_pks = vector_db.upsert(pks, new_docs)
```
