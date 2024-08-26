---
translated: true
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb)は、LLMアプリケーションで使用されるエンベディングベクトルの検索とストレージのためのAIネイティブデータベースです。

このノートブックでは、`AwaDB`に関連する機能の使用方法を示します。

```python
%pip install --upgrade --quiet  awadb
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import AwaDB
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=100, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
db = AwaDB.from_documents(docs)
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## 類似度検索とスコア

返されるDistance Scoreは0-1の間です。0は類似度が低く、1は最も類似しています。

```python
docs = db.similarity_search_with_score(query)
```

```python
print(docs[0])
```

```output
(Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'}), 0.561813814013747)
```

## 以前に作成して追加したテーブルを復元する

AwaDBは自動的に追加されたドキュメントデータを永続化します。

以前に作成して追加したテーブルを復元できる場合は、以下のように行うことができます:

```python
import awadb

awadb_client = awadb.Client()
ret = awadb_client.Load("langchain_awadb")
if ret:
    print("awadb load table success")
else:
    print("awadb load table failed")
```

awadb load table success
