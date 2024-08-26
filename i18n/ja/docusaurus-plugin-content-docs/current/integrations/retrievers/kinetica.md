---
translated: true
---

# Kinetica ベクトルストアベースのリトリーバー

>[Kinetica](https://www.kinetica.com/) はベクトル類似検索を統合サポートするデータベースです。

以下をサポートしています:
- 正確および近似最近傍検索
- L2 距離、内積、コサイン距離

このノートブックでは、Kinetica ベクトルストア (`Kinetica`) ベースのリトリーバーの使用方法を示します。

```python
# Please ensure that this connector is installed in your working environment.
%pip install gpudb==7.2.0.1
```

OpenAI API キーを取得する必要があるため、`OpenAIEmbeddings` を使用したいと思います。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
## Loading Environment Variables
from dotenv import load_dotenv

load_dotenv()
```

```python
from langchain.docstore.document import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import (
    Kinetica,
    KineticaSettings,
)
from langchain_openai import OpenAIEmbeddings
```

```python
# Kinetica needs the connection to the database.
# This is how to set it up.
HOST = os.getenv("KINETICA_HOST", "http://127.0.0.1:9191")
USERNAME = os.getenv("KINETICA_USERNAME", "")
PASSWORD = os.getenv("KINETICA_PASSWORD", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


def create_config() -> KineticaSettings:
    return KineticaSettings(host=HOST, username=USERNAME, password=PASSWORD)
```

## ベクトルストアからリトリーバーを作成する

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

# The Kinetica Module will try to create a table with the name of the collection.
# So, make sure that the collection name is unique and the user has the permission to create a table.

COLLECTION_NAME = "state_of_the_union_test"
connection = create_config()

db = Kinetica.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=COLLECTION_NAME,
    config=connection,
)

# create retriever from the vector store
retriever = db.as_retriever(search_kwargs={"k": 2})
```

## リトリーバーで検索する

```python
result = retriever.get_relevant_documents(
    "What did the president say about Ketanji Brown Jackson"
)
print(docs[0].page_content)
```
