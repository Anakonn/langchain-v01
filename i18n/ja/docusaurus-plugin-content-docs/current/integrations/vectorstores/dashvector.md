---
translated: true
---

# DashVector

> [DashVector](https://help.aliyun.com/document_detail/2510225.html)は、高次元の密な及び疎なベクトル、リアルタイムの挿入とフィルタリング検索をサポートする完全に管理されたベクターDBサービスです。自動的にスケーリングするように構築されており、さまざまなアプリケーション要件に適応できます。

このノートブックでは、`DashVector`ベクトルデータベースに関連する機能の使用方法を示します。

DashVectorを使用するには、APIキーが必要です。
[インストール手順](https://help.aliyun.com/document_detail/2510223.html)はこちらです。

## インストール

```python
%pip install --upgrade --quiet  dashvector dashscope
```

`DashScopeEmbeddings`を使用したいので、DashscopeのAPIキーも取得する必要があります。

```python
import getpass
import os

os.environ["DASHVECTOR_API_KEY"] = getpass.getpass("DashVector API Key:")
os.environ["DASHSCOPE_API_KEY"] = getpass.getpass("DashScope API Key:")
```

## 例

```python
from langchain_community.embeddings.dashscope import DashScopeEmbeddings
from langchain_community.vectorstores import DashVector
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = DashScopeEmbeddings()
```

ドキュメントからDashVectorを作成できます。

```python
dashvector = DashVector.from_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = dashvector.similarity_search(query)
print(docs)
```

メタデータとIDを持つテキストを追加し、メタフィルターで検索できます。

```python
texts = ["foo", "bar", "baz"]
metadatas = [{"key": i} for i in range(len(texts))]
ids = ["0", "1", "2"]

dashvector.add_texts(texts, metadatas=metadatas, ids=ids)

docs = dashvector.similarity_search("foo", filter="key = 2")
print(docs)
```

```output
[Document(page_content='baz', metadata={'key': 2})]
```

### `partition`パラメータの操作

`partition`パラメータはデフォルトで設定されており、存在しない`partition`パラメータが渡された場合、`partition`が自動的に作成されます。

```python
texts = ["foo", "bar", "baz"]
metadatas = [{"key": i} for i in range(len(texts))]
ids = ["0", "1", "2"]
partition = "langchain"

# add texts
dashvector.add_texts(texts, metadatas=metadatas, ids=ids, partition=partition)

# similarity search
query = "What did the president say about Ketanji Brown Jackson"
docs = dashvector.similarity_search(query, partition=partition)

# delete
dashvector.delete(ids=ids, partition=partition)
```
