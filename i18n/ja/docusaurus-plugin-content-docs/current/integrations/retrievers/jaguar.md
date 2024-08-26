---
translated: true
---

# JaguarDBベクトルデータベース

>[JaguarDBベクトルデータベース](http://www.jaguardb.com/windex.html)
>
>1. 分散ベクトルデータベースです
>2. JaguarDBの"ZeroMove"機能により、即座の水平スケーリングが可能です
>3. マルチモーダル: 埋め込み、テキスト、画像、動画、PDF、オーディオ、時系列、地理空間
>4. All-masters: 並列読み書きを可能にします
>5. 異常検知機能
>6. RAGサポート: LLMと独自のリアルタイムデータを組み合わせます
>7. 共有メタデータ: 複数のベクトルインデックス間でのメタデータ共有
>8. 距離メトリック: ユークリッド、コサイン、内積、マンハッタン、チェビシェフ、ハミング、ジャッカード、ミンコフスキー

## 前提条件

このファイルの例を実行するには、2つの要件があります。
1. JaguarDBサーバーとそのHTTPゲートウェイサーバーをインストールして設定する必要があります。
   [www.jaguardb.com](http://www.jaguardb.com)の手順を参照してください。

2. JaguarDBのHTTPクライアントパッケージをインストールする必要があります:
   ```
       pip install -U jaguardb-http-client
   ```

## LangchainとのRAG

このセクションでは、LangchainソフトウェアスタックでLLMとJaguarを組み合わせたチャットを紹介します。

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.jaguar import Jaguar
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

"""
Load a text file into a set of documents
"""
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=300)
docs = text_splitter.split_documents(documents)

"""
Instantiate a Jaguar vector store
"""
### Jaguar HTTP endpoint
url = "http://192.168.5.88:8080/fwww/"

### Use OpenAI embedding model
embeddings = OpenAIEmbeddings()

### Pod is a database for vectors
pod = "vdb"

### Vector store name
store = "langchain_rag_store"

### Vector index name
vector_index = "v"

### Type of the vector index
# cosine: distance metric
# fraction: embedding vectors are decimal numbers
# float: values stored with floating-point numbers
vector_type = "cosine_fraction_float"

### Dimension of each embedding vector
vector_dimension = 1536

### Instantiate a Jaguar store object
vectorstore = Jaguar(
    pod, store, vector_index, vector_type, vector_dimension, url, embeddings
)

"""
Login must be performed to authorize the client.
The environment variable JAGUAR_API_KEY or file $HOME/.jagrc
should contain the API key for accessing JaguarDB servers.
"""
vectorstore.login()


"""
Create vector store on the JaguarDB database server.
This should be done only once.
"""
# Extra metadata fields for the vector store
metadata = "category char(16)"

# Number of characters for the text field of the store
text_size = 4096

#  Create a vector store on the server
vectorstore.create(metadata, text_size)

"""
Add the texts from the text splitter to our vectorstore
"""
vectorstore.add_documents(docs)

""" Get the retriever object """
retriever = vectorstore.as_retriever()
# retriever = vectorstore.as_retriever(search_kwargs={"where": "m1='123' and m2='abc'"})

""" The retriever object can be used with LangChain and LLM """
```

## Jaguarベクトルストアとの対話

ユーザーは、Jaguarベクトルストアに直接アクセスして、類似検索や異常検知を行うことができます。

```python
from langchain_community.vectorstores.jaguar import Jaguar
from langchain_openai import OpenAIEmbeddings

# Instantiate a Jaguar vector store object
url = "http://192.168.3.88:8080/fwww/"
pod = "vdb"
store = "langchain_test_store"
vector_index = "v"
vector_type = "cosine_fraction_float"
vector_dimension = 10
embeddings = OpenAIEmbeddings()
vectorstore = Jaguar(
    pod, store, vector_index, vector_type, vector_dimension, url, embeddings
)

# Login for authorization
vectorstore.login()

# Create the vector store with two metadata fields
# This needs to be run only once.
metadata_str = "author char(32), category char(16)"
vectorstore.create(metadata_str, 1024)

# Add a list of texts
texts = ["foo", "bar", "baz"]
metadatas = [
    {"author": "Adam", "category": "Music"},
    {"author": "Eve", "category": "Music"},
    {"author": "John", "category": "History"},
]
ids = vectorstore.add_texts(texts=texts, metadatas=metadatas)

#  Search similar text
output = vectorstore.similarity_search(
    query="foo",
    k=1,
    metadatas=["author", "category"],
)
assert output[0].page_content == "foo"
assert output[0].metadata["author"] == "Adam"
assert output[0].metadata["category"] == "Music"
assert len(output) == 1

# Search with filtering (where)
where = "author='Eve'"
output = vectorstore.similarity_search(
    query="foo",
    k=3,
    fetch_k=9,
    where=where,
    metadatas=["author", "category"],
)
assert output[0].page_content == "bar"
assert output[0].metadata["author"] == "Eve"
assert output[0].metadata["category"] == "Music"
assert len(output) == 1

# Anomaly detection
result = vectorstore.is_anomalous(
    query="dogs can jump high",
)
assert result is False

# Remove all data in the store
vectorstore.clear()
assert vectorstore.count() == 0

# Remove the store completely
vectorstore.drop()

# Logout
vectorstore.logout()
```
