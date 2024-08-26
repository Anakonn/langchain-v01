---
translated: true
---

# viking DB

>[viking DB](https://www.volcengine.com/docs/6459/1163946)は、深層ニューラルネットワークやその他のマシンラーニング(ML)モデルによって生成された大規模な埋め込みベクトルを保存、インデックス化、管理するデータベースです。

このノートブックでは、VikingDB ベクトルデータベースに関連する機能の使用方法を示します。

実行するには、[viking DB インスタンスを起動している](https://www.volcengine.com/docs/6459/1165058)必要があります。

```python
!pip install --upgrade volcengine
```

VikingDBEmbeddingsを使用したいので、VikingDB APIキーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain.document_loaders import TextLoader
from langchain_community.vectorstores.vikingdb import VikingDB, VikingDBConfig
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
loader = TextLoader("./test.txt")
documents = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=10, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
db = VikingDB.from_documents(
    docs,
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    drop_old=True,
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
docs[0].page_content
```

### viking DBコレクションでデータを区分する

同じvikingDB インスタンス内で、関連性のない異なるドキュメントを別のコレクションに保存することで、コンテキストを維持できます。

新しいコレクションを作成する方法は以下の通りです。

```python
db = VikingDB.from_documents(
    docs,
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    collection_name="collection_1",
    drop_old=True,
)
```

保存したコレクションを取得する方法は以下の通りです。

```python
db = VikingDB.from_documents(
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    collection_name="collection_1",
)
```

取得後は、通常通りクエリを実行できます。
