---
sidebar_label: Nomic
translated: true
---

# NomicEmbeddings

このノートブックでは、Nomic埋め込みモデルの使い始め方について説明します。

## インストール

```python
# install package
!pip install -U langchain-nomic
```

## 環境設定

以下の環境変数を設定してください:

- `NOMIC_API_KEY`

## 使用方法

```python
from langchain_nomic.embeddings import NomicEmbeddings

embeddings = NomicEmbeddings(model="nomic-embed-text-v1.5")
```

```python
embeddings.embed_query("My query to look up")
```

```python
embeddings.embed_documents(
    ["This is a content of the document", "This is another document"]
)
```

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

### カスタムの次元数

Nomic の `nomic-embed-text-v1.5` モデルは、[Matryoshka learning](https://blog.nomic.ai/posts/nomic-embed-matryoshka) によってトレーニングされており、単一のモデルで可変長の埋め込みを可能にしています。これにより、推論時に埋め込みの次元数を指定できます。このモデルは64から768の次元数をサポートしています。

```python
embeddings = NomicEmbeddings(model="nomic-embed-text-v1.5", dimensionality=256)

embeddings.embed_query("My query to look up")
```
