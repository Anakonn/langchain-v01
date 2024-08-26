---
translated: true
---

# Amazon Document DB

>[Amazon DocumentDB (with MongoDB Compatibility)](https://docs.aws.amazon.com/documentdb/) は、クラウド上でMongoDB互換のデータベースを簡単に設定、運用、スケーリングできるようにします。
>Amazon DocumentDBを使うと、MongoDBで使用するのと同じアプリケーションコードやドライバー、ツールを使うことができます。
>Amazon DocumentDBのベクトル検索は、JSONベースのドキュメントデータベースの柔軟性と豊富な問い合わせ機能に、ベクトル検索の力を組み合わせたものです。

このノートブックでは、[Amazon Document DB Vector Search](https://docs.aws.amazon.com/documentdb/latest/developerguide/vector-search.html)を使ってドキュメントをコレクションに保存し、インデックスを作成し、"cosine"、"euclidean"、"dotProduct"などの近似最近傍アルゴリズムを使ってベクトル検索クエリを実行する方法を示します。デフォルトでは、DocumentDBは階層的ナビゲーション可能な小さな世界(HNSW)インデックスを作成します。サポートされているその他のベクトルインデックスタイプについては、上記のリンク先のドキュメントを参照してください。

DocumentDBを使うには、まずクラスターをデプロイする必要があります。詳細については[開発者ガイド](https://docs.aws.amazon.com/documentdb/latest/developerguide/what-is.html)を参照してください。

[無料で始める](https://aws.amazon.com/free/)

```python
!pip install pymongo
```

```python
import getpass

# DocumentDB connection string
# i.e., "mongodb://{username}:{pass}@{cluster_endpoint}:{port}/?{params}"
CONNECTION_STRING = getpass.getpass("DocumentDB Cluster URI:")

INDEX_NAME = "izzy-test-index"
NAMESPACE = "izzy_test_db.izzy_test_collection"
DB_NAME, COLLECTION_NAME = NAMESPACE.split(".")
```

`OpenAIEmbeddings`を使用したいので、OpenAI環境変数を設定する必要があります。

```python
import getpass
import os

# Set up the OpenAI Environment Variables
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["OPENAI_EMBEDDINGS_DEPLOYMENT"] = (
    "smart-agent-embedding-ada"  # the deployment name for the embedding model
)
os.environ["OPENAI_EMBEDDINGS_MODEL_NAME"] = "text-embedding-ada-002"  # the model name
```

次に、ドキュメントをコレクションにロードし、インデックスを作成し、インデックスに対してクエリを実行します。

特定のパラメーターについて質問がある場合は、[ドキュメンテーション](https://docs.aws.amazon.com/documentdb/latest/developerguide/vector-search.html)を参照してください。

```python
from langchain.document_loaders import TextLoader
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores.documentdb import (
    DocumentDBSimilarityType,
    DocumentDBVectorSearch,
)

SOURCE_FILE_NAME = "../../modules/state_of_the_union.txt"

loader = TextLoader(SOURCE_FILE_NAME)
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

# OpenAI Settings
model_deployment = os.getenv(
    "OPENAI_EMBEDDINGS_DEPLOYMENT", "smart-agent-embedding-ada"
)
model_name = os.getenv("OPENAI_EMBEDDINGS_MODEL_NAME", "text-embedding-ada-002")


openai_embeddings: OpenAIEmbeddings = OpenAIEmbeddings(
    deployment=model_deployment, model=model_name
)
```

```python
from pymongo import MongoClient

INDEX_NAME = "izzy-test-index-2"
NAMESPACE = "izzy_test_db.izzy_test_collection"
DB_NAME, COLLECTION_NAME = NAMESPACE.split(".")

client: MongoClient = MongoClient(CONNECTION_STRING)
collection = client[DB_NAME][COLLECTION_NAME]

model_deployment = os.getenv(
    "OPENAI_EMBEDDINGS_DEPLOYMENT", "smart-agent-embedding-ada"
)
model_name = os.getenv("OPENAI_EMBEDDINGS_MODEL_NAME", "text-embedding-ada-002")

vectorstore = DocumentDBVectorSearch.from_documents(
    documents=docs,
    embedding=openai_embeddings,
    collection=collection,
    index_name=INDEX_NAME,
)

# number of dimensions used by model above
dimensions = 1536

# specify similarity algorithm, valid options are:
#   cosine (COS), euclidean (EUC), dotProduct (DOT)
similarity_algorithm = DocumentDBSimilarityType.COS

vectorstore.create_index(dimensions, similarity_algorithm)
```

```output
{ 'createdCollectionAutomatically' : false,
   'numIndexesBefore' : 1,
   'numIndexesAfter' : 2,
   'ok' : 1,
   'operationTime' : Timestamp(1703656982, 1)}
```

```python
# perform a similarity search between the embedding of the query and the embeddings of the documents
query = "What did the President say about Ketanji Brown Jackson"
docs = vectorstore.similarity_search(query)
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

ドキュメントのロードとインデックスの作成が完了したら、ベクトルストアを直接インスタンス化してインデックスに対してクエリを実行できます。

```python
vectorstore = DocumentDBVectorSearch.from_connection_string(
    connection_string=CONNECTION_STRING,
    namespace=NAMESPACE,
    embedding=openai_embeddings,
    index_name=INDEX_NAME,
)

# perform a similarity search between a query and the ingested documents
query = "What did the president say about Ketanji Brown Jackson"
docs = vectorstore.similarity_search(query)
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

```python
# perform a similarity search between a query and the ingested documents
query = "Which stats did the President share about the U.S. economy"
docs = vectorstore.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
And unlike the $2 Trillion tax cut passed in the previous administration that benefitted the top 1% of Americans, the American Rescue Plan helped working people—and left no one behind.

And it worked. It created jobs. Lots of jobs.

In fact—our economy created over 6.5 Million new jobs just last year, more jobs created in one year
than ever before in the history of America.

Our economy grew at a rate of 5.7% last year, the strongest growth in nearly 40 years, the first step in bringing fundamental change to an economy that hasn’t worked for the working people of this nation for too long.

For the past 40 years we were told that if we gave tax breaks to those at the very top, the benefits would trickle down to everyone else.

But that trickle-down theory led to weaker economic growth, lower wages, bigger deficits, and the widest gap between those at the top and everyone else in nearly a century.
```

## Question Answering

```python
qa_retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 25},
)
```

```python
from langchain_core.prompts import PromptTemplate

prompt_template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
"""
PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)
```

```python
from langchain.chains import RetrievalQA
from langchain_openai import OpenAI

qa = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=qa_retriever,
    return_source_documents=True,
    chain_type_kwargs={"prompt": PROMPT},
)

docs = qa({"query": "gpt-4 compute requirements"})

print(docs["result"])
print(docs["source_documents"])
```
