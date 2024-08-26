---
sidebar_label: Upstage
translated: true
---

# UpstageEmbeddings

このノートブックでは、Upstage埋め込みモデルの使い始め方について説明します。

## インストール

`langchain-upstage`パッケージをインストールします。

```bash
pip install -U langchain-upstage
```

## 環境設定

以下の環境変数を設定する必要があります:

- `UPSTAGE_API_KEY`: [Upstage console](https://console.upstage.ai/)から取得したUpstage APIキー。

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

## 使用方法

`UpstageEmbeddings`クラスを初期化します。

```python
from langchain_upstage import UpstageEmbeddings

embeddings = UpstageEmbeddings()
```

`embed_documents`を使用して、テキストやドキュメントのリストを埋め込みます。

```python
doc_result = embeddings.embed_documents(
    ["Sam is a teacher.", "This is another document"]
)
print(doc_result)
```

`embed_query`を使用してクエリ文字列を埋め込みます。

```python
query_result = embeddings.embed_query("What does Sam do?")
print(query_result)
```

`aembed_documents`と`aembed_query`を使用して非同期操作を行います。

```python
# async embed query
await embeddings.aembed_query("My query to look up")
```

```python
# async embed documents
await embeddings.aembed_documents(
    ["This is a content of the document", "This is another document"]
)
```

## ベクトルストアと併用する

`UpstageEmbeddings`をベクトルストアコンポーネントと併用できます。以下に簡単な例を示します。

```python
from langchain_community.vectorstores import DocArrayInMemorySearch

vectorstore = DocArrayInMemorySearch.from_texts(
    ["harrison worked at kensho", "bears like to eat honey"],
    embedding=UpstageEmbeddings(),
)
retriever = vectorstore.as_retriever()
docs = retriever.invoke("Where did Harrison work?")
print(docs)
```
